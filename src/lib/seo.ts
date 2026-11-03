import 'server-only';
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { parseNamedMetaTags } from '@/lib/seo-html';
import { CATALOGUE_REVALIDATE_SECONDS } from '@/lib/cache-ttl';
import { PRODUCT_OFFER_SCHEMA_ENABLED } from '@/config/features';
import { ownedSchemaTypes } from '@/lib/structured-data/graph';
import { stripOwnedJsonLd } from '@/lib/structured-data/pasted-json-ld';
import { fillVendorCountDeep } from '@/lib/vendor-count';
import { followRedirects, rowToSeoRedirect, type SeoRedirect, type SeoRedirectRow } from '@/lib/seo-redirects';
import { getPageQualityIndex, getSupplierTextContext } from '@/lib/seo/page-quality';
import { QUALITY_RULES_ENFORCED } from '@/config/seo-quality';
import {
  indexDecision,
  isProductionDeployment,
  pageTypeForPath,
  staticPageDecision,
  type IndexDecision,
  type PageQualityFacts,
} from '@/lib/seo/indexing';
import { cleanSeoText, qualifyClaims, qualifyTitleClaims } from '@/lib/seo/text';

export {
  clearRedirectCache,
  getRedirectTarget,
  getSupplierSlugAliases,
  rowToSeoRedirect,
  supplierSlugAliases,
  type SeoRedirect,
} from '@/lib/seo-redirects';

/** Revalidated by every save in /admin/seo. */
export const SEO_CACHE_TAG = 'seo';

/** Manual workflow status, set from the SEO edit dialog. Unset until chosen. */
export type SeoTaskStatus = 'needs-work' | 'pending' | 'done';

export interface SeoOverride {
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  headHtml: string | null;
  bodyHtml: string | null;
  taskStatus: SeoTaskStatus | null;
  /** The "Ready to index" tick (0031). False on a row created after that migration until someone ticks it. */
  readyToIndex: boolean;
  /** When "Ready to index" was last ticked, for the "made indexable in the last 7 days" counter. */
  readyToIndexAt: string | null;
  updatedAt: string;
}

/** Snake_case row in `seo_pages` (0010_seo_management.sql). */
export interface SeoPageRow {
  path: string;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  keywords: string[] | null;
  canonical_url: string | null;
  og_image_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  head_html: string | null;
  body_html: string | null;
  task_status: string | null;
  /** Added by 0031_seo_quality.sql; undefined until that migration runs. */
  ready_to_index?: boolean;
  ready_to_index_at?: string | null;
  updated_at: string;
}

const TASK_STATUSES: readonly SeoTaskStatus[] = ['needs-work', 'pending', 'done'];

function toTaskStatus(value: string | null): SeoTaskStatus | null {
  return TASK_STATUSES.includes(value as SeoTaskStatus) ? (value as SeoTaskStatus) : null;
}

export function rowToSeoOverride(row: SeoPageRow): SeoOverride {
  return {
    path: row.path,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    h1: row.h1,
    keywords: row.keywords ?? [],
    canonicalUrl: row.canonical_url,
    ogImageUrl: row.og_image_url,
    robotsIndex: row.robots_index,
    robotsFollow: row.robots_follow,
    headHtml: row.head_html,
    bodyHtml: row.body_html,
    taskStatus: toTaskStatus(row.task_status),
    // Before 0031 there is no tick; every saved page was live then, so it counts as ready.
    readyToIndex: row.ready_to_index ?? true,
    readyToIndexAt: row.ready_to_index_at ?? null,
    updatedAt: row.updated_at,
  };
}

interface SeoData {
  pages: SeoOverride[];
  redirects: SeoRedirect[];
}

/** A failure to reach Supabase at all, as opposed to the query itself being rejected. */
class SeoNetworkError extends Error {}

