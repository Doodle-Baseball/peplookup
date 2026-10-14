import { describe, expect, it } from 'vitest';
import { summarizeOffers } from '../product-offers';

const product = { name: 'BPC-157', description: 'Desc' };

describe('summarizeOffers', () => {
  it('spans the in-stock USD prices shown on the page', () => {
    expect(
      summarizeOffers(product, [
        { priceCents: 4500, currency: 'USD', inStock: true },
        { priceCents: 2999, currency: 'USD', inStock: true },
        { priceCents: 8000, currency: 'USD', inStock: true },
      ]),
    ).toEqual({ ...product, lowPriceCents: 2999, highPriceCents: 8000, offerCount: 3 });
  });

  it('never lets an out-of-stock listing set the low price', () => {
    const summary = summarizeOffers(product, [
      { priceCents: 100, currency: 'USD', inStock: false },
      { priceCents: 4500, currency: 'USD', inStock: true },
    ]);
    expect(summary?.lowPriceCents).toBe(4500);
    expect(summary?.offerCount).toBe(1);
  });

  it('ignores other currencies, since the offer is priced in USD', () => {
    const summary = summarizeOffers(product, [
      { priceCents: 1000, currency: 'EUR', inStock: true },
      { priceCents: 4500, currency: 'USD', inStock: true },
    ]);
    expect(summary?.lowPriceCents).toBe(4500);
  });

  it('is null with no in-stock listings, so no Product is output', () => {
    expect(summarizeOffers(product, [])).toBeNull();
    expect(summarizeOffers(product, [{ priceCents: 4500, currency: 'USD', inStock: false }])).toBeNull();
  });
});
