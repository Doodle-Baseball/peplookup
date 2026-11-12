import { describe, expect, it } from 'vitest';
import { supplierMarketRows } from '@/lib/supplier-market-rows';
import { parseMarketSort } from '@/lib/supplier-market-sort';
import type { Offer } from '@/lib/schema';

function offer(supplierSlug: string, productSlug: string, listPrice: number, overrides: Partial<Offer> = {}): Offer {
  return {
    supplierSlug,
    productSlug,
    form: 'vial',
    vialSize: 10_000,
    vialCount: 1,
    listPrice,
    salePrice: null,
    currency: 'USD',
    inStock: true,
    productUrl: `https://${supplierSlug}.com/${productSlug}`,
    imageUrl: null,
    labReport: null,
    coaUrl: null,
    scrapedAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

const PRODUCT_NAMES = new Map([
  ['bpc-157', 'BPC-157'],
  ['epitalon', 'Epitalon'],
  ['bacteriostatic-water', 'Bacteriostatic Water'],
  ['solo', 'Solo Compound'],
]);
const ACTIVE = new Set(['other-a', 'other-b', 'other-c']);

const OFFERS: Offer[] = [
  // Nura BPC-157: 10 mg at $49 (and a $55 one), 20 mg at $90 sale.
  offer('nura', 'bpc-157', 4900),
  offer('nura', 'bpc-157', 5500),
  offer('nura', 'bpc-157', 9500, { vialSize: 20_000, salePrice: 9000 }),
  // Multipacks, capsules and out-of-stock vials are never compared.
  offer('nura', 'bpc-157', 1000, { vialCount: 3 }),
  offer('nura', 'bpc-157', 1000, { form: 'capsule' }),
  offer('nura', 'bpc-157', 100, { inStock: false }),
  // Three other suppliers sell the 10 mg vial; only one sells 20 mg, so 10 mg is the row.
  offer('other-a', 'bpc-157', 4000),
  offer('other-a', 'bpc-157', 4500),
  offer('other-b', 'bpc-157', 6000),
  offer('other-c', 'bpc-157', 7000),
  offer('other-c', 'bpc-157', 12000, { vialSize: 20_000 }),
  // A different size never enters the 10 mg median.
  offer('other-b', 'bpc-157', 100, { vialSize: 5_000 }),
  offer('other-b', 'bpc-157', 200, { vialSize: 15_000 }),
  offer('other-b', 'bpc-157', 300, { vialCount: 10 }),
  // Epitalon: Nura sells 10 mg, others only 50 mg, so there is nothing like-for-like.
  offer('nura', 'epitalon', 4000),
  offer('other-a', 'epitalon', 9000, { vialSize: 50_000 }),
  // Bacteriostatic water is not priced in mg.
  offer('nura', 'bacteriostatic-water', 1000),
  offer('other-a', 'bacteriostatic-water', 2000),
  // Only Nura sells it.
  offer('nura', 'solo', 5000),
  // Inactive supplier: left out of the market.
  offer('inactive', 'bpc-157', 100),
];

const rows = supplierMarketRows({
  supplierSlug: 'nura',
  marketOffers: OFFERS,
  activeSupplierSlugs: ACTIVE,
  productNames: PRODUCT_NAMES,
});

describe('supplierMarketRows', () => {
  it('keeps only compounds with an exact same-size vial elsewhere, and never bacteriostatic water', () => {
    expect(rows.map((row) => row.productSlug)).toEqual(['bpc-157']);
  });

  it('picks the vial size the most other suppliers sell, at the supplier’s cheapest price for it', () => {
    expect(rows[0]).toMatchObject({ sizeLabel: '10mg', vialMcg: 10_000, price: 4900, othersCount: 3 });
  });

  it('averages each other supplier’s cheapest vial of exactly that size', () => {
    // other-a 4000 (its cheaper 10 mg), other-b 6000, other-c 7000; 5 mg, 15 mg and packs ignored.
    expect(rows[0]!.othersAveragePrice).toBeCloseTo(17000 / 3, 10);
  });

  it('compares a size only when another supplier sells that exact size', () => {
    const twentyOnly = supplierMarketRows({
      supplierSlug: 'nura',
      marketOffers: OFFERS.filter((entry) => !(entry.productSlug === 'bpc-157' && entry.vialSize === 10_000 && entry.supplierSlug !== 'nura')),
      activeSupplierSlugs: ACTIVE,
      productNames: PRODUCT_NAMES,
    });
    expect(twentyOnly[0]).toMatchObject({ sizeLabel: '20mg', price: 9000, othersCount: 1, othersAveragePrice: 12000 });
  });
});

describe('parseMarketSort', () => {
  it('reads a valid key and direction', () => {
    expect(parseMarketSort('market-desc')).toEqual({ key: 'market', direction: 'desc' });
  });

  it('is null (most-wanted order) on anything else', () => {
    expect(parseMarketSort(undefined)).toBeNull();
    expect(parseMarketSort('perMg-asc')).toBeNull();
    expect(parseMarketSort('price-sideways')).toBeNull();
  });
});
