import { NextResponse, type NextRequest } from 'next/server';
import { countProductsForSupplier, getSuppliers } from '@/lib/repository';

/**
 * Public, read-only supplier listing with per-supplier product counts.
 * No secrets involved, this only exposes what the /suppliers page already
 * renders, so it is safe to call from client components like the watchlist.
 *
 * `?slugs=a,b,c` narrows the response to just those suppliers. The watchlist
 * page is the caller that needs this: it only ever wants the handful of
 * suppliers someone saved, not the whole directory, and filtering here also
 * skips the per-supplier product-count query for every vendor that isn't
 * being asked for.
 */
export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get('slugs');
  const wanted = slugsParam ? new Set(slugsParam.split(',').filter(Boolean)) : null;

  const all = await getSuppliers();
  const suppliers = wanted ? all.filter((s) => wanted.has(s.slug)) : all;

  const counts = await Promise.all(suppliers.map((s) => countProductsForSupplier(s.slug)));
  const payload = suppliers.map((supplier, index) => ({
    supplier,
    productCount: counts[index] ?? 0,
  }));
  return NextResponse.json(payload);
}
