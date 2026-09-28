import { NextResponse, type NextRequest } from 'next/server';
import { getProducts } from '@/lib/repository';
import { MAX_SLUGS, parseSlugsParam, publicJson } from '@/lib/api/public-read';

/**
 * Public, read-only product listing. No secrets involved, this only exposes
 * what /products pages already render, so it is safe to call from client
 * components like the watchlist.
 *
 * `?slugs=a,b,c` is required. The watchlist is the only caller and always
 * sends it; serving the whole catalogue to anyone who omits it turned this
 * into a free bulk-export endpoint for scrapers, which is what exhausted the
 * hosting compute and bandwidth budget.
 */
export async function GET(request: NextRequest) {
  const wanted = parseSlugsParam(request.nextUrl.searchParams.get('slugs'));
  if (!wanted) {
    return NextResponse.json(
      { error: `A slugs parameter is required, with at most ${MAX_SLUGS} comma-separated slugs.` },
      { status: 400 },
    );
  }

  const all = await getProducts();
  return publicJson(all.filter((product) => wanted.has(product.slug)));
}
