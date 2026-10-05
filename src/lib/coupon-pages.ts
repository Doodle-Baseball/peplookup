import { indexableWhenSeoAdded } from '@/lib/seo-indexing';

/**
 * Every vendor with a coupon gets its own page at `/coupons/<vendor-slug>-coupon-code`,
 * so each vendor's code can be found by the phrase people actually search.
 */
const COUPON_SUFFIX = '-coupon-code';
const COUPON_PREFIX = '/coupons/';

export function couponPagePath(supplierSlug: string): string {
  return `${COUPON_PREFIX}${supplierSlug}${COUPON_SUFFIX}`;
}

/** The vendor slug in a `<vendor-slug>-coupon-code` URL segment, or null when it isn't one. */
export function supplierSlugFromCouponSegment(segment: string): string | null {
  if (!segment.endsWith(COUPON_SUFFIX)) return null;
  const slug = segment.slice(0, -COUPON_SUFFIX.length);
  return slug.length > 0 ? slug : null;
}

/** Same as {@link supplierSlugFromCouponSegment}, for a full path such as "/coupons/amino-club-coupon-code". */
export function supplierSlugFromCouponPath(path: string): string | null {
  if (!path.startsWith(COUPON_PREFIX)) return null;
  const segment = path.slice(COUPON_PREFIX.length);
  return segment.includes('/') ? null : supplierSlugFromCouponSegment(segment);
}

/** Coupon pages start hidden from search engines; see {@link indexableWhenSeoAdded} for the rule. */
export const couponPageIndexable = indexableWhenSeoAdded;
