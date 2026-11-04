import type { QualityPageType } from '@/lib/seo/indexing';

/**
 * Whether a failed quality rule actually takes a page out of search (noindex
 * and out of the sitemap), per page type.
 *
 * All off: on 2026-11-04 the site owner chose to keep every page indexable
 * while the rules are reported in /admin/seo ("Indexed ✓ · Quality check
 * failing: …"), and to switch enforcement on once content is filled in.
 * Turning one on here is the only change needed: isIndexable() reads it, and
 * the page's robots tag, the sitemap and the admin all follow.
 */
export const QUALITY_RULES_ENFORCED: Readonly<Record<QualityPageType, boolean>> = {
  supplier: false,
  coupon: false,
  review: false,
  product: false,
  guide: false,
};

/** B2 thresholds, in one place so the admin, the pages and the build check quote the same numbers. */
export const QUALITY_THRESHOLDS = {
  supplierMinPricedProducts: 5,
  supplierMinDescriptionWords: 120,
  reviewSummaryMinWords: 60,
  /** pg_trgm similarity above which two texts count as duplicates. */
  maxSimilarity: 0.7,
  couponTestedWithinDays: 60,
  productMinActiveSuppliers: 3,
  /** B4: more pages than this made indexable in 7 days triggers a warning. */
  maxNewlyIndexablePerWeek: 15,
  /** B6: a supplier whose prices are older than this gets an admin warning. */
  stalePriceDays: 30,
} as const;
