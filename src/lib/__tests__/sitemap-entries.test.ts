import { describe, expect, it } from 'vitest';
import type { Guide } from '@/data/guides';
import { buildSitemapEntries, type SitemapInput, type SitemapSeoFields } from '../sitemap-entries';

const ORIGIN = 'https://www.peplookup.com';

const INDEXED: SitemapSeoFields = { canonicalUrl: null };

function guide(slug: string, body: string[]): Guide {
  return {
    slug,
    title: slug,
    category: 'Basics',
    excerpt: '',
    icon: 'document',
    accent: 'cat-1',
    readMinutes: 3,
    publishedAt: '2026-10-01T00:00:00.000Z',
    sections: [{ heading: 'Intro', body }],
  };
}

function input(overrides: Partial<SitemapInput> = {}): SitemapInput {
  return {
    staticPaths: ['/', '/faqs'],
    productSlugs: [],
    suppliers: [],
    guides: [],
    offers: [],
    seoByPath: new Map(),
    isIndexable: () => true,
    ...overrides,
  };
}

function urls(sitemapInput: SitemapInput): string[] {
  return buildSitemapEntries(sitemapInput).map((entry) => entry.url);
}

describe('buildSitemapEntries', () => {
  it('lists static pages as absolute URLs', () => {
    expect(urls(input())).toEqual([`${ORIGIN}/`, `${ORIGIN}/faqs`]);
  });

  it('leaves out the watchlist, which a crawler always sees empty', () => {
    expect(urls(input({ staticPaths: ['/', '/watchlist'] }))).toEqual([`${ORIGIN}/`]);
  });

  it('leaves out every page its indexing decision says is noindex', () => {
    expect(urls(input({ isIndexable: (path) => path !== '/faqs' }))).toEqual([`${ORIGIN}/`]);
  });

  it('leaves out a page whose canonical names another URL', () => {
    const seoByPath = new Map([['/faqs', { ...INDEXED, canonicalUrl: `${ORIGIN}/about` }]]);
    expect(urls(input({ seoByPath }))).toEqual([`${ORIGIN}/`]);
  });

  it('keeps a page whose canonical is itself, written absolute or with a trailing slash', () => {
    const seoByPath = new Map<string, SitemapSeoFields>([
      ['/', { ...INDEXED, canonicalUrl: ORIGIN }],
      ['/faqs', { ...INDEXED, canonicalUrl: `${ORIGIN}/faqs/` }],
    ]);
    expect(urls(input({ seoByPath }))).toEqual([`${ORIGIN}/`, `${ORIGIN}/faqs`]);
  });

  it('dates a product by its most recently seen listing', () => {
    const entries = buildSitemapEntries(
      input({
        staticPaths: [],
        productSlugs: ['compound-a'],
        offers: [
          { productSlug: 'compound-a', supplierSlug: 'supplier-a', scrapedAt: '2026-10-01T00:00:00.000Z' },
          { productSlug: 'compound-a', supplierSlug: 'supplier-b', scrapedAt: '2026-10-03T00:00:00.000Z' },
        ],
      }),
    );
    expect(entries).toEqual([
      { url: `${ORIGIN}/product/compound-a`, lastModified: new Date('2026-10-03T00:00:00.000Z') },
    ]);
  });

  it('gives a product with no listings no date rather than an invented one', () => {
    expect(buildSitemapEntries(input({ staticPaths: [], productSlugs: ['compound-a'] }))).toEqual([
      { url: `${ORIGIN}/product/compound-a` },
    ]);
  });

  it('lists coupon and reviews pages by the same indexing decision as every other page', () => {
    const supplier = { slug: 'supplier-a', hasCoupon: true, hasReviews: true, inventoryRefreshedAt: null };
    const onlyProfile = (path: string) => path.startsWith('/supplier/');
    expect(urls(input({ staticPaths: [], suppliers: [supplier], isIndexable: onlyProfile }))).toEqual([
      `${ORIGIN}/supplier/supplier-a`,
    ]);

    expect(urls(input({ staticPaths: [], suppliers: [supplier] }))).toEqual([
      `${ORIGIN}/supplier/supplier-a`,
      `${ORIGIN}/coupon/supplier-a-coupon-code`,
      `${ORIGIN}/review/supplier-a-reviews`,
    ]);
  });

  it('never lists a coupon or reviews page for a supplier that has no coupon or reviews', () => {
    const supplier = { slug: 'supplier-a', hasCoupon: false, hasReviews: false, inventoryRefreshedAt: null };
    expect(urls(input({ staticPaths: [], suppliers: [supplier] }))).toEqual([`${ORIGIN}/supplier/supplier-a`]);
  });

  it('leaves out placeholder guides, and the guides index while there are none with content', () => {
    const placeholder = guide('placeholder', ['   ']);
    expect(urls(input({ staticPaths: ['/guide'], guides: [placeholder] }))).toEqual([]);

    const written = guide('written', ['Real text.']);
    expect(urls(input({ staticPaths: ['/guide'], guides: [placeholder, written] }))).toEqual([
      `${ORIGIN}/guide`,
      `${ORIGIN}/guide/written`,
    ]);
  });

  it('dates a guide by its last save, and leaves drafts out', () => {
    const saved = { ...guide('saved', ['Text.']), updatedAt: '2026-10-27T09:30:00.000Z' };
    const draft = { ...guide('draft', ['Text.']), isPublished: false };
    const entries = buildSitemapEntries(input({ staticPaths: [], guides: [saved, draft] }));
    expect(entries).toEqual([{ url: `${ORIGIN}/guide/saved`, lastModified: new Date('2026-10-27T09:30:00.000Z') }]);
  });
});

describe('buildSitemapEntries: supplier, coupon and reviews pages use the singular section roots', () => {
  const suppliers = ['american-peptides', 'kylo-peptides'].map((slug) => ({ slug, hasCoupon: true, hasReviews: true, inventoryRefreshedAt: null }));

  it('lists /supplier, /coupon and /review for each supplier, and none of the old plural paths', () => {
    const listed = urls(input({ staticPaths: [], suppliers }));
    expect(listed).toEqual([
      'https://www.peplookup.com/supplier/american-peptides',
      'https://www.peplookup.com/coupon/american-peptides-coupon-code',
      'https://www.peplookup.com/review/american-peptides-reviews',
      'https://www.peplookup.com/supplier/kylo-peptides',
      'https://www.peplookup.com/coupon/kylo-peptides-coupon-code',
      'https://www.peplookup.com/review/kylo-peptides-reviews',
    ]);
    expect(listed.some((url) => /\/(suppliers|products|coupons|reviews|guides)(\/|$)/.test(url))).toBe(false);
  });

  it('drops a profile whose own page is noindex, or whose saved canonical names another page', () => {
    expect(urls(input({ staticPaths: [], suppliers, isIndexable: (path) => path !== '/supplier/american-peptides' }))).not.toContain(
      'https://www.peplookup.com/supplier/american-peptides',
    );
    const elsewhere = new Map([['/supplier/american-peptides', { canonicalUrl: '/supplier/kylo-peptides' }]]);
    expect(urls(input({ staticPaths: [], suppliers, seoByPath: elsewhere }))).not.toContain('https://www.peplookup.com/supplier/american-peptides');
  });
});
