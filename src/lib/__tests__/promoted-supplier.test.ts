import { describe, expect, it } from 'vitest';
import { buildPromotedSupplier, shortCountry, shortPayments, shortProcessing } from '../promoted-supplier';

const american = {
  slug: 'american-peptides',
  name: 'American Peptides',
  logoUrl: null,
  faviconUrl: 'https://example.com/icon.png',
  affiliateUrl: 'https://www.americanpeptides.us/peplookup',
  homepageUrl: 'https://www.americanpeptides.us/peplookup',
  coupon: { code: 'peplookup', percentOff: 10 } as never,
  country: 'United States',
  foundedYear: 2026,
  shippingSpeed: '24–48 business hours processing; UPS/FedEx delivery',
  paymentMethods: ['Visa card', 'Crypto'],
  reviewRating: 3.4,
  reviewCount: { kind: 'exact', value: 12 } as never,
  reviewsUrl: 'https://www.trustpilot.com/review/americanpeptides.us',
};

function offer(productSlug: string, inStock: boolean, coaUrl: string | null = null, supplierSlug = 'american-peptides') {
  return { supplierSlug, productSlug, inStock, coaUrl, labReport: null };
}

describe('buildPromotedSupplier', () => {
  it("counts the supplier's own live listings and keeps the affiliate link", () => {
    const promo = buildPromotedSupplier(
      [american],
      [
        offer('bpc-157', true, 'https://coa/1.pdf'),
        offer('bpc-157', true),
        offer('tb-500', false, 'https://coa/2.pdf'),
        offer('semaglutide', true, null, 'someone-else'),
      ],
      { slug: 'american-peptides', logoUrl: 'https://example.com/favicon.ico' },
    );
    expect(promo).toMatchObject({
      name: 'American Peptides',
      logoUrl: 'https://example.com/favicon.ico',
      shopUrl: 'https://www.americanpeptides.us/peplookup',
      websiteHost: 'americanpeptides.us',
      coupon: { code: 'peplookup', percentOff: 10 },
      inStockCompoundCount: 1,
      listingCount: 3,
      coaListingCount: 2,
      processingTime: '24–48 business hours processing',
      rating: { value: '3.4', reviewCountText: '12', sourceLabel: 'Trustpilot', url: 'https://www.trustpilot.com/review/americanpeptides.us' },
    });
  });

  it('shows no rating when none is on record', () => {
    expect(buildPromotedSupplier([{ ...american, reviewRating: null }], [], { slug: 'american-peptides', logoUrl: null })?.rating).toBeNull();
  });

  it('promotes nobody when the supplier is not listed or none is set', () => {
    expect(buildPromotedSupplier([american], [], { slug: 'delisted-supplier', logoUrl: null })).toBeNull();
    expect(buildPromotedSupplier([american], [], null)).toBeNull();
  });
});

describe('short forms', () => {
  it('shortens processing time, keeping wordings it does not recognise', () => {
    expect(shortProcessing('24–48 business hours processing')).toBe('24–48h processing');
    expect(shortProcessing('Same-day dispatch')).toBe('Same-day dispatch');
  });

  it('groups payment methods without dropping unknown ones', () => {
    expect(
      shortPayments(['Visa card', 'Mastercard', 'American Express', 'Discover', 'ACH/Wire Transfer', 'Crypto']),
    ).toBe('Cards · ACH/Wire · Crypto');
    expect(shortPayments(['Zelle', 'Visa'])).toBe('Zelle · Cards');
    expect(shortPayments(['Other methods'])).toBe('Other methods');
  });

  it('names the base country briefly', () => {
    expect(shortCountry('United States')).toBe('US-based');
    expect(shortCountry('Canada')).toBe('Canada-based');
  });
});
