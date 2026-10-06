import { describe, expect, it } from 'vitest';
import { couponPageSeoDefaults, pageMetadata, reviewsPageSeoDefaults } from '@/lib/seo-defaults';
import { characterCount, effectiveSeo, seoChecks, taskStatusLabel } from '@/lib/seo-status';

const NAMES = ['IDUN Peptides', 'Pure Amino', 'BioPeptide Technologies', 'A', 'Elevate Research Company Labs'];

describe('coupon page defaults', () => {
  it.each(NAMES)('keep the title under 60 and the description under 150 for %s', (name) => {
    const defaults = couponPageSeoDefaults({ slug: 'x', name }, { percentOff: 20 });
    expect(characterCount(defaults.title)).toBeLessThan(60);
    expect(characterCount(defaults.description)).toBeLessThan(150);
    expect(defaults.title).not.toMatch(/20\d\d/);
  });

  it('names the code, the discount and the supplier', () => {
    const defaults = couponPageSeoDefaults({ slug: 'amino-club', name: 'Amino Club' }, { percentOff: 20 });
    expect(defaults.title).toBe('Amino Club Coupon Code: 20% Off | PepLookup');
    expect(defaults.description).toContain('Amino Club coupon code');
    expect(defaults.description).toContain('20% off');
  });

  it('carry seven distinct keywords, the primary one first', () => {
    const { keywords } = couponPageSeoDefaults({ slug: 'amino-club', name: 'Amino Club' }, { percentOff: 20 });
    expect(keywords).toHaveLength(7);
    expect(new Set(keywords).size).toBe(7);
    expect(keywords?.[0]).toBe('Amino Club coupon code');
  });
});

describe('review page defaults', () => {
  it('puts 2026 right after "Reviews" and keeps the longest wording that fits under 60', () => {
    expect(reviewsPageSeoDefaults({ slug: 'idun-peptides', name: 'IDUN Peptides' }).title).toBe(
      'IDUN Peptides Reviews 2026: Rating & COA | PepLookup',
    );
    expect(reviewsPageSeoDefaults({ slug: 'a', name: 'Amino Club' }).title).toBe(
      'Amino Club Reviews 2026: Rating & Lab Reports | PepLookup',
    );
  });

  it.each(NAMES)('keep the title under 60 and the description under 150 for %s', (name) => {
    const defaults = reviewsPageSeoDefaults({ slug: 'x', name });
    expect(characterCount(defaults.title)).toBeLessThan(60);
    expect(defaults.title).toContain(`${name} Reviews 2026`);
    expect(characterCount(defaults.description)).toBeLessThan(150);
  });

  it('carry seven distinct keywords, the primary one first', () => {
    const { keywords } = reviewsPageSeoDefaults({ slug: 'x', name: 'Pure Amino' });
    expect(keywords).toHaveLength(7);
    expect(new Set(keywords).size).toBe(7);
    expect(keywords?.[0]).toBe('Pure Amino reviews');
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
