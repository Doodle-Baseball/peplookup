import type { MetadataRoute } from 'next';
import { STATIC_SEO_PAGES } from '@/config/seo-pages';
import {
  getAllOffers,
  getGuides,
  getProducts,
  getSupplierSlugsWithReviews,
  getSuppliers,
  supplierHasReviews,
} from '@/lib/repository';
import { getSeoOverridesByPath } from '@/lib/seo';
import { buildSitemapEntries } from '@/lib/sitemap-entries';

/** Regenerated hourly, the same window as the catalogue caches it reads. */
export const revalidate = 3600;

/**
 * /sitemap.xml, built from the live catalogue rather than kept by hand: the
 * hand-kept file drifted (suppliers added since were missing, a deactivated one
 * stayed listed). Which URLs qualify is decided in buildSitemapEntries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, suppliers, offers, guides, slugsWithReviews, seoByPath] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getAllOffers(),
    getGuides(),
    getSupplierSlugsWithReviews(),
    getSeoOverridesByPath(),
  ]);

  const productSlugs = new Set(products.map((product) => product.slug));
  const supplierSlugs = new Set(suppliers.map((supplier) => supplier.slug));

  return buildSitemapEntries({
    staticPaths: STATIC_SEO_PAGES.map((page) => page.path),
    productSlugs: [...productSlugs],
    suppliers: suppliers.map((supplier) => ({
      slug: supplier.slug,
      hasCoupon: supplier.coupon !== null,
      hasReviews: supplierHasReviews(supplier, slugsWithReviews),
      inventoryRefreshedAt: supplier.inventoryRefreshedAt,
    })),
    guides,
    offers: offers.filter((offer) => productSlugs.has(offer.productSlug) && supplierSlugs.has(offer.supplierSlug)),
    seoByPath,
  });
}
