import { describe, expect, it } from 'vitest';
import {
  computeSupplierFacts,
  couponPriceRows,
  isComparisonToolAnswer,
  ordinal,
  supplierSpecificFaqs,
  supplierSummary,
  supplierTitleWithoutCompetingWords,
} from '@/lib/supplier-facts';
import { isContentV2, PROTECTED_SUPPLIERS, supplierPageUsesContentV2 } from '@/lib/seo/protected';
import { indexDecision } from '@/lib/seo/indexing';
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

const PRODUCTS = [
  { slug: 'bpc-157', name: 'BPC-157' },
  { slug: 'retatrutide', name: 'Retatrutide' },
];
const ACTIVE = [
  { slug: 'palmetto', name: 'Palmetto Peptides' },
  { slug: 'other-a', name: 'Other A' },
  { slug: 'other-b', name: 'Other B' },
];
const PALMETTO = {
  slug: 'palmetto',
  name: 'Palmetto Peptides',
  coupon: { code: 'PRODUCTS', percentOff: 10 },
  couponVerifiedAt: null,
  foundedYear: null,
  country: null,
  paymentMethods: [] as string[],
  coaLabName: null,
};
const OFFERS: Offer[] = [
  // $40 / 10 mg = $4.00/mg, the cheapest Retatrutide.
  offer('palmetto', 'retatrutide', 4000, { coaUrl: 'https://palmetto.com/coa.pdf' }),
  offer('other-a', 'retatrutide', 5000),
  offer('other-b', 'retatrutide', 6000),
  // $30 / 10 mg = $3.00/mg, 2nd of 3 behind $2.50/mg.
  offer('palmetto', 'bpc-157', 3000),
  offer('other-a', 'bpc-157', 2500),
  offer('other-b', 'bpc-157', 3500),
  // Out of stock: must never win.
  offer('other-b', 'bpc-157', 100, { inStock: false }),
];

describe('computeSupplierFacts', () => {
  const facts = computeSupplierFacts(PALMETTO, ACTIVE, OFFERS, PRODUCTS);

  it('counts listings, compounds and COA coverage', () => {
    expect(facts.listingCount).toBe(2);
    expect(facts.compoundCount).toBe(2);
    expect(facts.coaListingCount).toBe(1);
  });

  it('ranks in-stock prices per mg against every active supplier', () => {
    const byName = Object.fromEntries(facts.standings.map((standing) => [standing.productName, standing]));
    expect(byName.Retatrutide).toMatchObject({ rank: 1, supplierCount: 3, ownPerMg: 400, medianPerMg: 500 });
    expect(byName['BPC-157']).toMatchObject({ rank: 2, supplierCount: 3, ownPerMg: 300 });
    expect(byName['BPC-157']!.cheapest).toEqual({ supplierName: 'Other A', perMg: 250 });
    expect(facts.bestRanks.map((standing) => standing.productName)).toEqual(['Retatrutide', 'BPC-157']);
  });
});

describe('supplierSummary', () => {
  it('states only the facts held, in plain sentences', () => {
    expect(supplierSummary(computeSupplierFacts(PALMETTO, ACTIVE, OFFERS, PRODUCTS))).toBe(
      'Palmetto Peptides lists 2 products across 2 compounds. It is the cheapest of 3 suppliers per mg for Retatrutide at $4.00/mg and 2nd of 3 for BPC-157 at $3.00/mg. 1 of 2 listings has a published COA. Code PRODUCTS gives 10% off.',
    );
  });

  it('adds the tested date only when the code has been tested', () => {
    const tested = computeSupplierFacts({ ...PALMETTO, couponVerifiedAt: '2026-11-02' }, ACTIVE, OFFERS, PRODUCTS);
    expect(supplierSummary(tested)).toContain('Code PRODUCTS gives 10% off (last tested November 2, 2026).');
  });

  it('says "All N listings" for full COA coverage and "the United States"', () => {
    const covered = OFFERS.map((entry) => (entry.supplierSlug === 'palmetto' ? { ...entry, coaUrl: 'https://palmetto.com/coa.pdf' } : entry));
    const summary = supplierSummary(
      computeSupplierFacts({ ...PALMETTO, foundedYear: 2025, country: 'United States' }, ACTIVE, covered, PRODUCTS),
    );
    expect(summary).toContain('All 2 listings have a published COA.');
    expect(summary).toContain('Founded in 2025, it operates from the United States.');
  });

  it('names the COA lab and payment methods it holds, without doubled full stops', () => {
    const summary = supplierSummary(
      computeSupplierFacts({ ...PALMETTO, coaLabName: 'Janoshik', paymentMethods: ['Zelle', 'invoice-based payment.'] }, ACTIVE, OFFERS, PRODUCTS),
    );
    expect(summary).toContain('1 of 2 listings has a published COA from Janoshik.');
    expect(summary).toContain('It takes Zelle and invoice-based payment. Code');
    const generic = supplierSummary(computeSupplierFacts({ ...PALMETTO, coaLabName: 'Third-party laboratory' }, ACTIVE, OFFERS, PRODUCTS));
    expect(generic).toContain('1 of 2 listings has a published COA.');
  });

  it('prints nothing for a supplier with no listings, code or record', () => {
    const empty = computeSupplierFacts({ ...PALMETTO, coupon: null }, ACTIVE, [], PRODUCTS);
    expect(supplierSummary(empty)).toBe('');
  });

  it('writes ordinals correctly', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd']);
  });
});

