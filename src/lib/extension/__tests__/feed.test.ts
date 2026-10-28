import { describe, expect, it } from 'vitest';
import {
  buildExtensionFeed,
  couponDiscountText,
  type ExtensionFeedSupplierSource,
  type SupplierExtensionSettings,
} from '../feed';

const ORIGIN = 'https://www.peplookup.com';

function supplier(overrides: Partial<ExtensionFeedSupplierSource> & { slug: string }): ExtensionFeedSupplierSource {
  return {
    name: overrides.slug,
    logoUrl: null,
    faviconUrl: null,
    coupon: { code: 'PEPLOOKUP', percentOff: 10 },
    reviewRating: null,
    reviewCount: null,
    isActive: true,
    ...overrides,
  };
}

function settings(slug: string, overrides: Partial<SupplierExtensionSettings> = {}): SupplierExtensionSettings {
  return {
    slug,
    storeDomains: [`${slug}.com`],
    showInExtension: true,
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildExtensionFeed', () => {
  it('writes each supplier in the documented shape', () => {
    const feed = buildExtensionFeed(
      [
        supplier({
          slug: 'purgo-labs',
          name: 'Purgo Labs',
          coupon: { code: 'PEPLOOKUP', percentOff: 15 },
          logoUrl: 'https://cdn.example.com/purgo.png',
          reviewRating: 4.7,
          reviewCount: { kind: 'exact', value: 120 },
        }),
      ],
      [settings('purgo-labs', { storeDomains: ['purgolabs.com'], updatedAt: '2026-10-20T10:00:00.000Z' })],
      ORIGIN,
    );

    expect(feed).toEqual({
      version: 1,
      updated: '2026-10-20T10:00:00.000Z',
      count: 1,
      suppliers: [
        {
          id: 'purgo-labs',
          name: 'Purgo Labs',
          domains: ['purgolabs.com'],
          discount: '15% Off Sitewide',
          code: 'PEPLOOKUP',
          offerUrl: 'https://www.peplookup.com/go?to=purgo-labs&src=extension',
          profileUrl: 'https://www.peplookup.com/suppliers/purgo-labs',
          logoUrl: 'https://cdn.example.com/purgo.png',
          trustpilot: { rating: 4.7, reviews: 120 },
        },
      ],
    });
  });

  it('leaves out suppliers that are hidden, inactive, couponless, codeless or without a domain', () => {
    const feed = buildExtensionFeed(
      [
        supplier({ slug: 'shown' }),
        supplier({ slug: 'hidden' }),
        supplier({ slug: 'inactive', isActive: false }),
        supplier({ slug: 'no-coupon', coupon: null }),
        supplier({ slug: 'blank-code', coupon: { code: '   ', percentOff: 20 } }),
        supplier({ slug: 'no-domain' }),
        supplier({ slug: 'no-settings' }),
      ],
      [
        settings('shown'),
        settings('hidden', { showInExtension: false }),
        settings('inactive'),
        settings('no-coupon'),
        settings('blank-code'),
        settings('no-domain', { storeDomains: [] }),
      ],
      ORIGIN,
    );

    expect(feed.suppliers.map((entry) => entry.id)).toEqual(['shown']);
    expect(feed.count).toBe(1);
  });

  it('sorts by discount, biggest first, then by name', () => {
    const feed = buildExtensionFeed(
      [
        supplier({ slug: 'b', name: 'Beta', coupon: { code: 'X', percentOff: 10 } }),
        supplier({ slug: 'a', name: 'Alpha', coupon: { code: 'X', percentOff: 10 } }),
        supplier({ slug: 'c', name: 'Gamma', coupon: { code: 'X', percentOff: 25 } }),
      ],
      [settings('a'), settings('b'), settings('c')],
      ORIGIN,
    );

    expect(feed.suppliers.map((entry) => entry.name)).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('sends a null trustpilot without a rating, and no count for an "at least" figure', () => {
    const feed = buildExtensionFeed(
      [
        supplier({ slug: 'unrated' }),
        supplier({ slug: 'at-least', reviewRating: 4.25, reviewCount: { kind: 'atLeast', value: 50 } }),
      ],
      [settings('unrated'), settings('at-least')],
      ORIGIN,
    );

    const bySlug = new Map(feed.suppliers.map((entry) => [entry.id, entry]));
    expect(bySlug.get('unrated')?.trustpilot).toBeNull();
    expect(bySlug.get('at-least')?.trustpilot).toEqual({ rating: 4.3, reviews: null });
  });

  it('leaves out a rating taken from a platform other than Trustpilot', () => {
    const feed = buildExtensionFeed(
      [
        supplier({
          slug: 'prp',
          reviewRating: 4.92,
          reviewCount: { kind: 'exact', value: 214 },
          reviewsUrl: 'https://pepreviewpro.com/store/abc',
        }),
        supplier({
          slug: 'tp',
          reviewRating: 4.3,
          reviewCount: { kind: 'exact', value: 40 },
          reviewsUrl: 'https://www.trustpilot.com/review/tp.example',
        }),
      ],
      [settings('prp'), settings('tp')],
      ORIGIN,
    );

    const bySlug = new Map(feed.suppliers.map((entry) => [entry.id, entry]));
    expect(bySlug.get('prp')?.trustpilot).toBeNull();
    expect(bySlug.get('tp')?.trustpilot).toEqual({ rating: 4.3, reviews: 40 });
  });

  it('trims the code, falls back to the favicon and makes site-relative logos absolute', () => {
    const feed = buildExtensionFeed(
      [
        supplier({ slug: 'a', coupon: { code: ' SAVE10 ', percentOff: 10 }, faviconUrl: 'https://icons.example/a.png' }),
        supplier({ slug: 'b', logoUrl: '/logos/b.png' }),
        supplier({ slug: 'c' }),
      ],
      [settings('a'), settings('b'), settings('c')],
      ORIGIN,
    );

    const bySlug = new Map(feed.suppliers.map((entry) => [entry.id, entry]));
    expect(bySlug.get('a')?.code).toBe('SAVE10');
    expect(bySlug.get('a')?.logoUrl).toBe('https://icons.example/a.png');
    expect(bySlug.get('b')?.logoUrl).toBe('https://www.peplookup.com/logos/b.png');
    expect(bySlug.get('c')?.logoUrl).toBeNull();
  });

  it('dates the feed by the most recent supplier change', () => {
    const feed = buildExtensionFeed(
      [supplier({ slug: 'a' })],
      [settings('a', { updatedAt: '2026-10-02T00:00:00.000Z' }), settings('b', { updatedAt: '2026-10-09T08:30:00.000Z' })],
      ORIGIN,
    );
    expect(feed.updated).toBe('2026-10-09T08:30:00.000Z');
  });

  it('is empty, not an error, when nothing qualifies', () => {
    expect(buildExtensionFeed([], [], ORIGIN)).toEqual({ version: 1, updated: null, count: 0, suppliers: [] });
  });

  it('never carries a field outside the public allow-list', () => {
    const leaky = {
      ...supplier({ slug: 'a' }),
      affiliateUrl: 'https://store.example/?ref=SECRET',
      commission: 30,
      contactEmail: 'owner@example.com',
    } as ExtensionFeedSupplierSource;
    const serialized = JSON.stringify(buildExtensionFeed([leaky], [settings('a')], ORIGIN));
    expect(serialized).not.toMatch(/ref=SECRET|commission|owner@example\.com|affiliateUrl/);
  });
});

describe('couponDiscountText', () => {
  it('matches the /coupons badge', () => {
    expect(couponDiscountText(15)).toBe('15% Off Sitewide');
  });
});
