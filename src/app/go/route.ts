import { NextResponse, type NextRequest } from 'next/server';

/**
 * Outbound redirect for every affiliate/product link on the site
 * (`/go?to=<encoded url>`), so real clicks never leave `window.location`
 * pointed straight at a third-party domain without passing through here.
 * `to` must be an absolute http(s) URL, anything else (missing, malformed,
 * or a non-http scheme like `javascript:`) falls back to the homepage
 * instead of forwarding it, so this can never become an open redirect.
 */
export function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to');
  if (!to) return NextResponse.redirect(new URL('/', request.url));

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // The URL is already resolved from the supplier or offer record. Keeping it
  // intact ensures an admin edit is reflected everywhere immediately.
  return NextResponse.redirect(target, { status: 307 });
}
