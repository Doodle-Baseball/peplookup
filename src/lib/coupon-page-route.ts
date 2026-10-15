import 'server-only';
import { notFound, permanentRedirect } from 'next/navigation';
import { getSupplier } from '@/lib/repository';
import { couponPagePath, supplierSlugFromCouponSegment } from '@/lib/coupon-pages';

/** The vendor behind a `<vendor-slug>-coupon-code` segment, only when it really has a code to show. */
async function loadCouponSupplier(segment: string) {
  const supplierSlug = supplierSlugFromCouponSegment(segment);
  if (!supplierSlug) return null;
  const supplier = await getSupplier(supplierSlug);
  if (!supplier || !supplier.coupon) return null;
  return { supplier, coupon: supplier.coupon };
}

/**
 * The vendor and code a /coupons/<segment> page shows, or a redirect or 404
 * when there is none. The route's layout calls this before anything streams,
 * so the status a search engine receives is the real one.
 */
export async function loadCouponPageOrExit(segment: string) {
  const found = await loadCouponSupplier(segment);
  if (found) return found;
  // /coupons/<vendor> (no suffix) was an address earlier on; send it to the page's real one.
  const bare = await getSupplier(segment);
  if (bare?.coupon) permanentRedirect(couponPagePath(bare.slug));
  notFound();
}
