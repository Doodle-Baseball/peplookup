import { describe, expect, it } from 'vitest';
import type { Offer } from '@/lib/schema';
import { toCents } from '../money';
import {
  discountPercentText,
  offerToVendorProductEntry,
  parseSizeWithPack,
  parseVendorProductsCsv,
  sizeText,
} from '../vendor-products';

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
      imageUrl: '',
      coaUrl: '',
      price: '29.99',
      discountCode: '',
      discountPercent: '',
      vialCount: 1,
    });
  });

  it('carries a stored product image link so it can be viewed and edited', () => {
    const entry = offerToVendorProductEntry(offer({ imageUrl: 'https://example.com/ghk-cu.jpg' }), 'GHK-Cu');
    expect(entry.imageUrl).toBe('https://example.com/ghk-cu.jpg');
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

describe('parseSizeWithPack', () => {
  it('reads a plain size as one unit', () => {
    expect(parseSizeWithPack('10mg')).toEqual({ size: '10 mg', count: 1 });
    expect(parseSizeWithPack('250 mcg')).toEqual({ size: '250 mcg', count: 1 });
  });

  it('reads a pack of vials or bottles', () => {
    expect(parseSizeWithPack('5mg pack of 2 vials')).toEqual({ size: '5 mg', count: 2 });
    expect(parseSizeWithPack('30mg pack of 2 Bottle')).toEqual({ size: '30 mg', count: 2 });
    expect(parseSizeWithPack('3ML pack of 2 vials')).toEqual({ size: '3 ml', count: 2 });
  });

  it('counts capsules, multiplied across bottles', () => {
    expect(parseSizeWithPack('10mg x 30 caps')).toEqual({ size: '10 mg', count: 30 });
    expect(parseSizeWithPack('0.25MG x 60 caps pack of 2 Bottle')).toEqual({ size: '0.25 mg', count: 120 });
  });

  it('rejects wording it cannot account for rather than guessing', () => {
    expect(parseSizeWithPack('10mg buy one get one')).toBeNull();
    expect(parseSizeWithPack('about ten mg')).toBeNull();
  });
});

describe('parseVendorProductsCsv', () => {
  const catalogue = [
    { slug: 'bpc-157', name: 'BPC-157' },
    { slug: 'melanotan-1', name: 'Melanotan-1' },
    { slug: 'glow', name: 'GLOW' },
    { slug: 'klow', name: 'KLOW' },
    { slug: 'ipamorelin-cjc-1295-no-dac', name: 'Ipamorelin / CJC-1295 (No DAC)' },
  ];
  const csv = (compound: string, size: string, price: string) =>
    `Compound,Type,Size,Product URL,Price\r\n"${compound}",vial,${size},https://example.com/p,"${price}"\r\n`;

  it('accepts a dollar-signed price with thousands separators', () => {
    const [row] = parseVendorProductsCsv(csv('BPC-157', '10mg', '$1,034.90'), catalogue).rows;
    expect(row?.errors).toEqual([]);
    expect(row?.entry?.price).toBe('1034.9');
  });

  it('stores the per-vial size and the pack count', () => {
    const [row] = parseVendorProductsCsv(csv('BPC-157', '5mg pack of 2 vials', '$53.99'), catalogue).rows;
    expect(row?.entry).toMatchObject({ size: '5 mg', vialCount: 2 });
  });

  it.each([
    ['Melanotan-I', 'melanotan-1'],
    ['GLOW (GHK-Cu + BPC-157 + TB-500)', 'glow'],
    ['KLOW(BPC-157, TB-500, KPV, GHK-Cu)', 'klow'],
    ['Ipamorelin/CJC-1295 (No DAC)', 'ipamorelin-cjc-1295-no-dac'],
  ])('matches the sheet name %s to %s', (compound, slug) => {
    const [row] = parseVendorProductsCsv(csv(compound, '10mg', '$50'), catalogue).rows;
    expect(row?.entry?.compoundSlug).toBe(slug);
  });

  it('still rejects a compound that is not in the catalogue', () => {
    const [row] = parseVendorProductsCsv(csv('Unobtainium', '10mg', '$50'), catalogue).rows;
    expect(row?.entry).toBeNull();
    expect(row?.errors[0]).toMatch(/Unknown compound/);
  });
});
