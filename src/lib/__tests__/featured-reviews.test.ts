import { describe, expect, it } from 'vitest';
import { featuredReviews, reviewExcerpt, wholeSentenceExcerpt } from '@/lib/featured-reviews';
import type { SupplierReview } from '@/lib/schema';

const review = (author: string, rating: number, reviewedAt: string | null, body = 'Good.'): SupplierReview => ({
  author,
  rating,
  reviewedAt,
  body,
});

describe('reviewExcerpt', () => {
  it('leaves a short review untouched', () => {
    expect(reviewExcerpt('Fast shipping and great service.')).toBe('Fast shipping and great service.');
  });

  it('cuts a long review on a word boundary within 120 characters, ellipsis included', () => {
    const body =
      "I can't speak highly enough about this company and especially the customer service. The website and CS team are always available, knowledgeable, helpful, and kind.";
    const excerpt = reviewExcerpt(body);
    expect(excerpt.length).toBeLessThanOrEqual(120);
    expect(excerpt.endsWith('…')).toBe(true);
    expect(body.startsWith(excerpt.slice(0, -1))).toBe(true);
    expect(excerpt).not.toMatch(/[ ,]…$/);
  });

  it('collapses line breaks so the count matches what shows', () => {
    expect(reviewExcerpt('Great\n\nproduct')).toBe('Great product');
  });
});

describe('featuredReviews', () => {
  it('takes the highest rated, then the most recent', () => {
    const picked = featuredReviews(
      [
        review('old five', 5, '2026-01-01'),
        review('four', 4, '2026-10-01'),
        review('new five', 5, '2026-09-01'),
        review('undated five', 5, null),
      ],
      2,
    );
    expect(picked.map((entry) => entry.author)).toEqual(['new five', 'old five']);
  });
});

describe('wholeSentenceExcerpt', () => {
  it('returns a short review untouched', () => {
    expect(wholeSentenceExcerpt('Great service.  Fast shipping.', 150)).toBe('Great service. Fast shipping.');
  });

  it('keeps only the whole sentences that fit, with no ellipsis', () => {
    const body = 'Their products are high quality. Shipping was fast and careful every time I ordered from them. Highly recommended!';
    expect(wholeSentenceExcerpt(body, 60)).toBe('Their products are high quality.');
  });

  it('gives null when the first sentence alone is too long', () => {
    expect(wholeSentenceExcerpt(`${'word '.repeat(40)}end. Short one.`, 150)).toBeNull();
  });
});
