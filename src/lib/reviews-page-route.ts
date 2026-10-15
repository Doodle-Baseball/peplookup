import 'server-only';
import { notFound, permanentRedirect } from 'next/navigation';
import { getSupplier, getSupplierSlugsWithReviews, supplierHasReviews } from '@/lib/repository';
import { reviewsPagePath, supplierSlugFromReviewsSegment } from '@/lib/review-pages';

/**
 * The vendor a /reviews/<segment> page is about, or a redirect or 404 when
 * there is none. The route's layout calls this before anything streams, so the
 * status a search engine receives is the real one.
 */
export async function loadReviewsSupplierOrExit(segment: string) {
  const supplierSlug = supplierSlugFromReviewsSegment(segment);
  const [supplier, storedSlugs] = await Promise.all([
    supplierSlug ? getSupplier(supplierSlug) : null,
    getSupplierSlugsWithReviews(),
  ]);
  // A vendor with no reviews has no reviews page.
  if (supplier && supplierHasReviews(supplier, storedSlugs)) return supplier;
  // /reviews/<vendor> (no suffix) is a natural guess; send it to the page's real address.
  const bare = await getSupplier(segment);
  if (bare && supplierHasReviews(bare, storedSlugs)) permanentRedirect(reviewsPagePath(bare.slug));
  notFound();
}
