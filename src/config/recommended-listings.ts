/**
 * Partner placements on compound pages: compound slug -> supplier slug. That
 * supplier's best in-stock listing is pinned above the price ranking in
 * "Supplier Listings" with a Featured badge, whose hover text and screen-reader
 * label say it is a partner placement. The rest of the list keeps its price
 * order and the real cheapest still carries "Lowest $/mg".
 */
export const RECOMMENDED_LISTINGS: Readonly<Record<string, string>> = {
  retatrutide: 'nura-peptide',
  tirzepatide: 'nura-peptide',
};
