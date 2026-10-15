import { describe, expect, it } from 'vitest';
import type { Guide } from '@/data/guides';
import { buildSitemapEntries, type SitemapInput, type SitemapSeoFields } from '../sitemap-entries';

const ORIGIN = 'https://www.peplookup.com';

const INDEXED: SitemapSeoFields = { robotsIndex: true, canonicalUrl: null, metaTitle: 'Title', metaDescription: 'Description' };

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

  it('leaves out a page switched to noindex in /admin/seo', () => {
    const seoByPath = new Map([['/faqs', { ...INDEXED, robotsIndex: false }]]);
    expect(urls(input({ seoByPath }))).toEqual([`${ORIGIN}/`]);
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

  it('lists coupon and reviews pages only once their SEO is saved and indexing is on', () => {
    const supplier = { slug: 'supplier-a', hasCoupon: true, hasReviews: true, inventoryRefreshedAt: null };
    expect(urls(input({ staticPaths: [], suppliers: [supplier] }))).toEqual([`${ORIGIN}/suppliers/supplier-a`]);

    const seoByPath = new Map([
      ['/coupons/supplier-a-coupon-code', INDEXED],
      ['/reviews/supplier-a-reviews', INDEXED],
    ]);
    expect(urls(input({ staticPaths: [], suppliers: [supplier], seoByPath }))).toEqual([
      `${ORIGIN}/suppliers/supplier-a`,
      `${ORIGIN}/coupons/supplier-a-coupon-code`,
      `${ORIGIN}/reviews/supplier-a-reviews`,
    ]);
  });

  it('never lists a coupon or reviews page for a supplier that has no coupon or reviews', () => {
    const supplier = { slug: 'supplier-a', hasCoupon: false, hasReviews: false, inventoryRefreshedAt: null };
    const seoByPath = new Map([
      ['/coupons/supplier-a-coupon-code', INDEXED],
      ['/reviews/supplier-a-reviews', INDEXED],
    ]);
    expect(urls(input({ staticPaths: [], suppliers: [supplier], seoByPath }))).toEqual([`${ORIGIN}/suppliers/supplier-a`]);
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
});
