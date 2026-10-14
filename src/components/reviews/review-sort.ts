export type ReviewSortKey = 'rating' | 'reviews' | 'name';

export const DEFAULT_REVIEW_SORT: ReviewSortKey = 'rating';

interface SortableReviewVendor {
  name: string;
  rating: number | null;
  reviewCountValue: number;
}

/**
 * Card order on /reviews. Shared by the client browser and the server page,
 * so the page's ItemList lists vendors in the order a visitor first sees.
 */
export function compareReviewVendors(sort: ReviewSortKey) {
  return (a: SortableReviewVendor, b: SortableReviewVendor): number => {
    if (sort === 'name') return a.name.localeCompare(b.name);
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
