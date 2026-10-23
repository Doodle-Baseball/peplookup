export type ReviewSortKey = 'rating' | 'reviews' | 'name' | 'coa';

export const DEFAULT_REVIEW_SORT: ReviewSortKey = 'rating';

interface SortableReviewVendor {
  name: string;
  rating: number | null;
  reviewCountValue: number;
  /** Listings backed by a published COA, out of `productCount`. */
  coaListingCount: number;
  productCount: number;
}

/**
 * Highest share of listings backed by a COA first, compared as exact fractions
 * (a/b vs c/d by cross-multiplying) so two suppliers never tie by rounding.
 * Suppliers with no COA-backed listings sort last.
 */
function compareCoaShare(a: SortableReviewVendor, b: SortableReviewVendor): number {
  const aHas = a.coaListingCount > 0 && a.productCount > 0;
  const bHas = b.coaListingCount > 0 && b.productCount > 0;
  if (aHas !== bHas) return aHas ? -1 : 1;
  if (!aHas) return 0;
  return b.coaListingCount * a.productCount - a.coaListingCount * b.productCount;
}

/**
 * Card order on /reviews. Shared by the client browser and the server page,
 * so the page's ItemList lists vendors in the order a visitor first sees.
 */
export function compareReviewVendors(sort: ReviewSortKey) {
  return (a: SortableReviewVendor, b: SortableReviewVendor): number => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'coa') {
      return (
        compareCoaShare(a, b) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        b.reviewCountValue - a.reviewCountValue ||
        a.name.localeCompare(b.name)
      );
    }
    // Unrated vendors sort last under either numeric order, never as a zero.
    const aRated = a.rating !== null;
    const bRated = b.rating !== null;
    if (aRated !== bRated) return aRated ? -1 : 1;
    if (sort === 'reviews') {
      return b.reviewCountValue - a.reviewCountValue || (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name);
    }
    return (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCountValue - a.reviewCountValue || a.name.localeCompare(b.name);
  };
}
