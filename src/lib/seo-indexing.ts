/**
 * Some generated pages (every vendor's coupon page and reviews page) start
 * hidden from search engines. One becomes indexable only once its SEO details
 * are in (a meta title and a meta description are saved) AND indexing has been
 * switched on for it in /admin/seo. A page with no saved SEO, or with the
 * switch off, stays noindex, whatever else is on its row.
 */
export function indexableWhenSeoAdded(
  override: { robotsIndex: boolean; metaTitle: string | null; metaDescription: string | null } | null,
): boolean {
  return Boolean(override && override.robotsIndex && override.metaTitle?.trim() && override.metaDescription?.trim());
}
