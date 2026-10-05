import type { Supplier } from '@/lib/schema';
import { indexableWhenSeoAdded } from '@/lib/seo-indexing';

/** Reviews pages start hidden from search engines; see {@link indexableWhenSeoAdded} for the rule. */
export const reviewsPageIndexable = indexableWhenSeoAdded;

/**
 * Every vendor gets a reviews page at `/reviews/<vendor-slug>-reviews`, so each
 * vendor's rating can be found by the phrase people actually search.
 */
const REVIEWS_SUFFIX = '-reviews';
const REVIEWS_PREFIX = '/reviews/';

export function reviewsPagePath(supplierSlug: string): string {
  return `${REVIEWS_PREFIX}${supplierSlug}${REVIEWS_SUFFIX}`;
}

/** The vendor slug in a `<vendor-slug>-reviews` URL segment, or null when it isn't one. */
export function supplierSlugFromReviewsSegment(segment: string): string | null {
  if (!segment.endsWith(REVIEWS_SUFFIX)) return null;
  const slug = segment.slice(0, -REVIEWS_SUFFIX.length);
  return slug.length > 0 ? slug : null;
}

/** Same as {@link supplierSlugFromReviewsSegment}, for a full path such as "/reviews/amino-club-reviews". */
export function supplierSlugFromReviewsPath(path: string): string | null {
  if (!path.startsWith(REVIEWS_PREFIX)) return null;
  const segment = path.slice(REVIEWS_PREFIX.length);
  return segment.includes('/') ? null : supplierSlugFromReviewsSegment(segment);
}

/** The review facts a vendor's rating box and cards need, read straight from its record. */
export type RatingFacts = Pick<Supplier, 'reviewRating' | 'reviewCount' | 'reviewsUrl'>;

/** True when we hold a rating for this vendor, the minimum for its page to say anything about reviews. */
export function hasRating(supplier: Pick<Supplier, 'reviewRating'>): boolean {
  return supplier.reviewRating !== null;
}

/**
 * Where a vendor's rating comes from, named for the visitor: "Trustpilot" for
 * a Trustpilot link, otherwise the site's own host, and a neutral phrase when
 * no link is recorded. Never claims a source we don't have a link for.
 */
export function ratingSourceLabel(reviewsUrl: string | null): string {
  if (!reviewsUrl) return 'public review sources';
  try {
    const host = new URL(reviewsUrl).hostname.replace(/^www\./, '');
    return /(^|\.)trustpilot\.com$/.test(host) ? 'Trustpilot' : host;
  } catch {
    return 'public review sources';
  }
}
