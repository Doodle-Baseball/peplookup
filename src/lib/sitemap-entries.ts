import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { guideHasContent, type Guide } from '@/data/guides';
import { couponPagePath } from '@/lib/coupon-pages';
import { reviewsPagePath } from '@/lib/review-pages';
import { publicPath, supplierPath } from '@/lib/supplier-path';

/** The part of an /admin/seo override the sitemap still reads itself: the canonical. */
export interface SitemapSeoFields {
  canonicalUrl: string | null;
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
  /** The page's indexing decision (src/lib/seo/indexing.ts), the same one its robots tag uses. */
  isIndexable: (path: string) => boolean;
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
  // publicPath: a saved canonical naming a moved supplier profile's old path means its new address, as on the page itself.
  return !seo?.canonicalUrl || publicPath(normalisedPath(seo.canonicalUrl)) === path;
}

function latest(dates: readonly (string | null)[]): Date | undefined {
  const times = dates.filter((date): date is string => date !== null).map((date) => Date.parse(date));
  const valid = times.filter((time) => !Number.isNaN(time));
  return valid.length > 0 ? new Date(Math.max(...valid)) : undefined;
}

/**
 * Every URL the sitemap lists. A URL is in only when the page answers 200, is
 * indexable by the one indexing decision its robots tag also uses, and is its
 * own canonical, so the sitemap can never list a page that tells search
 * engines to skip it.
 */
export function buildSitemapEntries(input: SitemapInput): MetadataRoute.Sitemap {
  const { seoByPath } = input;
  // `path` is the page's key (where its override and indexing decision are stored); `servedAt` is the address
  // it answers at, which only differs for a supplier profile that has moved.
  const listable = (path: string, servedAt = path) => input.isIndexable(path) && isOwnCanonical(servedAt, seoByPath.get(path));

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
      const profileServedAt = supplierPath(supplier.slug);
      const coupon = couponPagePath(supplier.slug);
      const reviews = reviewsPagePath(supplier.slug);
      return [
        ...(listable(profile, profileServedAt) ? [{ path: profileServedAt, lastModified }] : []),
        ...(supplier.hasCoupon && listable(coupon) ? [{ path: coupon, lastModified }] : []),
        ...(supplier.hasReviews && listable(reviews) ? [{ path: reviews, lastModified }] : []),
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
