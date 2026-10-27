import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { guideHasContent, type Guide } from '@/data/guides';
import { couponPagePath } from '@/lib/coupon-pages';
import { reviewsPagePath } from '@/lib/review-pages';
import { indexableWhenSeoAdded } from '@/lib/seo-indexing';

/** The parts of an /admin/seo override that decide whether a page belongs in the sitemap. */
export interface SitemapSeoFields {
  robotsIndex: boolean;
  canonicalUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface SitemapSupplier {
  slug: string;
  hasCoupon: boolean;
  hasReviews: boolean;
  inventoryRefreshedAt: string | null;
}

export interface SitemapInput {
  staticPaths: readonly string[];
  productSlugs: readonly string[];
  suppliers: readonly SitemapSupplier[];
  guides: readonly Guide[];
  /** Only offers whose supplier and product are both live, so dates come from listings people can see. */
  offers: readonly { productSlug: string; supplierSlug: string; scrapedAt: string }[];
  /** Override by path, for every path that has one. */
  seoByPath: ReadonlyMap<string, SitemapSeoFields>;
}

/**
 * Static pages that render a 200 but hold nothing for a search engine: the
 * watchlist lives in each visitor's own browser, so a crawler sees it empty.
 */
const UNLISTED_STATIC_PATHS: ReadonlySet<string> = new Set(['/watchlist']);

const ORIGIN = `https://${site.domain}`;

function absoluteUrl(path: string): string {
  return path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
}

/** "/x", "/x/" and "https://www.peplookup.com/x" all name the same page. */
function normalisedPath(url: string): string {
  const path = url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : url;
  const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return trimmed === '' ? '/' : trimmed;
}

/** A page whose canonical names another URL is a duplicate; only the canonical belongs in the sitemap. */
function isOwnCanonical(path: string, seo: SitemapSeoFields | undefined): boolean {
  return !seo?.canonicalUrl || normalisedPath(seo.canonicalUrl) === path;
}

function latest(dates: readonly (string | null)[]): Date | undefined {
  const times = dates.filter((date): date is string => date !== null).map((date) => Date.parse(date));
  const valid = times.filter((time) => !Number.isNaN(time));
  return valid.length > 0 ? new Date(Math.max(...valid)) : undefined;
}

/**
 * Every URL the sitemap lists. A URL is in only when the page answers 200, is
 * indexable (no noindex from its own rule or from /admin/seo) and is its own
 * canonical, the same rules each page applies to its own metadata, so the
 * sitemap can never list a page that tells search engines to skip it.
 */
export function buildSitemapEntries(input: SitemapInput): MetadataRoute.Sitemap {
  const { seoByPath } = input;
  // Most pages are indexable unless an override switches that off; coupon and
  // reviews pages start noindex and need their SEO saved first.
  const indexableByDefault = (seo: SitemapSeoFields | undefined) => seo?.robotsIndex ?? true;
  const generatedPageIndexable = (seo: SitemapSeoFields | undefined) => indexableWhenSeoAdded(seo ?? null);
  const listable = (path: string, indexable = indexableByDefault) => {
    const seo = seoByPath.get(path);
    return indexable(seo) && isOwnCanonical(path, seo);
  };

  const offerDates = (match: (offer: SitemapInput['offers'][number]) => boolean) =>
    input.offers.filter(match).map((offer) => offer.scrapedAt);

  // Drafts never reach here through getGuides(), but the check keeps a draft out even if a caller passes one.
  const publishedGuides = input.guides.filter((guide) => guide.isPublished !== false && guideHasContent(guide));
  const staticPaths = input.staticPaths.filter(
    (path) => !UNLISTED_STATIC_PATHS.has(path) && (path !== '/guides' || publishedGuides.length > 0),
  );

  const entries: { path: string; lastModified?: Date }[] = [
    ...staticPaths.filter((path) => listable(path)).map((path) => ({ path })),
    ...input.productSlugs
      .map((slug) => ({
        path: `/products/${slug}`,
        lastModified: latest(offerDates((offer) => offer.productSlug === slug)),
      }))
      .filter((entry) => listable(entry.path)),
    ...input.suppliers.flatMap((supplier) => {
      const lastModified = latest([
        supplier.inventoryRefreshedAt,
        ...offerDates((offer) => offer.supplierSlug === supplier.slug),
      ]);
      const profile = `/suppliers/${supplier.slug}`;
      const coupon = couponPagePath(supplier.slug);
      const reviews = reviewsPagePath(supplier.slug);
      return [
        ...(listable(profile) ? [{ path: profile, lastModified }] : []),
        ...(supplier.hasCoupon && listable(coupon, generatedPageIndexable) ? [{ path: coupon, lastModified }] : []),
        ...(supplier.hasReviews && listable(reviews, generatedPageIndexable) ? [{ path: reviews, lastModified }] : []),
      ];
    }),
    ...publishedGuides
      .map((guide) => ({
        path: `/guides/${guide.slug}`,
        // updated_at moves on every admin save; the publish date covers guides that ship in the repository.
        lastModified: latest([guide.updatedAt ?? null, guide.publishedAt]),
      }))
      .filter((entry) => listable(entry.path)),
  ];

  return entries.map(({ path, lastModified }) => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  }));
}
