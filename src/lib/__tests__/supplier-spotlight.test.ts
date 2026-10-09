import { describe, expect, it } from 'vitest';
import type { Supplier } from '@/lib/schema';
import { suppliers as seedSuppliers } from '@/data/suppliers';
import { buildSupplierSpotlight } from '../supplier-spotlight';

const base: Supplier = {
  ...seedSuppliers[0]!,
  slug: 'american-peptides',
  name: 'American Peptides',
  logoUrl: 'https://www.americanpeptides.us/american-peptides-logo.png',
  affiliateUrl: 'https://www.americanpeptides.us/peplookup',
  coupon: { code: 'peplookup', percentOff: 10 },
  reviewRating: 4.1,
  reviewCount: { kind: 'exact', value: 54 },
  reviewsUrl: 'https://www.trustpilot.com/review/americanpeptides.us',
  coaVerificationLevel: 'batch_level',
  coaLabName: 'Third-party laboratory',
  shippingSpeed: '24–48 business hours processing; UPS/FedEx delivery',
  paymentMethods: ['Visa card', 'Mastercard', 'American Express', 'Discover', 'Crypto'],
  country: 'United States',
};

describe('buildSupplierSpotlight', () => {
  it('carries the coupon and attributes the rating to its source', () => {
    const spotlight = buildSupplierSpotlight(base);
    expect(spotlight.coupon).toEqual({ code: 'peplookup', percentOff: 10 });
    expect(spotlight.rating).toEqual({
      value: 4.1,
      reviewCountText: '54',
      sourceName: 'Trustpilot',
      url: 'https://www.trustpilot.com/review/americanpeptides.us',
    });
    expect(spotlight.shopUrl).toBe('https://www.americanpeptides.us/peplookup');
  });

  it('leaves out a coupon or rating that is not on file instead of filling it in', () => {
    const spotlight = buildSupplierSpotlight({ ...base, reviewRating: null, coupon: null });
    expect(spotlight.rating).toBeNull();
    expect(spotlight.coupon).toBeNull();
  });
});
