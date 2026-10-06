import { NextResponse, type NextRequest } from 'next/server';
import { countProductsBySupplier, getSuppliers } from '@/lib/repository';
import { MAX_SLUGS, parseSlugsParam, publicJson } from '@/lib/api/public-read';

/**
 * Public, read-only supplier listing with per-supplier product counts.
 * No secrets involved, this only exposes what the /suppliers page already
 * renders, so it is safe to call from client components like the watchlist.
 *
 * `?slugs=a,b,c` is required. The watchlist is the only caller and always
 * sends it; serving the whole directory to anyone who omits it turned this
 * into a free bulk-export endpoint for scrapers, which is what exhausted the
 * hosting compute budget. An unbounded list also costs a product count per
 * vendor, so the cap is what keeps the work proportional to the request.
 */
export async function GET(request: NextRequest) {
  const wanted = parseSlugsParam(request.nextUrl.searchParams.get('slugs'));
  if (!wanted) {
    return NextResponse.json(
      { error: `A slugs parameter is required, with at most ${MAX_SLUGS} comma-separated slugs.` },
      { status: 400 },
    );
  }

  const all = await getSuppliers();
  const suppliers = all.filter((supplier) => wanted.has(supplier.slug));

  const countBySupplier = await countProductsBySupplier();
  const payload = suppliers.map((supplier) => ({
    supplier,
    productCount: countBySupplier.get(supplier.slug) ?? 0,
  }));
  return publicJson(payload);
}
