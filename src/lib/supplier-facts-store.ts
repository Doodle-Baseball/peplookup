import 'server-only';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { computeSupplierFacts, couponPriceRows, type CouponPriceRow, type SupplierFacts } from '@/lib/supplier-facts';
import type { Supplier } from '@/lib/schema';

/**
 * A supplier's content v2 facts, read (never written) from the same cached
 * catalogue the pages render: its listings, how its prices rank against every
 * active supplier, its code and its record.
 */
export async function getSupplierFacts(supplier: Supplier): Promise<{ facts: SupplierFacts; couponRows: CouponPriceRow[] }> {
  const [suppliers, offers, products] = await Promise.all([getSuppliers(), getAllOffers(), getProducts()]);
  const active = suppliers.filter((entry) => entry.isActive);
  const facts = computeSupplierFacts(supplier, active, offers, products);
  const activeSlugs = new Set(active.map((entry) => entry.slug));
  return { facts, couponRows: couponPriceRows(facts, supplier.slug, offers, activeSlugs) };
}