/**
 * Last successful read, held in module scope so it survives between requests
 * in a server process. Lets a transient Supabase blip serve real overrides
 * rather than failing the read outright.
 */
let lastGoodSeoData: SeoData | null = null;
let lastGoodVendorCount: number | null = null;

function isNetworkFailure(message: string): boolean {
  return /fetch failed|network|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|socket/i.test(message);
}

/**
 * Every override and redirect in two small queries, cached for the whole site.
 * Pages look up their own row from this rather than querying per request.
 */
const getSeoDataCached = unstable_cache(
  async (): Promise<SeoData> => {
    const client = getSupabaseServerClient();
    if (!client) return { pages: [], redirects: [] };

    // The supplier count fills `{vendorCount}` in admin-written titles and
    // descriptions. It is counted here with its own query, using the same
    // active-only filter as the directory.
    const [pages, redirects, activeSuppliers] = await Promise.all([
      client.from('seo_pages').select('*'),
      client.from('seo_redirects').select('from_path, to_path, created_at'),
      client.from('suppliers').select('slug', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    // A dropped connection must not be cached as "no overrides": that would
    // silently strip every SEO override from the site until the cache next
    // revalidated. Serving the last good snapshot keeps the data correct and,
    // unlike throwing, doesn't surface a request-level error for what is a
    // recoverable blip. Before any successful read there is nothing safe to
    // serve, so that case still throws and getSeoData() falls back below.
    const networkFailure = [pages, redirects, activeSuppliers]
      .map((result) => result.error)
      .find((error) => error && isNetworkFailure(error.message));
    if (networkFailure) {
      if (lastGoodSeoData) {
        console.warn('[seo] Supabase unreachable, serving last known overrides:', networkFailure.message);
        return lastGoodSeoData;
      }
      throw new SeoNetworkError(networkFailure.message);
    }

    // Before 0010_seo_management.sql has run both tables are missing. Pages
    // must keep rendering with their defaults, so this degrades to "no
    // overrides" and says why in the server log.
    if (pages.error) console.warn('[seo] seo_pages could not be read:', pages.error.message);
    if (redirects.error) console.warn('[seo] seo_redirects could not be read:', redirects.error.message);
    if (activeSuppliers.error) console.warn('[seo] supplier count could not be read:', activeSuppliers.error.message);

    // Without a count, "across {vendorCount} suppliers" still reads naturally as "across all suppliers".
    const vendorCount = activeSuppliers.count ?? lastGoodVendorCount ?? 'all';
    if (activeSuppliers.count !== null) lastGoodVendorCount = activeSuppliers.count;

    const data: SeoData = {
      pages: pages.error
        ? []
        : ((pages.data ?? []) as SeoPageRow[]).map((row) => fillVendorCountDeep(rowToSeoOverride(row), vendorCount)),
      redirects: redirects.error ? [] : ((redirects.data ?? []) as SeoRedirectRow[]).map(rowToSeoRedirect),
    };
    lastGoodSeoData = data;
    return data;
  },
  ['seo-data'],
  // 'suppliers' is revalidated on every vendor save, so a filled-in count follows the directory straight away.
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: [SEO_CACHE_TAG, 'suppliers'] },
);

/**
 * The cached SEO data, retried once on a network blip. If Supabase still can't
 * be reached the page renders with its default SEO for this request only; the
 * next request tries again rather than inheriting a cached failure.
 */
async function getSeoData(): Promise<SeoData> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await getSeoDataCached();
    } catch (error) {
      if (!(error instanceof SeoNetworkError)) throw error;
      if (attempt >= 2) {
        console.warn('[seo] Supabase unreachable, using default SEO for this request:', error.message);
        return { pages: [], redirects: [] };
      }
    }
  }
}

export async function getSeoOverride(path: string): Promise<SeoOverride | null> {
  const { pages } = await getSeoData();
  return pages.find((page) => page.path === path) ?? null;
}

