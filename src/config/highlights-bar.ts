/**
 * The supplier promoted in the bar above the navbar and the featured section
 * above the directory. Its name, coupon, link and counts come from its live
 * supplier record; if the supplier is removed or deactivated, the promotion
 * simply stops showing. Set to null to run without a promotion.
 */
export const PROMOTED_SUPPLIER: { slug: string; logoUrl: string | null } | null = {
  slug: 'american-peptides',
  // The supplier's own site icon, sharper than the Google favicon proxy their
  // record holds. Null falls back to the record's logo.
  logoUrl: 'https://www.americanpeptides.us/favicon.ico',
};
