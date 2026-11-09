import 'server-only';
import { STATIC_SEO_PAGES } from '@/config/seo-pages';
import { getGuides, getProducts, getSupplierSlugsWithReviews, getSuppliers, supplierHasReviews } from '@/lib/repository';
import { couponPagePath } from '@/lib/coupon-pages';
import { reviewsPagePath } from '@/lib/review-pages';
import { pageTypeForPath, type PageType } from '@/lib/seo/indexing';

export interface SitePage {
  path: string;
  type: PageType;
}

/**
 * Every public page that exists right now: the static pages, each product,
 * each live supplier with its coupon page (when it has a code) and reviews
 * page (when it has reviews), and each published guide. The sitemap and the
 * SEO jobs both start from this list.
 */
export async function listSitePages(): Promise<SitePage[]> {
  const [products, suppliers, guides, slugsWithReviews] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getGuides(),
    getSupplierSlugsWithReviews(),
  ]);
  const paths = [
    ...STATIC_SEO_PAGES.map((page) => page.path),
    ...products.map((product) => `/product/${product.slug}`),
    ...suppliers.flatMap((supplier) => [
      `/supplier/${supplier.slug}`,
      ...(supplier.coupon ? [couponPagePath(supplier.slug)] : []),
      ...(supplierHasReviews(supplier, slugsWithReviews) ? [reviewsPagePath(supplier.slug)] : []),
    ]),
    ...guides.map((guide) => `/guide/${guide.slug}`),
  ];
  return [...new Set(paths)].map((path) => ({ path, type: pageTypeForPath(path) }));
}
