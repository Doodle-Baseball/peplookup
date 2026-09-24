import { describe, expect, it } from 'vitest';
import { couponCodeFromLinks } from '../coupon-detect';

describe('couponCodeFromLinks', () => {
  it('finds a coupon code carried in a coupon parameter', () => {
    expect(couponCodeFromLinks(['https://aminoclub.com?utm_source=affiliate_marketing&code=PRODUCTS'])).toBe('PRODUCTS');
    expect(couponCodeFromLinks(['https://ramppeptides.com/coas/?coupon=products'])).toBe('products');
  });

  it('ignores affiliate IDs, which are not discount codes', () => {
    expect(
      couponCodeFromLinks([
        'https://eliteedgebiotech.com/shipping-policy?ref=74',
        'https://dynotides.shop/?aff=31',
        'https://peaklabpeptides.com?afref=a1n9',
        'https://axispeptidelabs.com/ref/peplookup/',
      ]),
    ).toBeNull();
  });

  it('checks links in order and skips blanks and malformed URLs', () => {
    expect(
      couponCodeFromLinks([null, 'not a url', 'https://a.com/?ref=x', 'https://b.com/?promo=SAVE10', 'https://c.com/?code=LATER']),
    ).toBe('SAVE10');
  });
});
