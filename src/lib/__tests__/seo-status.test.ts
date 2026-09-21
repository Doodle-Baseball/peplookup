import { describe, expect, it } from 'vitest';
import { effectiveSeo, seoChecks, seoStatus } from '../seo-status';
import type { SeoDefaults } from '../seo-defaults';

const DEFAULTS: SeoDefaults = {
  path: '/products/bpc-157',
  title: 'BPC-157 | Compare Prices, Vendors & COA | PepLookup',
  description: 'Compare BPC-157 prices per mg across verified suppliers, with stock status, shipping and lab-verification data.',
  h1: 'BPC-157',
};

describe('seo-status', () => {
  it('falls back to defaults when a page has no override', () => {
    const seo = effectiveSeo(DEFAULTS, null);
    expect(seo).toMatchObject({ title: DEFAULTS.title, description: DEFAULTS.description, h1: DEFAULTS.h1, keywords: [] });
    expect(seoStatus(seo)).toBe('needs-work'); // no keywords yet
  });

  it('an override field wins only when it is actually set', () => {
    const seo = effectiveSeo(DEFAULTS, {
      metaTitle: 'Custom title',
      metaDescription: null,
      h1: '',
      keywords: ['bpc-157', 'price per mg'],
      canonicalUrl: null,
      robotsIndex: true,
      robotsFollow: true,
    });
    expect(seo.title).toBe('Custom title');
    expect(seo.description).toBe(DEFAULTS.description); // blank override, default wins
    expect(seo.h1).toBe(DEFAULTS.h1); // empty string override, default wins
    expect(seo.keywords).toEqual(['bpc-157', 'price per mg']);
  });

  it('is optimized only once title, description, h1 and keywords all pass', () => {
    const seo = effectiveSeo(DEFAULTS, {
      metaTitle: 'A well-sized title between thirty and sixty characters long',
      metaDescription:
        'A meta description that sits comfortably between seventy and one hundred sixty characters, which is the sweet spot search engines want.',
      h1: 'BPC-157',
      keywords: ['bpc-157'],
      canonicalUrl: null,
      robotsIndex: true,
      robotsFollow: true,
    });
    expect(seoChecks(seo).every((check) => check.passed)) .toBe(true);
    expect(seoStatus(seo)).toBe('optimized');
  });

  it('noindex overrides every other check', () => {
    const seo = effectiveSeo(DEFAULTS, {
      metaTitle: null,
      metaDescription: null,
      h1: null,
      keywords: [],
      canonicalUrl: null,
      robotsIndex: false,
      robotsFollow: true,
    });
    expect(seoStatus(seo)).toBe('noindex');
  });
});
