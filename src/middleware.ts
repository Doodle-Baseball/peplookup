import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getRedirectTarget } from '@/lib/seo-redirects';
import { singularPath } from '@/lib/site-paths';

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifyAdminSessionToken(token);
  if (valid) return NextResponse.next();

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Sends anyone with an old address to the page's current one, in a single hop:
 *  - the five section roots went from plural to singular (/suppliers/x is now /supplier/x, and
 *    likewise /products, /coupons, /reviews and /guides);
 *  - a compound, supplier or guide renamed from /admin/seo leaves a row in seo_redirects
 *    (see 0010_seo_management.sql), so a renamed slug is resolved in the same step.
 * A bookmark, an old backlink or a search result that hasn't been recrawled yet lands on the
 * page instead of a 404. The query string is kept.
 */
async function handlePublicRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const singular = singularPath(pathname);
  const target = (await getRedirectTarget(singular ?? pathname)) ?? singular;
  if (!target) return NextResponse.next();
  const redirectUrl = new URL(target, request.url);
  redirectUrl.search = search;
  // Permanent: this is a page that moved for good, not a temporary detour.
  // 301 rather than a 308: search engines treat the two alike, but SEO audit
  // tools expect a 301 for a page that moved for good.
  return NextResponse.redirect(redirectUrl, 301);
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) return handleAdminRoute(request);
  return handlePublicRoute(request);
}

export const config = {
  // Only the paths this middleware acts on: the admin guard, the five old section roots (which
  // redirect to the singular ones), and the three sections whose slugs can be renamed (and so
  // have redirect rows). Every other request, including static assets and Next internals,
  // skips it, so a redirect lookup is never spent on a page that cannot have one.
  matcher: [
    '/admin/:path*',
    '/suppliers/:path*',
    '/products/:path*',
    '/coupons/:path*',
    '/reviews/:path*',
    '/guides/:path*',
    '/supplier/:path*',
    '/product/:path*',
    '/guide/:path*',
  ],
};
