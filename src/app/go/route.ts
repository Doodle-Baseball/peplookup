import { NextResponse, type NextRequest } from 'next/server';

/**
 * Header equivalent of rel="nofollow": crawlers that reach /go directly must
 * not index it or pass authority on to the vendor. Set on every response, the
 * homepage fallbacks included, so no /go URL is ever indexable.
 */
function redirectWithoutIndexing(target: URL): NextResponse {
  const response = NextResponse.redirect(target, { status: 307 });
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

/**
 * Outbound redirect for every affiliate/product link on the site
 * (`/go?to=<encoded url>`), so real clicks never leave `window.location`
 * pointed straight at a third-party domain without passing through here.
 * `to` must be an absolute http(s) URL, anything else (missing, malformed,
 * or a non-http scheme like `javascript:`) falls back to the homepage
 * instead of forwarding it, so this can never become an open redirect.
 */
export function GET(request: NextRequest) {
  const home = new URL('/', request.url);
  const to = request.nextUrl.searchParams.get('to');
  if (!to) return redirectWithoutIndexing(home);

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return redirectWithoutIndexing(home);
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return redirectWithoutIndexing(home);
  }

  // The URL is already resolved from the supplier or offer record. Keeping it
  // intact ensures an admin edit is reflected everywhere immediately.
  const response = redirectWithoutIndexing(target);
  // The target is a pure function of the query string, so the CDN can answer a
  // repeat click (or a crawler following the link) without running this again.
  response.headers.set('Cache-Control', 'public, s-maxage=3600');
  return response;
}
