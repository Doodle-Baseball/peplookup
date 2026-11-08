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
      { url: `${ORIGIN}/products/compound-a`, lastModified: new Date('2026-10-03T00:00:00.000Z') },
    ]);
  });

  it('gives a product with no listings no date rather than an invented one', () => {
    expect(buildSitemapEntries(input({ staticPaths: [], productSlugs: ['compound-a'] }))).toEqual([
      { url: `${ORIGIN}/products/compound-a` },
    ]);
  });

  it('lists coupon and reviews pages by the same indexing decision as every other page', () => {
    const supplier = { slug: 'supplier-a', hasCoupon: true, hasReviews: true, inventoryRefreshedAt: null };
    const onlyProfile = (path: string) => path.startsWith('/suppliers/');
    expect(urls(input({ staticPaths: [], suppliers: [supplier], isIndexable: onlyProfile }))).toEqual([
      `${ORIGIN}/suppliers/supplier-a`,
    ]);

    expect(urls(input({ staticPaths: [], suppliers: [supplier] }))).toEqual([
      `${ORIGIN}/suppliers/supplier-a`,
      `${ORIGIN}/coupons/supplier-a-coupon-code`,
      `${ORIGIN}/reviews/supplier-a-reviews`,
    ]);
  });

  it('never lists a coupon or reviews page for a supplier that has no coupon or reviews', () => {
    const supplier = { slug: 'supplier-a', hasCoupon: false, hasReviews: false, inventoryRefreshedAt: null };
    expect(urls(input({ staticPaths: [], suppliers: [supplier] }))).toEqual([`${ORIGIN}/suppliers/supplier-a`]);
  });

  it('leaves out placeholder guides, and the guides index while there are none with content', () => {
    const placeholder = guide('placeholder', ['   ']);
    expect(urls(input({ staticPaths: ['/guides'], guides: [placeholder] }))).toEqual([]);

    const written = guide('written', ['Real text.']);
    expect(urls(input({ staticPaths: ['/guides'], guides: [placeholder, written] }))).toEqual([
      `${ORIGIN}/guides`,
      `${ORIGIN}/guides/written`,
    ]);
  });

  it('dates a guide by its last save, and leaves drafts out', () => {
    const saved = { ...guide('saved', ['Text.']), updatedAt: '2026-10-27T09:30:00.000Z' };
    const draft = { ...guide('draft', ['Text.']), isPublished: false };
    const entries = buildSitemapEntries(input({ staticPaths: [], guides: [saved, draft] }));
    expect(entries).toEqual([{ url: `${ORIGIN}/guides/saved`, lastModified: new Date('2026-10-27T09:30:00.000Z') }]);
  });
});

describe('buildSitemapEntries: a supplier profile that has moved', () => {
  const suppliers = ['american-peptides', 'kylo-peptides'].map((slug) => ({ slug, hasCoupon: true, hasReviews: true, inventoryRefreshedAt: null }));
  // As stored live: the override is keyed by the old path and its canonical names the new address.
  const seoByPath = new Map([['/suppliers/american-peptides', { canonicalUrl: '/supplier/american-peptides' }]]);
  const listed = urls(input({ staticPaths: [], suppliers, seoByPath }));

  it('lists the new address and not the old one', () => {
    expect(listed).toContain('https://www.peplookup.com/supplier/american-peptides');
    expect(listed).not.toContain('https://www.peplookup.com/suppliers/american-peptides');
  });

  it("leaves every other entry, including the same supplier's coupon and reviews pages, as it was", () => {
    expect(listed).toEqual([
      'https://www.peplookup.com/supplier/american-peptides',
      'https://www.peplookup.com/coupons/american-peptides-coupon-code',
      'https://www.peplookup.com/reviews/american-peptides-reviews',
      'https://www.peplookup.com/suppliers/kylo-peptides',
      'https://www.peplookup.com/coupons/kylo-peptides-coupon-code',
      'https://www.peplookup.com/reviews/kylo-peptides-reviews',
    ]);
  });

  it('lists the new address whether the saved canonical names the old path or the new one', () => {
    const oldCanonical = new Map([['/suppliers/american-peptides', { canonicalUrl: '/suppliers/american-peptides' }]]);
    expect(urls(input({ staticPaths: [], suppliers, seoByPath: oldCanonical }))).toEqual(listed);
  });

  it('still drops the profile when its own page is noindex', () => {
    const noindex = urls(input({ staticPaths: [], suppliers, seoByPath, isIndexable: (path) => path !== '/suppliers/american-peptides' }));
    expect(noindex.some((url) => url.includes('/american-peptides') && url.includes('/supplier'))).toBe(false);
  });
});
