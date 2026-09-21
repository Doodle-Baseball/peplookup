import { describe, expect, it } from 'vitest';
import { formatMoney, formatPerMg, toCents, type Cents } from '../money';
import {
  bestListing,
  discountPercent,
  effectivePrice,
  hasDiscount,
  groupByCurrency,
  mgToMcg,
  pricePerMg,
  rankByPricePerMg,
  type Listing,
} from '../price';

function listing(over: Partial<Listing> = {}): Listing {
  return {
    supplierSlug: 'acme',
    productSlug: 'bpc-157',
    listPrice: toCents(30),
    salePrice: null,
    currency: 'USD',
    vialSize: mgToMcg(10),
    vialCount: 1,
    inStock: true,
    scrapedAt: '2026-09-04T00:00:00.000Z',
    url: 'https://example.com',
    ...over,
  };
}

describe('toCents', () => {
  it('rounds binary-float scaling correctly', () => {
    // 29.97 * 100 is 2996.9999999999995 before rounding.
    expect(toCents(29.97)).toBe(2997);
    expect(toCents(0.29)).toBe(29);
    expect(toCents('1.005')).toBe(101);
  });

  it('parses currency-formatted strings', () => {
    expect(toCents('$1,234.50'.replace(/,/g, ''))).toBe(123450);
  });

  it('rejects values that are not numbers', () => {
    expect(() => toCents('not a price')).toThrow(RangeError);
  });
});

describe('pricePerMg', () => {
  it('divides by the full pack, not the vial', () => {
    // A 10-vial kit at $250 is $2.50/mg, not $25.00/mg.
    const kit = listing({ listPrice: toCents(250), vialSize: mgToMcg(10), vialCount: 10 });
    expect(pricePerMg(kit)).toBe(250);
  });

  it('uses the discounted price when one is active', () => {
    const l = listing({ listPrice: toCents(40), salePrice: toCents(36) });
    expect(pricePerMg(l)).toBe(360);
  });

  it('keeps sub-cent precision instead of rounding to display', () => {
    // $85 / 190mg = 0.4473...c per mg. Rounding here would tie distinct vendors.
    const l = listing({ listPrice: toCents(85), vialSize: mgToMcg(190) });
    expect(pricePerMg(l)).toBeCloseTo(44.7368, 4);
  });

  it('returns null rather than Infinity or NaN for unusable listings', () => {
    expect(pricePerMg(listing({ vialSize: mgToMcg(0) }))).toBeNull();
    expect(pricePerMg(listing({ vialCount: 0 }))).toBeNull();
    expect(pricePerMg(listing({ listPrice: toCents(0) }))).toBeNull();
    expect(pricePerMg(listing({ vialCount: -1 }))).toBeNull();
  });
});

describe('discounts', () => {
  it('treats list and sale as separate fields', () => {
    const l = listing({ listPrice: toCents(40), salePrice: toCents(36) });
    expect(l.listPrice).toBe(4000);
    expect(effectivePrice(l)).toBe(3600);
    expect(discountPercent(l)).toBe(10);
  });

  it('does not report a discount when sale is not lower', () => {
    const l = listing({ listPrice: toCents(40), salePrice: toCents(40) });
    expect(hasDiscount(l)).toBe(false);
    expect(discountPercent(l)).toBeNull();
  });
});

describe('rankByPricePerMg', () => {
  it('filters out-of-stock before ranking so a dead listing cannot win', () => {
    const cheapButGone = listing({ supplierSlug: 'gone', listPrice: toCents(10), inStock: false });
    const realBest = listing({ supplierSlug: 'real', listPrice: toCents(20) });
    const ranked = rankByPricePerMg([cheapButGone, realBest]);
    expect(ranked).toHaveLength(1);
    expect(bestListing([cheapButGone, realBest])?.listing.supplierSlug).toBe('real');
  });

  it('orders by full precision, not by rounded display value', () => {
    // Both render as "$3.00/mg" at 2dp but are genuinely different.
    const a = listing({ supplierSlug: 'a', listPrice: toCents(29.99) });
    const b = listing({ supplierSlug: 'b', listPrice: toCents(30.0) });
    expect(rankByPricePerMg([b, a]).map((r) => r.listing.supplierSlug)).toEqual(['a', 'b']);
  });

  it('drops listings whose per-mg cannot be computed', () => {
    expect(rankByPricePerMg([listing({ vialSize: mgToMcg(0) })])).toHaveLength(0);
  });

  it('breaks genuine ties deterministically', () => {
    const a = listing({ supplierSlug: 'zeta' });
    const b = listing({ supplierSlug: 'alpha' });
    expect(rankByPricePerMg([a, b]).map((r) => r.listing.supplierSlug)).toEqual(['alpha', 'zeta']);
  });

  it('returns no best listing when everything is out of stock', () => {
    expect(bestListing([listing({ inStock: false })])).toBeNull();
  });
});

describe('groupByCurrency', () => {
  it('keeps currencies apart so EUR is not ranked against USD', () => {
    const usd = listing({ supplierSlug: 'us', currency: 'USD' });
    const eur = listing({ supplierSlug: 'eu', currency: 'EUR' });
    const groups = groupByCurrency([usd, eur]);
    expect(groups.get('USD')).toHaveLength(1);
    expect(groups.get('EUR')).toHaveLength(1);
  });
});

describe('formatting', () => {
  it('always carries the unit', () => {
    expect(formatPerMg(420)).toBe('$4.20/mg');
  });

  it('widens precision for sub-10c values that would otherwise tie', () => {
    expect(formatPerMg(4.4736)).toBe('$0.045/mg');
  });

  it('formats money without float artifacts', () => {
    expect(formatMoney(1234 as Cents)).toBe('$12.34');
    expect(formatMoney(2997 as Cents)).toBe('$29.97');
  });
});
