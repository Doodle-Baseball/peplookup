import 'server-only';
import { getSuppliers } from '@/lib/repository';
import { getSupplierFacts } from '@/lib/supplier-facts-store';
import { rewriteFacts, type RewriteFacts } from '@/lib/supplier-page-rewrite';
import type { Offer, Supplier } from '@/lib/schema';
import type { SupplierFacts } from '@/lib/supplier-facts';

/**
 * The live numbers a rewritten supplier page states, from the same cached catalogue the page
 * renders. `ownOffers` are the supplier's listings whose compound resolves, as the page lists them.
 */
export async function getRewriteFacts(
  supplier: Supplier,
  ownOffers: readonly Offer[],
): Promise<{ facts: SupplierFacts; rewrite: RewriteFacts }> {
  const [{ facts }, suppliers] = await Promise.all([getSupplierFacts(supplier), getSuppliers()]);
  const activeCount = suppliers.filter((entry) => entry.isActive).length;
  return { facts, rewrite: rewriteFacts(supplier, facts, ownOffers, activeCount) };
}