/** Every override, keyed by path, for code that needs them all at once (the sitemap). */
export async function getSeoOverridesByPath(): Promise<ReadonlyMap<string, SeoOverride>> {
  const { pages } = await getSeoData();
  return new Map(pages.map((page) => [page.path, page]));
}

/**
 * Rewrites hard-coded internal links (nav menus, featured quick links) to a
 * renamed page's current address, so they never point at an old slug.
 */
export async function getHrefResolver(): Promise<(href: string) => string> {
  const { redirects } = await getSeoData();
  if (redirects.length === 0) return (href) => href;
  return (href) => {
    if (!href.startsWith('/')) return href;
    const suffixAt = href.search(/[?#]/);
    const pathname = suffixAt === -1 ? href : href.slice(0, suffixAt);
    const suffix = suffixAt === -1 ? '' : href.slice(suffixAt);
    return followRedirects(pathname, redirects) + suffix;
  };
}

function titleText(title: Metadata['title']): string | undefined {
  if (!title) return undefined;
  if (typeof title === 'string') return title;
  if ('absolute' in title) return title.absolute;
  return title.default;
}

/**
 * The indexing decision for one path, from the single rule in
 * src/lib/seo/indexing.ts. A path with no quality facts (a static page, or a
 * product the catalogue no longer lists) is judged on the deployment and its
 * /admin/seo switch alone.
 */
export async function getIndexDecision(path: string): Promise<IndexDecision> {
  const [quality, override] = await Promise.all([getPageQualityIndex(), getSeoOverride(path)]);
  return decide(path, quality.facts[path], override);
}

/** Decisions for many paths at once (the sitemap, the admin, the SEO jobs), from one read of each source. */
export async function getIndexDecisions(paths: readonly string[]): Promise<Map<string, IndexDecision>> {
  const [quality, overrides] = await Promise.all([getPageQualityIndex(), getSeoOverridesByPath()]);
  return new Map(paths.map((path) => [path, decide(path, quality.facts[path], overrides.get(path) ?? null)]));
}

/**
 * The decision for one path from facts and an override the caller already
 * holds; the admin passes the rows it has just read, so a save shows at once.
 */
export function indexDecisionFor(
  path: string,
  facts: PageQualityFacts | undefined,
  override: SeoOverride | null,
): IndexDecision {
  return decide(path, facts, override);
}

function decide(path: string, facts: PageQualityFacts | undefined, override: SeoOverride | null): IndexDecision {
  const context = {
    isProduction: isProductionDeployment(),
    adminRobotsIndex: override ? override.robotsIndex : null,
    readyToIndex: override ? override.readyToIndex : null,
    now: new Date(),
  };
  const type = pageTypeForPath(path);
  if (facts && facts.type === type) return indexDecision(facts, context);
  if (type === 'static') return staticPageDecision(path, context);
  // The index holds every published guide, so a guide missing from it is a draft: never indexed.
  if (type === 'guide') {
    return indexDecision({ type: 'guide', reviewedByMe: false, hasContent: true, isPublished: false }, context);
  }
  // A supplier switched off in the admin (and its coupon and reviews pages)
  // still answers, outside the directory and the sitemap. Being inactive is a
  // quality rule like the others: reported always, and only taken out of
  // search while that page type's rules are enforced.
  const decision = staticPageDecision(path, context);
  const failure = type === 'product' ? 'product is not in the live catalogue' : 'supplier is not active';
  const enforced = QUALITY_RULES_ENFORCED[type];
  return {
    ...decision,
    indexable: decision.indexable && !enforced,
    reasons: enforced ? [...decision.reasons, failure] : decision.reasons,
    qualityFailures: [failure],
    enforced,
  };
}

/**
 * The title and description exactly as they reach search engines: "★" and
 * emoji removed (whatever was typed in the admin), a rating number dropped
 * when the supplier has no rating, and the same-day/purity wording fixed.
 * Supplier pages keep their researched wording: only the stars come out.
 */
export async function cleanPageText(
  path: string,
  text: { title: string; description: string },
): Promise<{ title: string; description: string }> {
  const context = await getSupplierTextContext(path);
  const hasRating = context?.hasRating ?? false;
  if (pageTypeForPath(path) === 'supplier') {
    return { title: cleanSeoText(text.title, { hasRating }), description: cleanSeoText(text.description, { hasRating }) };
  }
  return {
    title: qualifyTitleClaims(cleanSeoText(text.title, { hasRating })),
    description: cleanSeoText(context ? qualifyClaims(text.description, context) : text.description, { hasRating }),
  };
}

/** A page's meta keywords carry only its first few, most relevant terms, in the order they were saved. */
const MAX_META_KEYWORDS = 3;

function pageKeywords(keywords: Metadata['keywords']): Metadata['keywords'] {
  if (!keywords) return keywords;
  const list = (Array.isArray(keywords) ? keywords : keywords.split(','))
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  return list.length > 0 ? list.slice(0, MAX_META_KEYWORDS) : undefined;
}

/**
 * Layers a page's /admin/seo override (if any) on top of its default
 * metadata, cleans the title and description, and sets the robots tag from
 * the page's indexing decision. A page nobody has edited gets its defaults.
 */
export async function withSeo(path: string, base: Metadata): Promise<Metadata> {
  const [seo, decision] = await Promise.all([getSeoOverride(path), getIndexDecision(path)]);

  const rawTitle = seo?.metaTitle ? seo.metaTitle : titleText(base.title);
  const rawDescription = seo?.metaDescription ?? (typeof base.description === 'string' ? base.description : null);
  const cleaned = await cleanPageText(path, { title: rawTitle ?? '', description: rawDescription ?? '' });
  const title = rawTitle ? { absolute: cleaned.title } : base.title;
  const description = rawDescription ? cleaned.description : base.description;
  const canonical = seo?.canonicalUrl ?? base.alternates?.canonical;
  const follow = seo?.robotsFollow ?? true;
  const robots = !decision.indexable ? { index: false, follow } : follow ? base.robots : { index: true, follow: false };

  return {
    ...base,
    title,
    description,
    keywords: pageKeywords(seo && seo.keywords.length > 0 ? seo.keywords : base.keywords),
    alternates: { ...base.alternates, canonical },
    ...(robots ? { robots } : {}),
    // Social tags have always come from the override alone; a page nobody edited keeps the base ones.
    ...(seo
      ? {
          openGraph: {
            ...(rawTitle ? { title: cleaned.title } : {}),
            ...(description ? { description } : {}),
            ...(typeof canonical === 'string' ? { url: canonical } : {}),
            ...(seo.ogImageUrl ? { images: [seo.ogImageUrl] } : {}),
          },
          other: { ...base.other, ...(seo.headHtml ? parseNamedMetaTags(seo.headHtml) : {}) },
        }
      : {}),
  };
}

export interface SeoInjection {
  headHtml: string | null;
  bodyHtml: string | null;
}

/**
 * Custom head/body HTML by path, only for pages that actually have some.
 * Pasted JSON-LD of a type the page already outputs is dropped here, before it
 * reaches the browser, so no page ever carries a type twice.
 */
export async function getSeoInjections(): Promise<Record<string, SeoInjection>> {
  const { pages } = await getSeoData();
  return Object.fromEntries(
    pages
      .filter((page) => page.headHtml || page.bodyHtml)
      .map((page) => {
        const owned = ownedSchemaTypes(page.path, { productOffers: PRODUCT_OFFER_SCHEMA_ENABLED });
        const clean = (html: string | null) => (html ? stripOwnedJsonLd(html, owned) || null : null);
        return [page.path, { headHtml: clean(page.headHtml), bodyHtml: clean(page.bodyHtml) }];
      }),
  );
}
