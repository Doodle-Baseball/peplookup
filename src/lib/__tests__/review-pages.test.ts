import { describe, expect, it } from 'vitest';
import {
  hasRating,
  ratingSourceLabel,
  reviewsPagePath,
  supplierSlugFromReviewsPath,
  supplierSlugFromReviewsSegment,
} from '@/lib/review-pages';

describe('review page paths', () => {
  it('builds the page path from a vendor slug', () => {
    expect(reviewsPagePath('amino-club')).toBe('/reviews/amino-club-reviews');
  });

  it('recovers the vendor slug from a segment or path', () => {
    expect(supplierSlugFromReviewsSegment('amino-club-reviews')).toBe('amino-club');
    expect(supplierSlugFromReviewsPath('/reviews/amino-club-reviews')).toBe('amino-club');
  });

  it('rejects anything that is not a reviews page', () => {
    expect(supplierSlugFromReviewsSegment('reviews')).toBeNull();
    expect(supplierSlugFromReviewsSegment('-reviews')).toBeNull();
    expect(supplierSlugFromReviewsPath('/admin/amino-club-reviews')).toBeNull();
    expect(supplierSlugFromReviewsPath('amino-club-reviews')).toBeNull();
    expect(supplierSlugFromReviewsPath('/amino-club-reviews')).toBeNull();
  });
});

describe('ratingSourceLabel', () => {
  it('names Trustpilot for a Trustpilot link', () => {
    expect(ratingSourceLabel('https://www.trustpilot.com/review/aminoclub.com')).toBe('Trustpilot');
  });

  it('falls back to the host for any other site, and to a neutral phrase with no link', () => {
    expect(ratingSourceLabel('https://reviews.example.com/acme')).toBe('reviews.example.com');
    expect(ratingSourceLabel(null)).toBe('public review sources');
    expect(ratingSourceLabel('not a url')).toBe('public review sources');
  });
});

describe('hasRating', () => {
  it('is true only when a rating is on record', () => {
    expect(hasRating({ reviewRating: 4.5 })).toBe(true);
    expect(hasRating({ reviewRating: 0 })).toBe(true);
    expect(hasRating({ reviewRating: null })).toBe(false);
  });
});
