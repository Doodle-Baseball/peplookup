/**
 * Partner placements on compound pages. The supplier's best in-stock listing
 * (within the visitor's current filters) is pinned above the price ranking in
 * "Supplier Listings" with a Featured badge, whose hover text and screen-reader
 * label say it is a partner placement. The rest of the list keeps its price
 * order and the real cheapest still carries "Lowest $/mg". A compound page where
 * the supplier has nothing in stock simply shows no pinned row.
 */

/** Pinned on every compound page; null turns the placement off everywhere. */
export const DEFAULT_RECOMMENDED_SUPPLIER: string | null = 'nura-peptide';

/** Per-compound exceptions: compound slug -> a different partner for that page. */
export const RECOMMENDED_LISTINGS: Readonly<Record<string, string>> = {};

export function recommendedSupplierFor(productSlug: string): string | null {
  return RECOMMENDED_LISTINGS[productSlug] ?? DEFAULT_RECOMMENDED_SUPPLIER;
}
