import { describe, expect, it } from 'vitest';
import { couponPagePath, supplierSlugFromCouponPath, supplierSlugFromCouponSegment } from '@/lib/coupon-pages';

describe('coupon page paths', () => {
  it('builds the page path from a vendor slug', () => {
    expect(couponPagePath('amino-club')).toBe('/coupon/amino-club-coupon-code');
  });

  it('recovers the vendor slug from a segment or path', () => {
    expect(supplierSlugFromCouponSegment('amino-club-coupon-code')).toBe('amino-club');
    expect(supplierSlugFromCouponPath('/coupon/amino-club-coupon-code')).toBe('amino-club');
  });

  it('rejects anything that is not a coupon page', () => {
    expect(supplierSlugFromCouponSegment('coupons')).toBeNull();
    expect(supplierSlugFromCouponSegment('-coupon-code')).toBeNull();
    expect(supplierSlugFromCouponPath('/supplier/amino-club-coupon-code')).toBeNull();
    expect(supplierSlugFromCouponPath('amino-club-coupon-code')).toBeNull();
    expect(supplierSlugFromCouponPath('/amino-club-coupon-code')).toBeNull();
    expect(supplierSlugFromCouponPath('/coupon/amino/club-coupon-code')).toBeNull();
  });
});
