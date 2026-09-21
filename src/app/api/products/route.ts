import { NextResponse, type NextRequest } from 'next/server';
import { getProducts } from '@/lib/repository';

/**
 * Public, read-only product listing. No secrets involved, this only exposes
 * what /products pages already render, so it is safe to call from client
 * components like the watchlist.
 *
 * `?slugs=a,b,c` narrows the response to just those products, which is what
 * the watchlist page wants: a handful of saved compounds, not the whole
 * catalogue.
 */
export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get('slugs');
  const wanted = slugsParam ? new Set(slugsParam.split(',').filter(Boolean)) : null;

  const all = await getProducts();
  const products = wanted ? all.filter((p) => wanted.has(p.slug)) : all;
  return NextResponse.json(products);
}