describe('couponPriceRows', () => {
  it('applies the code to the list price and ranks the result', () => {
    const facts = computeSupplierFacts(PALMETTO, ACTIVE, OFFERS, PRODUCTS);
    const rows = couponPriceRows(facts, 'palmetto', OFFERS, new Set(ACTIVE.map((entry) => entry.slug)));
    const bpc = rows.find((row) => row.productName === 'BPC-157')!;
    // $30.00 less 10% is $27.00, which is $2.70/mg: still behind Other A's $2.50/mg.
    expect(bpc).toMatchObject({ price: 3000, priceAfterCode: 2700, perMgAfterCode: 270, rank: 2, supplierCount: 3 });
    expect(rows.find((row) => row.productName === 'Retatrutide')).toMatchObject({ price: 4000, priceAfterCode: 3600, rank: 1 });
  });

  it('skips a listing that already has its own sale price, as the rest of the site does', () => {
    const onSale = [offer('palmetto', 'bpc-157', 3000, { salePrice: 2800 }), ...OFFERS.slice(4)];
    const facts = computeSupplierFacts(PALMETTO, ACTIVE, onSale, PRODUCTS);
    expect(couponPriceRows(facts, 'palmetto', onSale, new Set(ACTIVE.map((entry) => entry.slug)))).toEqual([]);
  });
});

describe('supplierTitleWithoutCompetingWords', () => {
  it.each([
    ['Nura Peptide Review: Prices, COA Lab Results and 20% Coupon', 'Nura Peptide: Prices, COA Lab Results | PepLookup'],
    ['99 Purity Peptides Review: Prices, COA Testing and Coupon Codes', '99 Purity Peptides: Prices, COA Testing | PepLookup'],
    ['Kylo Peptides Review: Prices & Coupon Code | PepLookup', 'Kylo Peptides: Prices | PepLookup'],
    ['Eon Peptides Coupon Code PEPLOOKUP + Prices (October 2026)', 'Eon Peptides: Prices (October 2026) | PepLookup'],
    ['Simms Research Coupon: 10% Off Code + Prices (October 2026)', 'Simms Research: Prices (October 2026) | PepLookup'],
    ['Peptides Canada Review: Prices, COA Testing and Shipping', 'Peptides Canada: Prices, COA Testing and Shipping'],
  ])('%s', (before, after) => {
    expect(supplierTitleWithoutCompetingWords(before)).toBe(after);
  });

  it('leaves a title without the words untouched', () => {
    expect(supplierTitleWithoutCompetingWords('Purgo Labs: Prices per mg')).toBe('Purgo Labs: Prices per mg');
  });
});

describe('supplierSpecificFaqs', () => {
  const supplier = { country: 'United States', paymentMethods: ['Zelle'], coaLabName: 'Janoshik', coupon: { code: 'PEPLOOKUP', percentOff: 20 } };

  it('keeps answers with a fact of this supplier, at most four', () => {
    const faqs = [
      { question: 'a', answer: 'No. PepLookup is a comparison tool.' },
      { question: 'b', answer: 'Use code PEPLOOKUP.' },
      { question: 'c', answer: 'They accept Zelle.' },
      { question: 'd', answer: 'Ships in 2 days.' },
      { question: 'e', answer: 'Tested by Janoshik.' },
      { question: 'f', answer: 'Based in the United States.' },
    ];
    expect(supplierSpecificFaqs(faqs, supplier).map((faq) => faq.question)).toEqual(['b', 'c', 'd', 'e']);
    expect(isComparisonToolAnswer(faqs[0]!.answer)).toBe(true);
  });
});

describe('the CONTENT_V2 switch', () => {
  it('is on only for the exact value "true"', () => {
    expect(isContentV2({ CONTENT_V2: 'true' })).toBe(true);
    expect(isContentV2({ CONTENT_V2: 'TRUE' })).toBe(false);
    expect(isContentV2({})).toBe(false);
  });

  it('never applies to the 24 hand-written supplier pages', () => {
    expect(PROTECTED_SUPPLIERS.size).toBe(24);
    expect(supplierPageUsesContentV2('amino-club', { CONTENT_V2: 'true' })).toBe(false);
    // Similar names that are not protected.
    expect(supplierPageUsesContentV2('nextgen-peptides', { CONTENT_V2: 'true' })).toBe(true);
    expect(supplierPageUsesContentV2('pure-peptides-uk', { CONTENT_V2: 'true' })).toBe(true);
  });

  it('makes a reviews page with no summary noindex, and only then', () => {
    const context = { isProduction: true, adminRobotsIndex: true, readyToIndex: true, now: new Date('2026-11-04') };
    const noSummary = { type: 'review' as const, summaryWords: 0, mostSimilarSummary: null };
    expect(indexDecision(noSummary, { ...context, contentV2: true }).indexable).toBe(false);
    expect(indexDecision(noSummary, context).indexable).toBe(true);
    expect(indexDecision({ ...noSummary, summaryWords: 80 }, { ...context, contentV2: true }).indexable).toBe(true);
  });
});
