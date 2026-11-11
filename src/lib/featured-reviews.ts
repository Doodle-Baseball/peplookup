import type { SupplierReview } from '@/lib/schema';

/** Longest review excerpt a compact reviews card shows, ellipsis included. */
export const REVIEW_EXCERPT_MAX_CHARACTERS = 120;

/**
 * The review cut to at most `maxCharacters`, ellipsis included, on a word
 * boundary so no word is split. The reviewer's words are kept as written,
 * only shortened; a review already short enough is returned untouched.
 */
export function reviewExcerpt(body: string, maxCharacters: number = REVIEW_EXCERPT_MAX_CHARACTERS): string {
  const text = body.replace(/\s+/g, ' ').trim();
  if (text.length <= maxCharacters) return text;
  const room = text.slice(0, maxCharacters - 1);
  const lastSpace = room.lastIndexOf(' ');
  const cut = (lastSpace > 0 ? room.slice(0, lastSpace) : room).replace(/[\s,;:.!?\-–—]+$/, '');
  return `${cut}…`;
}

/**
 * The best few reviews: highest rated first, then the most recent, so the
 * card shows current top-rated buyers rather than whatever was imported first.
 */
export function featuredReviews(reviews: readonly SupplierReview[], count: number): SupplierReview[] {
  return [...reviews]
    .sort((a, b) => b.rating - a.rating || (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? ''))
    .slice(0, count);
}
