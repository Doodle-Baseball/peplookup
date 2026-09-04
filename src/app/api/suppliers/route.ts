import { NextResponse } from 'next/server';
import { countProductsForSupplier, getSuppliers } from '@/lib/repository';

/**
 * Public, read-only supplier listing with per-supplier product counts.
 * No secrets involved — this only exposes what the /suppliers page already
 * renders — so it is safe to call from client components like the watchlist.
 */
export async function GET() {
  const suppliers = await getSuppliers();
  const counts = await Promise.all(suppliers.map((s) => countProductsForSupplier(s.slug)));
  const payload = suppliers.map((supplier, index) => ({
    supplier,
    productCount: counts[index] ?? 0,
  }));
  return NextResponse.json(payload);
}
