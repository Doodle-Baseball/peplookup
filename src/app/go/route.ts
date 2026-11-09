import { after, NextResponse, type NextRequest } from 'next/server';
import { slugSchema, type Supplier } from '@/lib/schema';
import { getAllOffers, getSupplier, getSuppliers } from '@/lib/repository';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSuppliersFromDb } from '@/lib/supabase/suppliers';
import { getRedirectTarget } from '@/lib/seo';
import { parseClickSource } from '@/lib/extension/schema';
import { isLikelyBot, isPrefetchRequest } from '@/lib/extension/bots';
import { recordAffiliateClick } from '@/lib/extension/store';
import { gaClientIdFromCookie, sendAffiliateClickEvent } from '@/lib/extension/ga4';

/**
 * Header equivalent of rel="nofollow": crawlers that reach /go directly must
 * not index it or pass authority on to the vendor. Set on every response, the
 * homepage fallbacks included, so no /go URL is ever indexable.
 */
function redirectWithoutIndexing(target: URL, status: 302 | 307 = 307): NextResponse {
  const response = NextResponse.redirect(target, { status });
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

/**
 * A supplier by slug, following a slug renamed in /admin/seo (old "-2"
 * addresses included). Inactive suppliers still resolve: their profile page
 * still renders a shop link, which went to their affiliate link before.
 */
async function supplierForSlug(slug: string): Promise<Supplier | null> {
  const supplier = await getSupplier(slug);
  if (supplier) return supplier;
  const renamedTo = await getRedirectTarget(`/supplier/${slug}`);
  if (!renamedTo?.startsWith('/supplier/')) return null;
  return getSupplier(renamedTo.slice('/supplier/'.length));
}

/** Sites the site links out to through /go besides suppliers' own. */
const ALWAYS_ALLOWED_HOSTS = ['trustpilot.com', 'skool.com'];

/** How long the allowed-host list is reused before it is rebuilt. */
const ALLOWED_HOSTS_TTL_MS = 10 * 60 * 1000;

/** The last list built, held in module scope so a click doesn't query the database each time. */
let allowedHostsSnapshot: { hosts: ReadonlySet<string>; expiresAt: number } | null = null;

/** A URL's hostname, lower-cased, without a trailing dot or a leading "www.". */
function bareHost(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Every host a /go?to=<url> link may lead to: each supplier's website and
 * affiliate link, and the host of every product page it lists. Inactive
 * suppliers are included: their profile pages still render buy links.
 */
async function allowedHosts(): Promise<ReadonlySet<string>> {
  const now = Date.now();
  if (allowedHostsSnapshot && allowedHostsSnapshot.expiresAt > now) return allowedHostsSnapshot.hosts;

  const client = getSupabaseServerClient();
  const [allSuppliers, offers] = await Promise.all([
    client ? fetchSuppliersFromDb(client, { includeInactive: true }) : null,
    getAllOffers(),
  ]);
  const suppliers = allSuppliers ?? (await getSuppliers());
  const hosts = new Set<string>(ALWAYS_ALLOWED_HOSTS);
  for (const supplier of suppliers) {
    for (const host of [bareHost(supplier.homepageUrl), bareHost(supplier.affiliateUrl)]) if (host) hosts.add(host);
  }
  for (const offer of offers) {
    const host = bareHost(offer.productUrl);
    if (host) hosts.add(host);
  }
  // Only a complete read is kept; a failed supplier query is retried on the next click.
  if (allSuppliers) allowedHostsSnapshot = { hosts, expiresAt: now + ALLOWED_HOSTS_TTL_MS };
  return hosts;
}

/** Exact hostname match, or a subdomain of an allowed host; never a substring check. */
function isAllowedHost(hostname: string, hosts: ReadonlySet<string>): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  for (const allowed of hosts) {
    if (host === allowed || host.endsWith(`.${allowed}`)) return true;
  }
  return false;
}

/** The rejected value only, never anything about the visitor, so a wrongly blocked supplier link can be spotted. */
function rejected(to: string, home: URL): NextResponse {
  console.warn('[go] rejected destination:', to);
  return redirectWithoutIndexing(home);
}

/** A repeat click on the same supplier within this window counts once. */
const REPEAT_CLICK_WINDOW_SECONDS = 600;

/**
 * Marks "this browser's click on this supplier was counted" for the repeat
 * window. Holds no identifier, just "1", and is only sent back to /go.
 */
function repeatClickCookie(supplierSlug: string): string {
  return `pl_go_${supplierSlug}`;
}

/**
 * `/go?to=<supplier-slug>&src=extension|website`: the extension's offer link
 * and the site's shop links. Sends the visitor to the supplier's affiliate link
 * exactly as saved in the admin, so the referral stays ours, and counts the
 * click by source. Bots, prefetches and a repeat click within 10 minutes are
 * redirected without being counted. Logging and the GA4 event run after the
 * redirect is sent, so a slow or failed write never holds up the visitor.
 */
async function redirectToSupplier(request: NextRequest, slug: string, home: URL): Promise<NextResponse> {
  const supplier = await supplierForSlug(slug);
  if (!supplier) return rejected(slug, home);

  let target: URL;
  try {
    target = new URL(supplier.affiliateUrl);
  } catch {
    return redirectWithoutIndexing(home);
  }

  const response = redirectWithoutIndexing(target, 302);
  // Every click has to reach this handler to be counted, so no shared cache may answer it.
  response.headers.set('Cache-Control', 'private, no-store');

  const cookieName = repeatClickCookie(supplier.slug);
  const counted =
    !isLikelyBot(request.headers.get('user-agent')) &&
    !isPrefetchRequest(request.headers) &&
    !request.cookies.has(cookieName);
  if (!counted) return response;

  const source = parseClickSource(request.nextUrl.searchParams.get('src'));
  const clientId = gaClientIdFromCookie(request.cookies.get('_ga')?.value);
  after(async () => {
    const results = await Promise.allSettled([
      recordAffiliateClick(supplier.slug, source),
      sendAffiliateClickEvent({ clientId, supplierSlug: supplier.slug, source }),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') console.error('[go] click tracking failed:', result.reason);
    }
  });

  response.cookies.set(cookieName, '1', {
    maxAge: REPEAT_CLICK_WINDOW_SECONDS,
    path: '/go',
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });
  return response;
}

/**
 * Outbound redirect for every affiliate/product link on the site
 * (`/go?to=<encoded url>`), so real clicks never leave `window.location`
 * pointed straight at a third-party domain without passing through here.
 * `to` must be an absolute http(s) URL on a supplier's own host (or
 * Trustpilot or Skool); anything else (missing, malformed, a non-http scheme
 * like `javascript:`, or any other site) falls back to the homepage instead
 * of forwarding it, so this can never become an open redirect.
 * A bare supplier slug (supplier shop links and the extension) is handled by redirectToSupplier.
 */
export async function GET(request: NextRequest) {
  const home = new URL('/', request.url);
  const to = request.nextUrl.searchParams.get('to');
  if (!to) return redirectWithoutIndexing(home);

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    // Not a URL: forwarded only when it is a supplier slug, and then only to
    // that supplier's own saved affiliate link, never to anything in the query.
    const slug = slugSchema.safeParse(to);
    return slug.success ? redirectToSupplier(request, slug.data, home) : rejected(to, home);
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') return rejected(to, home);
  if (!isAllowedHost(target.hostname, await allowedHosts())) return rejected(to, home);

  // The URL is already resolved from the supplier or offer record. Keeping it
  // intact ensures an admin edit is reflected everywhere immediately.
  const response = redirectWithoutIndexing(target);
  // The target is a pure function of the query string, so the CDN can answer a
  // repeat click (or a crawler following the link) without running this again.
  response.headers.set('Cache-Control', 'public, s-maxage=3600');
  return response;
}
