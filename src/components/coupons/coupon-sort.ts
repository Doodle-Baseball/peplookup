export type CouponSortKey = 'discount' | 'listings' | 'name';

export const DEFAULT_COUPON_SORT: CouponSortKey = 'discount';

interface SortableCouponVendor {
  name: string;
  listingCount: number;
  coupon: { percentOff: number };
}

/**
 * Card order on /coupons. Shared by the client browser and the server page,
 * so the page's ItemList lists vendors in the order a visitor first sees.
 */
export function compareCouponVendors(sort: CouponSortKey) {
  return (a: SortableCouponVendor, b: SortableCouponVendor): number => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'listings') return b.listingCount - a.listingCount || a.name.localeCompare(b.name);
    return b.coupon.percentOff - a.coupon.percentOff || b.listingCount - a.listingCount;
  };
}
