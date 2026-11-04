import { describe, expect, it } from 'vitest';
import { couponPageSeoDefaults, pageMetadata, reviewsPageSeoDefaults, supplierSeoDefaults } from '@/lib/seo-defaults';
import { characterCount, effectiveSeo, seoChecks, taskStatusLabel } from '@/lib/seo-status';

const NAMES = ['IDUN Peptides', 'Pure Amino', 'BioPeptide Technologies', 'A', 'Elevate Research Company Labs'];

describe('supplier page defaults', () => {
  it('uses the prices-per-mg template, claiming COAs and a coupon only when the supplier has them', () => {
    const full = supplierSeoDefaults({ slug: 'purgo-labs', name: 'Purgo Labs', coupon: { code: 'X' } }, { productCount: 24, coaCount: 3 });
    expect(full.title).toBe('Purgo Labs: Prices per mg, COAs & Coupon | PepLookup');
    expect(full.description).toBe(
      'Compare Purgo Labs prices per mg across 24 products, see published COAs and get the latest Purgo Labs coupon code.',
    );

    const bare = supplierSeoDefaults({ slug: 'x', name: 'Purgo Labs', coupon: null }, { productCount: 1, coaCount: 0 });
    expect(bare.title).toBe('Purgo Labs: Prices per mg | PepLookup');
    expect(bare.description).not.toMatch(/COA|coupon/i);
  });

  it.each(NAMES)('keeps the title within 60 and the description within 70-160 for %s', (name) => {
    const defaults = supplierSeoDefaults({ slug: 'x', name, coupon: { code: 'X' } }, { productCount: 12, coaCount: 2 });
    expect(characterCount(defaults.title)).toBeLessThanOrEqual(60);
    expect(characterCount(defaults.description)).toBeGreaterThanOrEqual(70);
    expect(characterCount(defaults.description)).toBeLessThanOrEqual(160);
  });
});

describe('coupon page defaults', () => {
  it.each(NAMES)('keep the title within 60 and the description within 70-160 for %s', (name) => {
    const defaults = couponPageSeoDefaults({ slug: 'x', name }, { percentOff: 20, code: 'PEPLOOKUP' });
    expect(characterCount(defaults.title)).toBeLessThanOrEqual(60);
    expect(characterCount(defaults.description)).toBeGreaterThanOrEqual(70);
    expect(characterCount(defaults.description)).toBeLessThanOrEqual(160);
  });

  it('dates the title by the month the code was last tested, and never without a test', () => {
    const tested = couponPageSeoDefaults(
      { slug: 'amino-club', name: 'Amino Club', couponVerifiedAt: '2026-11-02' },
      { percentOff: 20, code: 'PEPLOOKUP' },
    );
    expect(tested.title).toBe('Amino Club Coupon Code: 20% Off (November 2026)');
    expect(tested.description).toBe(
      '20% off at Amino Club with code PEPLOOKUP. How to apply it, exclusions, and when it was last tested.',
    );

    const untested = couponPageSeoDefaults({ slug: 'amino-club', name: 'Amino Club' }, { percentOff: 20, code: 'PEPLOOKUP' });
    expect(untested.title).toBe('Amino Club Coupon Code: 20% Off');
    expect(untested.description).not.toMatch(/tested|verified/i);
  });

  it('falls back to a plain title when there is no code', () => {
    expect(couponPageSeoDefaults({ slug: 'x', name: 'Amino Club' }, null).title).toBe('Amino Club Coupon Code & Discounts');
  });

  it('carry seven distinct keywords, the primary one first', () => {
    const { keywords } = couponPageSeoDefaults({ slug: 'amino-club', name: 'Amino Club' }, { percentOff: 20 });
    expect(keywords).toHaveLength(7);
    expect(new Set(keywords).size).toBe(7);
    expect(keywords?.[0]).toBe('Amino Club coupon code');
  });
});

