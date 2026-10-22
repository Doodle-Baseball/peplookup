import { describe, expect, it } from 'vitest';
import type { Offer } from '@/lib/schema';
import { groupCatalogProducts } from '../catalog-products';

const NOW = new Date('2026-10-22T12:00:00.000Z');

const products = new Map([
  ['bpc-157', { slug: 'bpc-157', name: 'BPC-157' }],
  ['tb-500', { slug: 'tb-500', name: 'TB-500' }],
]);

function offer(over: Partial<Offer> = {}): Offer {
  return {
    id: `${over.productSlug ?? 'bpc-157'}-${over.form ?? 'vial'}-${over.vialSize ?? 10_000}-${over.vialCount ?? 1}`,
    supplierSlug: 'acme',
    productSlug: 'bpc-157',
    form: 'vial',
    vialSize: 10_000,
    vialCount: 1,
    listPrice: 6000,
    salePrice: null,
    currency: 'USD',
    inStock: true,
    productUrl: 'https://vendor.example/bpc?ref=PEP',
    imageUrl: 'https://vendor.example/bpc.webp',
    labReport: null,
    coaUrl: null,
    scrapedAt: '2026-10-21T12:00:00.000Z',
    ...over,
  };
}

const noCoupon = { slug: 'acme', coupon: null };

describe('groupCatalogProducts', () => {
  it('puts every size, pack and form of a product on one card', () => {
    const grouped = groupCatalogProducts(
      [
        offer({ vialSize: 10_000 }),
        offer({ productSlug: 'tb-500' }),
        offer({ vialSize: 5000 }),
        offer({ vialSize: 10_000, vialCount: 10, listPrice: 72_000 }),
        offer({ form: 'spray', vialSize: 5000 }),
      ],
      products,
      noCoupon,
      NOW,
    );
    expect(grouped.map((product) => product.name)).toEqual(['BPC-157', 'TB-500']);
    expect(grouped[0]!.variants.map((variant) => `${variant.formLabel} ${variant.optionLabel}`)).toEqual([
      'Vial 5mg',
      'Vial 10mg',
      'Vial 10mg × 10',
      'Spray 5mg',
    ]);
  });

  it('gives each option its own price, links and size line', () => {
    const [product] = groupCatalogProducts(
      [
        offer({ vialSize: 5000, listPrice: 4000, coaUrl: 'https://lab.example/5mg.pdf', productUrl: 'https://vendor.example/5' }),
        offer({ vialSize: 10_000, vialCount: 10, listPrice: 72_000, productUrl: 'https://vendor.example/kit' }),
      ],
      products,
      noCoupon,
      NOW,
    );
    const [single, kit] = product!.variants;
    expect(single).toMatchObject({
      priceText: '$40.00',
      perMgText: '$8.00/mg',
      sizeLabel: '5 mg',
      coaHref: 'https://lab.example/5mg.pdf',
      buyHref: `/go?to=${encodeURIComponent('https://vendor.example/5')}`,
    });
    // $720 for 10 × 10mg is $7.20/mg, not $72/mg.
    expect(kit).toMatchObject({ priceText: '$720.00', perMgText: '$7.20/mg', sizeLabel: '10 mg · pack of 10 vials', coaHref: null });
  });

  it('applies the coupon like the offer cards do, keeping the list price to strike through', () => {
    const [product] = groupCatalogProducts([offer({ listPrice: 6000 })], products, { slug: 'acme', coupon: { code: 'PEP', percentOff: 10 } }, NOW);
    expect(product!.variants[0]).toMatchObject({ priceText: '$54.00', listPriceText: '$60.00', couponApplied: true });
  });

  it('prefers a recorded sale price over the coupon', () => {
    const [product] = groupCatalogProducts(
      [offer({ listPrice: 6000, salePrice: 5000 })],
      products,
      { slug: 'acme', coupon: { code: 'PEP', percentOff: 10 } },
      NOW,
    );
    expect(product!.variants[0]).toMatchObject({ priceText: '$50.00', listPriceText: '$60.00', couponApplied: false });
  });

  it('shows no struck price when nothing is discounted', () => {
    const [product] = groupCatalogProducts([offer()], products, noCoupon, NOW);
    expect(product!.variants[0]!.listPriceText).toBeNull();
  });

  it('marks each option with its own stock and age', () => {
    const [product] = groupCatalogProducts(
      [offer({ vialSize: 5000, inStock: false, scrapedAt: '2026-09-22T12:00:00.000Z' }), offer()],
      products,
      noCoupon,
      NOW,
    );
    expect(product!.variants.map((variant) => [variant.inStock, variant.seenText, variant.stale])).toEqual([
      [false, '4w ago', true],
      [true, '1d ago', false],
    ]);
  });

  it('drops listings whose compound is unknown', () => {
    expect(groupCatalogProducts([offer({ productSlug: 'mystery' })], products, noCoupon, NOW)).toEqual([]);
  });
});

describe('supplier catalogue overrides', () => {
  const water = new Map([['bacteriostatic-water', { slug: 'bacteriostatic-water', name: 'Bacteriostatic Water' }]]);
  const hospira = { slug: 'hospira-bacteriostatic-water', coupon: null };
  const packs = [1, 5, 10, 25, 100].map((count) =>
    offer({ productSlug: 'bacteriostatic-water', vialSize: 30_000, vialCount: count, listPrice: 2299 * count }),
  );

  it('shows each Hospira pack on its own card under the Hospira product name', () => {
    const cards = groupCatalogProducts([...packs].reverse(), water, hospira, NOW);
    expect(cards).toHaveLength(5);
    expect(new Set(cards.map((card) => card.key)).size).toBe(5);
    expect(cards.every((card) => card.name === 'Hospira Bacteriostatic Water' && card.variants.length === 1)).toBe(true);
    expect(cards.map((card) => card.variants[0]!.optionLabel)).toEqual(['30mg', '30mg × 5', '30mg × 10', '30mg × 25', '30mg × 100']);
    expect(cards[0]!.compareHref).toBe('/products/bacteriostatic-water');
  });

  it('keeps one card per product for every other supplier', () => {
    const cards = groupCatalogProducts(packs, water, noCoupon, NOW);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({ key: 'bacteriostatic-water', name: 'Bacteriostatic Water' });
    expect(cards[0]!.variants).toHaveLength(5);
  });
});
