import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  indexDecision,
  indexStatusLabel,
  isIndexable,
  isProductionDeployment,
  pageTypeForPath,
  qualityFailures,
  staticPageDecision,
  type IndexContext,
  type PageQualityFacts,
} from '@/lib/seo/indexing';

const NOW = new Date('2026-11-04T12:00:00Z');
const LIVE: IndexContext = { isProduction: true, adminRobotsIndex: true, readyToIndex: true, now: NOW };

const GOOD_SUPPLIER: PageQualityFacts = {
  type: 'supplier',
  isActive: true,
  pricedProductCount: 12,
  descriptionWords: 140,
  mostSimilarDescription: { name: 'Purgo Labs', score: 0.31 },
};

describe('qualityFailures (B2)', () => {
  it('passes a supplier with its own long, distinct description and enough priced products', () => {
    expect(qualityFailures(GOOD_SUPPLIER, NOW)).toEqual([]);
  });

  it('names every supplier rule that fails', () => {
    const failures = qualityFailures(
      { type: 'supplier', isActive: false, pricedProductCount: 4, descriptionWords: 0, mostSimilarDescription: { name: 'Purgo Labs', score: 0.82 } },
      NOW,
    );
    expect(failures).toEqual([
      'supplier is not active',
      '4 products with a price (needs 5)',
      'no About text written in admin (needs 120 words)',
      'About text is 82% similar to Purgo Labs',
    ]);
  });

  it('treats exactly 70% similarity as distinct and anything above as a duplicate', () => {
    const at = { ...GOOD_SUPPLIER, mostSimilarDescription: { name: 'A', score: 0.7 } } as PageQualityFacts;
    const above = { ...GOOD_SUPPLIER, mostSimilarDescription: { name: 'A', score: 0.71 } } as PageQualityFacts;
    expect(qualityFailures(at, NOW)).toEqual([]);
    expect(qualityFailures(above, NOW)).toHaveLength(1);
  });

  it('needs a coupon tested within the last 60 days', () => {
    const coupon = (couponVerifiedAt: string | null): PageQualityFacts => ({ type: 'coupon', hasActiveCode: true, couponVerifiedAt });
    expect(qualityFailures(coupon('2026-10-01'), NOW)).toEqual([]);
    expect(qualityFailures(coupon('2026-09-01'), NOW)).toEqual(['coupon last tested 64 days ago (must be within 60)']);
    expect(qualityFailures(coupon(null), NOW)).toEqual(['coupon has never been tested (no "last tested" date)']);
    expect(qualityFailures({ type: 'coupon', hasActiveCode: false, couponVerifiedAt: '2026-11-01' }, NOW)).toEqual([
      'supplier has no active coupon code',
    ]);
  });

  it('needs a 60-word review summary that is not a near-copy', () => {
    expect(qualityFailures({ type: 'review', summaryWords: 60, mostSimilarSummary: null }, NOW)).toEqual([]);
    expect(qualityFailures({ type: 'review', summaryWords: 0, mostSimilarSummary: null }, NOW)).toEqual([
      'no review summary written (needs 60 words)',
    ]);
  });

  it('needs three active suppliers for a product, and the reviewed tick for a guide', () => {
    expect(qualityFailures({ type: 'product', activeSupplierCount: 2 }, NOW)).toEqual([
      '2 active suppliers with a price (needs 3)',
    ]);
    expect(qualityFailures({ type: 'guide', reviewedByMe: false, hasContent: true, isPublished: true }, NOW)).toEqual([
      '"Reviewed by me" is not ticked',
    ]);
  });
});

describe('indexDecision (B1)', () => {
  it('keeps a failing page indexed while its rules are reported but not enforced', () => {
    const thin: PageQualityFacts = { type: 'supplier', isActive: true, pricedProductCount: 1, descriptionWords: 10, mostSimilarDescription: null };
    const decision = indexDecision(thin, LIVE);
    expect(decision.indexable).toBe(true);
    expect(decision.enforced).toBe(false);
    expect(decision.qualityFailures.length).toBeGreaterThan(0);
    expect(indexStatusLabel(decision)).toBe('Indexed ✓');
  });

  it('never indexes a preview deployment', () => {
    const decision = indexDecision(GOOD_SUPPLIER, { ...LIVE, isProduction: false });
    expect(decision.indexable).toBe(false);
    expect(indexStatusLabel(decision)).toBe('Not indexed – reason: preview deployment (only production is indexed)');
  });

  it('respects the Index switch in /admin/seo', () => {
    expect(isIndexable(GOOD_SUPPLIER, { ...LIVE, adminRobotsIndex: false })).toBe(false);
    expect(isIndexable(GOOD_SUPPLIER, { ...LIVE, adminRobotsIndex: null })).toBe(true);
  });

  it('never indexes a draft or an empty guide, enforced or not', () => {
    const draft = indexDecision({ type: 'guide', reviewedByMe: true, hasContent: true, isPublished: false }, LIVE);
    const empty = indexDecision({ type: 'guide', reviewedByMe: true, hasContent: false, isPublished: true }, LIVE);
    expect(draft.reasons).toContain('guide is a draft');
    expect(empty.reasons).toContain('guide has no text yet');
  });

  it('never indexes the private flow pages', () => {
    expect(staticPageDecision('/thanks', LIVE).indexable).toBe(false);
    expect(staticPageDecision('/faqs', LIVE).indexable).toBe(true);
  });
});

describe('pageTypeForPath', () => {
  it.each([
    ['/suppliers/purgo-labs', 'supplier'],
    ['/coupons/purgo-labs-coupon-code', 'coupon'],
    ['/reviews/purgo-labs-reviews', 'review'],
    ['/products/bpc-157', 'product'],
    ['/guides/how-to-read-a-coa', 'guide'],
    ['/suppliers', 'static'],
    ['/', 'static'],
  ])('%s is a %s page', (path, type) => {
    expect(pageTypeForPath(path)).toBe(type);
  });
});

describe('isProductionDeployment', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('depends on VERCEL_ENV alone', () => {
    expect(isProductionDeployment({ VERCEL_ENV: 'production' })).toBe(true);
    expect(isProductionDeployment({ VERCEL_ENV: 'preview' })).toBe(false);
    expect(isProductionDeployment({})).toBe(false);
  });
});