describe('review page defaults', () => {
  const rated = {
    slug: 'kylo-peptides',
    name: 'Kylo Peptides',
    reviewRating: 4.3,
    reviewCount: { kind: 'exact' as const, value: 120 },
    reviewsUrl: 'https://www.trustpilot.com/review/kylo.com',
  };

  it('names the rating with its source and count', () => {
    const defaults = reviewsPageSeoDefaults(rated);
    expect(defaults.title).toBe('Kylo Peptides Reviews: Trustpilot Rating & Summary');
    expect(defaults.description).toBe(
      'Kylo Peptides has a Trustpilot rating of 4.3/5 from 120 reviews. Read our summary of what customers say.',
    );
  });

  it('names the real source when the rating is not from Trustpilot', () => {
    const defaults = reviewsPageSeoDefaults({ ...rated, reviewsUrl: 'https://pepreviewpro.com/store/kylo' });
    expect(defaults.title).toBe('Kylo Peptides Reviews: PepReviewPro Rating & Summary');
  });

  it('carries no rating, star or number at all when the supplier has no rating', () => {
    const defaults = reviewsPageSeoDefaults({ slug: 'x', name: 'Pure Amino' });
    expect(defaults.title).toBe('Pure Amino Reviews & Customer Feedback');
    expect(`${defaults.title} ${defaults.description}`).not.toMatch(/\d|★|rating/i);
  });

  it.each(NAMES)('keep the title within 60 and the description within 70-160 for %s', (name) => {
    const defaults = reviewsPageSeoDefaults({ ...rated, name });
    expect(characterCount(defaults.title)).toBeLessThanOrEqual(60);
    expect(characterCount(defaults.description)).toBeGreaterThanOrEqual(70);
    expect(characterCount(defaults.description)).toBeLessThanOrEqual(160);
  });

  it('carry seven distinct keywords, the primary one first', () => {
    const { keywords } = reviewsPageSeoDefaults({ slug: 'x', name: 'Pure Amino' });
    expect(keywords).toHaveLength(7);
    expect(new Set(keywords).size).toBe(7);
    expect(keywords?.[0]).toBe('Pure Amino reviews');
  });
});

describe('the three page types for one supplier', () => {
  it('never share a title', () => {
    const supplier = { slug: 'purgo-labs', name: 'Purgo Labs', coupon: { code: 'PEPLOOKUP' }, reviewRating: 4.7 };
    const titles = [
      supplierSeoDefaults(supplier, { productCount: 20, coaCount: 4 }).title,
      couponPageSeoDefaults(supplier, { percentOff: 15, code: 'PEPLOOKUP' }).title,
      reviewsPageSeoDefaults(supplier).title,
    ];
    expect(new Set(titles).size).toBe(3);
  });
});

describe('what the admin card and the page head read from these defaults', () => {
  it('passes every length check with the default keywords and no saved override', () => {
    const defaults = couponPageSeoDefaults({ slug: 'amino-club', name: 'Amino Club' }, { percentOff: 20 });
    expect(seoChecks(effectiveSeo(defaults, null)).every((check) => check.passed)).toBe(true);
  });

  it('prefers saved keywords over the defaults', () => {
    const defaults = reviewsPageSeoDefaults({ slug: 'x', name: 'Pure Amino' });
    const saved = { metaTitle: null, metaDescription: null, h1: null, keywords: ['custom'], canonicalUrl: null, robotsIndex: true, robotsFollow: true };
    expect(effectiveSeo(defaults, saved).keywords).toEqual(['custom']);
  });

  it('adds the keywords to the page metadata', () => {
    const defaults = reviewsPageSeoDefaults({ slug: 'x', name: 'Pure Amino' });
    expect(pageMetadata(defaults).keywords).toEqual(defaults.keywords);
  });
});

describe('taskStatusLabel', () => {
  it('reads "Optimized" for a finished coupon or review page and "Done" elsewhere', () => {
    expect(taskStatusLabel('done', 'coupon')).toBe('Optimized');
    expect(taskStatusLabel('done', 'review')).toBe('Optimized');
    expect(taskStatusLabel('done', 'supplier')).toBe('Done');
    expect(taskStatusLabel('pending', 'coupon')).toBe('Pending');
    expect(taskStatusLabel('needs-work', 'review')).toBe('Needs work');
  });
});
