import type { Offer, Supplier } from '@/lib/schema';

export interface CatalogueStats {
  supplierCount: number;
  /** Listings from suppliers still in the directory. */
  listingCount: number;
  /** Distinct compounds those listings cover. */
  compoundCount: number;
}

/**
 * Headline counts for the whole catalogue. Counted the same way as the
 * /suppliers hero stats: a delisted vendor's leftover offers don't count, so
 * every page quotes the same numbers.
 */
export function catalogueStats(
  suppliers: readonly Pick<Supplier, 'slug'>[],
  offers: readonly Pick<Offer, 'supplierSlug' | 'productSlug'>[],
): CatalogueStats {
  const listedSlugs = new Set(suppliers.map((supplier) => supplier.slug));
  const listed = offers.filter((offer) => listedSlugs.has(offer.supplierSlug));
  return {
    supplierCount: suppliers.length,
    listingCount: listed.length,
    compoundCount: new Set(listed.map((offer) => offer.productSlug)).size,
  };
}

/**
 * "More than N" must stay true: N is the largest round number strictly below
 * the count (2,830 -> "more than 2,800"; 2,800 -> "more than 2,700"). Small
 * counts are stated exactly, since "more than 0" says nothing.
 */
export function moreThanFloor(count: number): number | null {
  if (count <= 20) return null;
  const step = count >= 1000 ? 100 : 10;
  return Math.ceil(count / step) * step - step;
}
