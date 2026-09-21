import { describe, expect, it } from 'vitest';
import { VENDOR_REVIEW_PROFILES, findVendorReviewProfile } from '@/data/vendor-reviews';
import { supplierReviewSchema } from '@/lib/schema';

describe('vendor review profiles', () => {
  it('every review satisfies the schema the database and admin form enforce', () => {
    for (const profile of VENDOR_REVIEW_PROFILES) {
      for (const review of profile.reviews) {
        const result = supplierReviewSchema.safeParse(review);
        expect(result.success, `${profile.vendorName} / ${review.author}: ${result.error?.message}`).toBe(true);
      }
    }
  });

  it('stores dates as calendar dates, not display strings', () => {
    const dated = VENDOR_REVIEW_PROFILES.flatMap((p) => p.reviews).filter((r) => r.reviewedAt !== null);
    expect(dated.length).toBeGreaterThan(0);
    for (const review of dated) {
      expect(review.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('keeps vendor ratings within range', () => {
    for (const profile of VENDOR_REVIEW_PROFILES) {
      if (profile.rating === null) continue;
      expect(profile.rating).toBeGreaterThanOrEqual(0);
      expect(profile.rating).toBeLessThanOrEqual(5);
    }
  });

  it('matches a vendor whose catalogue name differs only in spacing or case', () => {
    expect(findVendorReviewProfile('American Peptides')?.vendorName).toBe('Americanpeptides');
    expect(findVendorReviewProfile('elite edge biotech')?.vendorName).toBe('Eliteedgebiotech');
  });

  it('falls back to the website domain when the display name differs entirely', () => {
    // The sheet calls this vendor "Rivn Peptides"; the catalogue calls it "RIVN Research".
    const byName = findVendorReviewProfile('RIVN Research');
    expect(byName).toBeNull();
    expect(findVendorReviewProfile('RIVN Research', 'https://rivnresearch.com')?.vendorName).toBe('Rivn Peptides');
  });

  it('keeps reviews for vendors that are not in the catalogue yet', () => {
    // Added later under this name, these attach automatically.
    const pending = findVendorReviewProfile('Mission Peptides');
    expect(pending).not.toBeNull();
    expect(pending!.reviews.length).toBeGreaterThan(0);
  });

  it('returns null for a vendor with no supplied reviews', () => {
    expect(findVendorReviewProfile('Not A Real Vendor', 'https://example.com')).toBeNull();
  });
});
