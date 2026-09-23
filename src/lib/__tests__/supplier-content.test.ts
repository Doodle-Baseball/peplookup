import { describe, expect, it } from 'vitest';
import {
  defaultSupplierContent,
  resolveSupplierContent,
  SUPPLIER_CONTENT_WORD_TARGET,
  supplierMarketStats,
  toSupplierContentOverride,
  wordCount,
  type SupplierMarketStats,
} from '../supplier-content';
import type { Offer } from '../schema';

function offer(overrides: Partial<Offer>): Offer {
  return {
    supplierSlug: 'alpha',
    productSlug: 'bpc-157',
    form: 'vial',
    vialSize: 10_000,
    vialCount: 1,
    listPrice: 5000,
    salePrice: null,
    currency: 'USD',
    inStock: true,
    productUrl: 'https://example.com/p',
    imageUrl: null,
    labReport: null,
    coaUrl: null,
    scrapedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

const FULL_SUPPLIER = {
  name: 'Amino Club',
  country: 'United States',
  foundedYear: 2021,
  coaLabName: 'Janoshik Analytical',
  coupon: { code: 'PRODUCTS', percentOff: 10 },
  reviewRating: 4.6,
  paymentMethods: ['Visa', 'Mastercard', 'Zelle', 'Bitcoin'],
};

const BARE_SUPPLIER = {
  name: 'New Vendor',
  country: null,
  foundedYear: null,
  coaLabName: null,
  coupon: null,
  reviewRating: null,
  paymentMethods: [],
};

const RICH_STATS: SupplierMarketStats = {
  listingCount: 48,
  compoundCount: 31,
  inStockCount: 44,
  labDocumentCount: 12,
  comparableCompoundCount: 29,
  lowestPriceCount: 7,
  otherVendorCount: 82,
};

const EMPTY_STATS: SupplierMarketStats = {
  listingCount: 0,
  compoundCount: 0,
  inStockCount: 0,
  labDocumentCount: 0,
  comparableCompoundCount: 0,
  lowestPriceCount: 0,
  otherVendorCount: 82,
};

describe('supplierMarketStats', () => {
  it('accounts for multipacks when finding the lowest cost per mg', () => {
    const stats = supplierMarketStats('alpha', [
      // $50 for 10 mg = $5/mg
      offer({ supplierSlug: 'alpha', listPrice: 5000 }),
      // $80 for a 2 x 10 mg kit = $4/mg, cheaper despite the higher headline price
      offer({ supplierSlug: 'beta', listPrice: 8000, vialCount: 2 }),
    ]);
    expect(stats.comparableCompoundCount).toBe(1);
    expect(stats.lowestPriceCount).toBe(0);
  });

  it('never lets an out-of-stock listing win', () => {
    const stats = supplierMarketStats('alpha', [
      offer({ supplierSlug: 'alpha', listPrice: 5000 }),
      offer({ supplierSlug: 'beta', listPrice: 1000, inStock: false }),
      offer({ supplierSlug: 'gamma', listPrice: 6000 }),
    ]);
    expect(stats.lowestPriceCount).toBe(1);
  });

  it('uses the sale price when one was observed', () => {
    const stats = supplierMarketStats('alpha', [
      offer({ supplierSlug: 'alpha', listPrice: 6000, salePrice: 4000 }),
      offer({ supplierSlug: 'beta', listPrice: 5000 }),
    ]);
    expect(stats.lowestPriceCount).toBe(1);
  });

  it('counts a tie as joint-lowest, compared at full precision', () => {
    const tied = supplierMarketStats('alpha', [
      offer({ supplierSlug: 'alpha', listPrice: 5000 }),
      offer({ supplierSlug: 'beta', listPrice: 5000 }),
    ]);
    expect(tied.lowestPriceCount).toBe(1);

    // $33.33 / 3 mg vs $33.34 / 3 mg would round to the same $11.11/mg.
    const nearTie = supplierMarketStats('alpha', [
      offer({ supplierSlug: 'alpha', listPrice: 3334, vialSize: 3000 }),
      offer({ supplierSlug: 'beta', listPrice: 3333, vialSize: 3000 }),
    ]);
    expect(nearTie.lowestPriceCount).toBe(0);
  });

  it('never compares across currencies', () => {
    const stats = supplierMarketStats('alpha', [
      offer({ supplierSlug: 'alpha', currency: 'USD' }),
      offer({ supplierSlug: 'beta', currency: 'EUR', listPrice: 100 }),
    ]);
    expect(stats.comparableCompoundCount).toBe(0);
  });

  it('counts listings, compounds, stock, COAs and other vendors', () => {
    const stats = supplierMarketStats('alpha', [
      offer({ supplierSlug: 'alpha', productSlug: 'bpc-157', coaUrl: 'https://example.com/coa.pdf' }),
      offer({ supplierSlug: 'alpha', productSlug: 'bpc-157', vialSize: 5000 }),
      offer({ supplierSlug: 'alpha', productSlug: 'tb-500', inStock: false }),
      offer({ supplierSlug: 'beta', productSlug: 'tb-500' }),
      offer({ supplierSlug: 'gamma', productSlug: 'nad' }),
    ]);
    expect(stats).toEqual({
      listingCount: 3,
      compoundCount: 2,
      inStockCount: 2,
      labDocumentCount: 1,
      // tb-500 is out of stock at alpha, so nothing is comparable.
      comparableCompoundCount: 0,
      lowestPriceCount: 0,
      otherVendorCount: 2,
    });
  });
});

describe('defaultSupplierContent', () => {
  const cases = [
    ['a vendor with a full record', FULL_SUPPLIER, RICH_STATS],
    ['a vendor with nothing on file', BARE_SUPPLIER, EMPTY_STATS],
    ['the only vendor with data', BARE_SUPPLIER, { ...EMPTY_STATS, otherVendorCount: 0 }],
  ] as const;

  it.each(cases)('keeps every box within its word target for %s', (_label, supplier, stats) => {
    const content = defaultSupplierContent(supplier, stats);
    for (const key of ['about', 'why', 'compare'] as const) {
      const words = wordCount(content[key].body);
      expect(words, `${key}: ${content[key].body}`).toBeGreaterThanOrEqual(SUPPLIER_CONTENT_WORD_TARGET[key].min);
      expect(words, `${key}: ${content[key].body}`).toBeLessThanOrEqual(SUPPLIER_CONTENT_WORD_TARGET[key].max);
    }
  });

  it('names the vendor in every title', () => {
    const content = defaultSupplierContent(FULL_SUPPLIER, RICH_STATS);
    expect(content.about.title).toBe('About Amino Club');
    expect(content.why.title).toBe('Why researchers choose Amino Club');
    expect(content.compare.title).toBe('Amino Club vs other suppliers');
  });

  it('only states facts the record holds', () => {
    const bare = defaultSupplierContent(BARE_SUPPLIER, EMPTY_STATS);
    const text = Object.values(bare).map((block) => block.body).join(' ');
    expect(text).not.toMatch(/out of 5|% code|established in|operating from/);
    expect(text).toContain('no certificates of analysis on file');

    const alone = defaultSupplierContent(BARE_SUPPLIER, { ...EMPTY_STATS, otherVendorCount: 0 });
    expect(alone.compare.body).not.toContain('0 other suppliers');

    const full = defaultSupplierContent(FULL_SUPPLIER, RICH_STATS);
    expect(full.compare.body).toContain('lowest listed cost per mg on 7');
    expect(full.why.body).toContain('4.6 out of 5');
  });
});

describe('resolveSupplierContent', () => {
  const defaults = defaultSupplierContent(FULL_SUPPLIER, RICH_STATS);

  it('returns the generated text when nothing is saved', () => {
    expect(resolveSupplierContent(defaults, null)).toEqual(defaults);
  });

  it('overrides field by field, falling back on blanks', () => {
    const resolved = resolveSupplierContent(defaults, {
      about: { title: 'Meet Amino Club', body: null },
      why: { title: '   ', body: 'Custom why.' },
      compare: { title: null, body: null },
    });
    expect(resolved.about).toEqual({ title: 'Meet Amino Club', body: defaults.about.body });
    expect(resolved.why).toEqual({ title: defaults.why.title, body: 'Custom why.' });
    expect(resolved.compare).toEqual(defaults.compare);
  });
});

describe('toSupplierContentOverride', () => {
  const defaults = defaultSupplierContent(FULL_SUPPLIER, RICH_STATS);

  it('stores untouched and blank fields as null so they keep tracking live data', () => {
    const submitted = {
      about: { title: `  ${defaults.about.title} `, body: '' },
      why: { title: 'Why labs pick Amino Club', body: defaults.why.body },
      compare: { title: defaults.compare.title, body: 'Edited comparison.' },
    };
    expect(toSupplierContentOverride(submitted, defaults)).toEqual({
      about: { title: null, body: null },
      why: { title: 'Why labs pick Amino Club', body: null },
      compare: { title: null, body: 'Edited comparison.' },
    });
  });
});
