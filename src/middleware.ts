import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getRedirectTarget } from '@/lib/seo';

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
 * A compound or supplier renamed from /admin/seo leaves a row in
 * seo_redirects (see 0010_seo_management.sql); this sends anyone who still
 * has the old URL, a bookmark, an old backlink, a search result that hasn't
 * recrawled yet, on to the page's current address instead of a 404.
 */
async function handlePublicRoute(request: NextRequest): Promise<NextResponse> {
  const target = await getRedirectTarget(request.nextUrl.pathname);
  if (!target) return NextResponse.next();
  const redirectUrl = new URL(target, request.url);
  redirectUrl.search = request.nextUrl.search;
  // Permanent: this is a page that moved for good, not a temporary detour.
  return NextResponse.redirect(redirectUrl, 308);
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) return handleAdminRoute(request);
  return handlePublicRoute(request);
}

export const config = {
  // Excludes static assets and Next internals, a redirect lookup on every
  // JS chunk and image request would be pure overhead.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
