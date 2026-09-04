import { NextResponse, type NextRequest } from 'next/server';
import { getSuppliers } from '@/lib/repository';

/**
 * Outbound affiliate redirect.
 *
 * Only redirects to a URL that belongs to a supplier we actually list. An open
 * redirect here would let anyone bounce traffic through our domain.
 */
export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('to');
  if (!target) return NextResponse.redirect(new URL('/suppliers', request.url));

  const suppliers = await getSuppliers();
  const allowed = suppliers.some(
    (s) => s.affiliateUrl === target || s.homepageUrl === target,
  );
  if (!allowed) return NextResponse.redirect(new URL('/suppliers', request.url));

  return NextResponse.redirect(target, { status: 302 });
}
