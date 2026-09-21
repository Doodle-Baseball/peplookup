import { describe, expect, it } from 'vitest';
import type { Offer } from '@/lib/schema';
import { toCents } from '../money';
import { discountPercentText, offerToVendorProductEntry, sizeText } from '../vendor-products';

function offer(over: Partial<Offer> = {}): Offer {
  return {
    id: 'offer-1',
    supplierSlug: 'pure-amino-2',
    productSlug: 'ghk-cu',
    form: 'vial',
    vialSize: 50_000,
    vialCount: 1,
    listPrice: 2999,
    salePrice: null,
    currency: 'USD',
    inStock: true,
    productUrl: 'https://www.pureamino.com/product/ghk-cu/?ref=PRODUCTS',
    imageUrl: null,
    labReport: null,
    coaUrl: null,
    scrapedAt: '2026-09-14T00:00:00.000Z',
    ...over,
  };
}

describe('sizeText', () => {
  it('writes milligrams, keeping fractions, and micrograms below 1 mg', () => {
    expect(sizeText(10_000)).toBe('10 mg');
    expect(sizeText(500_000)).toBe('500 mg');
    expect(sizeText(2_500)).toBe('2.5 mg');
    expect(sizeText(250)).toBe('250 mcg');
  });
});

describe('discountPercentText', () => {
  it('is empty when there is no sale', () => {
    expect(discountPercentText(3999, null)).toBe('');
    expect(discountPercentText(3999, 3999)).toBe('');
  });

  it('gives percent off list price to two decimals', () => {
    expect(discountPercentText(4000, 3600)).toBe('10');
    expect(discountPercentText(11999, 9999)).toBe('16.67');
  });
});

describe('offerToVendorProductEntry', () => {
  it('turns a saved listing into an editable row that keeps its id', () => {
    expect(offerToVendorProductEntry(offer(), 'GHK-Cu')).toEqual({
      offerId: 'offer-1',
      compoundSlug: 'ghk-cu',
      compoundName: 'GHK-Cu',
      form: 'vial',
      size: '50 mg',
      productUrl: 'https://www.pureamino.com/product/ghk-cu/?ref=PRODUCTS',
      coaUrl: '',
      price: '29.99',
      discountCode: '',
      discountPercent: '',
    });
  });

  it('round-trips the price to the same cents', () => {
    for (const listPrice of [2999, 3999, 17999, 5000, 1]) {
      expect(toCents(offerToVendorProductEntry(offer({ listPrice }), 'X').price)).toBe(listPrice);
    }
  });

  it('carries a stored COA link and sale discount', () => {
    const entry = offerToVendorProductEntry(
      offer({ coaUrl: 'https://example.com/coa.pdf', listPrice: 4000, salePrice: 3600 }),
      'GHK-Cu',
    );
    expect(entry.coaUrl).toBe('https://example.com/coa.pdf');
    expect(entry.discountPercent).toBe('10');
  });
});
