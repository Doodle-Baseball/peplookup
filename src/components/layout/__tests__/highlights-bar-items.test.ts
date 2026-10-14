import { describe, expect, it } from 'vitest';
import { highlightItems, promotedFacts } from '../highlights-bar-items';

const coupon = { code: 'SAVE', percentOff: 10 } as never;

function supplier(slug: string, hasCoupon = false) {
  return { slug, coupon: hasCoupon ? coupon : null };
}

function offer(supplierSlug: string, productSlug: string, coaUrl: string | null = null) {
  return { supplierSlug, productSlug, coaUrl, labReport: null };
}

describe('highlightItems', () => {
  it('rounds large counts down so "N+" is always true', () => {
    const suppliers = Array.from({ length: 88 }, (_, index) => supplier(`s${index}`, index < 72));
    const offers = suppliers.flatMap((s, index) => [offer(s.slug, `p${index % 36}`, 'https://coa.example/x.pdf')]);
    expect(highlightItems(suppliers, offers)).toEqual([
      '80+ suppliers',
      '30+ compounds',
      '80+ supplier COAs',
      'Price per mg comparison',
      '70+ coupon codes',
    ]);
  });

  it('states small counts exactly and drops anything at zero', () => {
    expect(highlightItems([supplier('a'), supplier('b')], [offer('a', 'bpc-157')])).toEqual([
      '2 suppliers',
      '1 compound',
      'Price per mg comparison',
    ]);
  });

  it("ignores a delisted supplier's leftover listings", () => {
    expect(highlightItems([supplier('a')], [offer('gone', 'bpc-157', 'https://coa.example/x.pdf')])).toEqual([
      '1 supplier',
      'Price per mg comparison',
    ]);
  });
});

describe('promotedFacts', () => {
  const promo = {
    slug: 'american-peptides',
    name: 'American Peptides',
    logoUrl: null,
    shopUrl: 'https://www.americanpeptides.us/peplookup',
    websiteHost: 'americanpeptides.us',
    coupon: { code: 'peplookup', percentOff: 10 },
    inStockCompoundCount: 30,
    listingCount: 53,
    coaListingCount: 47,
    country: 'United States',
    foundedYear: 2026,
    processingTime: '24–48 business hours processing',
    paymentMethods: ['Visa card', 'Crypto'],
    rating: null,
  };

  it('shows the coupon, rating, processing and payments in short form, with no price claim', () => {
    const facts = promotedFacts({
      ...promo,
      paymentMethods: ['Visa card', 'Mastercard', 'ACH/Wire Transfer', 'Crypto'],
      rating: { value: '3.4', reviewCountText: null, sourceLabel: 'Trustpilot', url: null },
    });
    expect(facts.map((fact) => fact.text)).toEqual([
      '10% off with code peplookup',
      '3.4/5 on Trustpilot',
      '24–48h processing',
      'Cards · ACH/Wire · Crypto',
    ]);
  });

  it('leaves out anything the record does not hold', () => {
    const bare = { ...promo, coupon: null, processingTime: null, paymentMethods: [], rating: null };
    expect(promotedFacts(bare)).toEqual([]);
  });
});
