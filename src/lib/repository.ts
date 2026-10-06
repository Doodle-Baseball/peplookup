import { cache } from 'react';
import { sortByPosition } from '@/lib/display-order';
import { byCompoundOrder } from '@/config/compound-order';
import { unstable_cache } from 'next/cache';
import { offers } from '@/data/offers';
import { products } from '@/data/products';
import { suppliers } from '@/data/suppliers';
import { withDemoData } from '@/data/demo-overlay';
import { withDemoProductContent } from '@/data/demo-products';
import { withPublishedCoaLink } from '@/data/vendor-coa-links';
import { getSupplierSlugAliases } from '@/lib/seo';
import { getSupabaseServerClient } from './supabase/server';
import { fetchSuppliersFromDb, fetchSupplierFromDb } from './supabase/suppliers';
import { fetchSupplierReviewsFromDb } from './supabase/supplier-reviews';
import { fetchGuidesFromDb } from './supabase/guides';
import { findVendorReviewProfile } from '@/data/vendor-reviews';
import { guides as seedGuides, type Guide } from '@/data/guides';
import { fetchProductsFromDb, fetchProductFromDb } from './supabase/products';
import { fetchOffersFromDb } from './supabase/offers';
import type { Offer, Product, Supplier, SupplierReview } from './schema';
import { type Listing, mcg } from './price';
import { cents } from './money';
import { CATALOGUE_REVALIDATE_SECONDS, OFFERS_REVALIDATE_SECONDS } from './cache-ttl';

/**
 * Thrown inside a cached read when Supabase could not be reached. Throwing
 * (rather than returning the fallback) is what keeps `unstable_cache` from
 * storing the fallback as the answer for the whole cache window, which would
 * otherwise turn one dropped connection into an hour of empty prices.
 */
class SourceUnavailableError extends Error {}

/** Runs a cached read and, only when it reported Supabase as unavailable, answers with the fallback for this request alone. */
async function readOr<T>(read: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (error instanceof SourceUnavailableError) return fallback();
    throw error;
  }
}

const seedOffers = (): readonly Offer[] => [...offers];

/**
 * Real crawled offers (currently always empty, see src/data/offers.ts),
 * plus admin-entered listings from the "Add Product" panel (Supabase
 * `offers` table).
 */
const getAllOffersCached = unstable_cache(
  async (): Promise<readonly Offer[]> => {
    const client = getSupabaseServerClient();
    let dbOffers: readonly Offer[] = [];
    if (client) {
      const fromDb = await fetchOffersFromDb(client);
      if (fromDb === null) throw new SourceUnavailableError('offers');
      dbOffers = fromDb;
    }
    return [...offers, ...dbOffers];
  },
  ['all-offers'],
  { revalidate: OFFERS_REVALIDATE_SECONDS, tags: ['offers'] },
);

/**
 * Memoised for the lifetime of one request. A single page can ask for offers
 * dozens of times over (one `countProductsForSupplier` per vendor card, one
 * `getOffersForProduct` per compound row), and without this each of those
 * re-reads the whole catalogue out of `unstable_cache` and re-maps every row.
 */
const allOffers = cache(async (): Promise<readonly Offer[]> => {
  // Applied outside the cache so a vendor's published COA links show without
  // waiting for the offers cache to revalidate.
  const [offers, slugAliases] = await Promise.all([
    readOr(getAllOffersCached, seedOffers),
    getSupplierSlugAliases(),
  ]);
  return offers.map((offer) => withPublishedCoaLink(offer, slugAliases.get(offer.supplierSlug)));
});

/**
 * Suppliers now live in Supabase once the admin panel is used to manage
 * them. The static seed + demo overlay stays as a fallback for local dev
 * without credentials, or if the `suppliers` table hasn't been migrated yet
 * (see supabase/migrations/0001_suppliers.sql), never a hard failure.
 */
function seedSuppliers(): readonly Supplier[] {
  return suppliers.map(withDemoData).map(withVendorReviewProfile);
}

/**
 * Fills a vendor's headline Trustpilot score and profile link from the review
 * set supplied for it, when nothing has been saved against the vendor itself.
 * Applied centrally so the directory card, the profile page and the admin all
 * read the same number instead of each deriving its own.
 */
function withVendorReviewProfile(supplier: Supplier): Supplier {
  if (supplier.reviewRating !== null && supplier.reviewsUrl !== null) return supplier;
  const profile = findVendorReviewProfile(supplier.name, supplier.homepageUrl);
  if (!profile) return supplier;
  return {
    ...supplier,
    reviewRating: supplier.reviewRating ?? profile.rating,
    reviewsUrl: supplier.reviewsUrl ?? profile.trustpilotUrl,
  };
}

/**
 * Every accessor is async so the backing store can move to Supabase without
 * touching a single call site. Swap the bodies for queries against
 * NEXT_PUBLIC_SUPABASE_URL when the service key is available.
 */

const getSuppliersCached = unstable_cache(
  async (): Promise<readonly Supplier[]> => {
    const client = getSupabaseServerClient();
    if (client) {
      const fromDb = await fetchSuppliersFromDb(client);
      if (fromDb === null) throw new SourceUnavailableError('suppliers');
      const mapped = fromDb.map(withDemoData).map(withVendorReviewProfile);
      // No fallback comparator: sort is stable, so vendors without a saved
      // position keep the query's own order (newest first) rather than being
      // reshuffled before anyone has dragged anything.
      return sortByPosition(mapped);
    }
    return seedSuppliers();
  },
  ['suppliers'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: ['suppliers'] },
);

export const getSuppliers = cache(async (): Promise<readonly Supplier[]> => {
  return readOr(getSuppliersCached, seedSuppliers);
});

export const getSupplier = cache(async (slug: string): Promise<Supplier | null> => {
  // A vendor in the (already cached) directory list needs no query of its own;
  // before this, every supplier page view read its row from Supabase again.
  // Anything not in that list, an inactive vendor or one added since the list
  // was cached, still falls through to the direct read below.
  const listed = (await getSuppliers()).find((supplier) => supplier.slug === slug);
  if (listed) return listed;

  const client = getSupabaseServerClient();
  if (client) {
    const fromDb = await fetchSupplierFromDb(client, slug);
    if (fromDb !== null) return withVendorReviewProfile(withDemoData(fromDb));
  }
  // Falls back to seed data both when Supabase is unavailable/unmigrated and
  // when the row genuinely isn't in the table yet, either way the seed is
  // the best available answer.
  return seedSuppliers().find((s) => s.slug === slug) ?? null;
});

/**
 * Stored reviews for one supplier. Keyed by slug (unstable_cache adds the
 * arguments to the key) and tagged like the review-slug list below, so every
 * admin write that drops that tag drops these too. Before this each supplier
 * and reviews page view ran its own query for rows that rarely change.
 */
const getStoredSupplierReviewsCached = unstable_cache(
  async (supplierSlug: string): Promise<readonly SupplierReview[]> => {
    const client = getSupabaseServerClient();
    if (!client) return [];
    const fromDb = await fetchSupplierReviewsFromDb(client, supplierSlug);
    if (fromDb === null) throw new SourceUnavailableError('supplier-reviews');
    return fromDb;
  },
  ['supplier-reviews-by-supplier'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: ['supplier-reviews'] },
);

/**
 * Individually-attributed reviews for one supplier, in the order the admin
 * arranged them. Falls back to the Trustpilot set supplied for this vendor
 * when the table holds nothing for it yet, so reviews show before anyone
 * touches the admin. An unmigrated or unreachable table reads as "no rows"
 * rather than an error.
 */
export async function getSupplierReviews(
  supplier: Pick<Supplier, 'slug' | 'name' | 'homepageUrl'>,
): Promise<readonly SupplierReview[]> {
  const fromDb = await readOr<readonly SupplierReview[] | null>(
    () => getStoredSupplierReviewsCached(supplier.slug),
    () => null,
  );
  if (fromDb && fromDb.length > 0) return fromDb;
  return findVendorReviewProfile(supplier.name, supplier.homepageUrl)?.reviews ?? [];
}

/**
 * Slugs of every vendor with at least one stored review, in one query rather
 * than one per card. An unmigrated or unreachable table reads as "none", so
 * the directory still renders, it just can't promote on review count.
 */
const getSlugsWithReviewsCached = unstable_cache(
  async (): Promise<readonly string[]> => {
    const client = getSupabaseServerClient();
    if (!client) return [];
    const { data, error } = await client.from('supplier_reviews').select('supplier_slug');
    if (error || !data) throw new SourceUnavailableError('supplier-reviews');
    return [...new Set((data as { supplier_slug: string }[]).map((row) => row.supplier_slug))];
  },
  ['supplier-review-slugs'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: ['supplier-reviews'] },
);

export async function getSupplierSlugsWithReviews(): Promise<ReadonlySet<string>> {
  return new Set(await readOr<readonly string[]>(getSlugsWithReviewsCached, () => []));
}

/**
 * Whether we hold any review content for this vendor, stored rows first, then
 * the Trustpilot set supplied for it.
 */
export function supplierHasReviews(supplier: Supplier, storedSlugs: ReadonlySet<string>): boolean {
  if (storedSlugs.has(supplier.slug)) return true;
  return (findVendorReviewProfile(supplier.name, supplier.homepageUrl)?.reviews.length ?? 0) > 0;
}

/**
 * The one ranking used everywhere a supplier list is shown to a visitor or
 * the admin: manual drag-and-drop position wins outright when it's been set,
 * Featured pins to the top only among vendors nobody has ever dragged, and
 * the reviews/coupon score breaks ties within that.
 *
 * Both /admin/vendors and the public /suppliers directory used to compute
 * this independently, each re-sorting an already position-sorted list by
 * Featured-then-score as if that were the primary key, which discarded a
 * dragged position for any pair that differed on either of those, and let
 * the two pages disagree on order after a rename or review changed a
 * vendor's score between the two requests. Centralised so a drag-and-drop
 * reorder on one page is guaranteed to read back identically on the other.
 */
export function orderSuppliersForDisplay(
  suppliers: readonly Supplier[],
  slugsWithReviews: ReadonlySet<string>,
): Supplier[] {
  const listingScore = (supplier: Supplier) =>
    (supplierHasReviews(supplier, slugsWithReviews) ? 1 : 0) + (supplier.coupon !== null ? 1 : 0);
  return sortByPosition(
    suppliers,
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || listingScore(b) - listingScore(a),
  );
}

/**
 * Guides shipped in the repository, with database rows merged over them by
 * slug, an admin-created guide is added, and one that reuses a shipped slug
 * replaces it. Newest first. An unmigrated table simply means the built-in set.
 */
const getGuidesCached = unstable_cache(
  async (): Promise<readonly Guide[]> => {
    const client = getSupabaseServerClient();
    const fromDb = client ? await fetchGuidesFromDb(client) : null;
    if (client && fromDb === null) throw new SourceUnavailableError('guides');
    if (fromDb === null || fromDb.length === 0) return seedGuides;

    const merged = new Map<string, Guide>(seedGuides.map((guide) => [guide.slug, guide]));
    for (const guide of fromDb) merged.set(guide.slug, guide);
    return [...merged.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  ['guides'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: ['guides'] },
);

export async function getGuides(): Promise<readonly Guide[]> {
  return readOr(getGuidesCached, () => seedGuides);
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  return (await getGuides()).find((guide) => guide.slug === slug) ?? null;
}

const getProductsCached = unstable_cache(
  async (): Promise<readonly Product[]> => {
    const client = getSupabaseServerClient();
    if (client) {
      const fromDb = await fetchProductsFromDb(client);
      if (fromDb === null) throw new SourceUnavailableError('products');
      // Falls back to the curated running order so the site keeps that
      // sequence until 0013_display_order.sql has populated `position`.
      return sortByPosition(fromDb.map(withDemoProductContent), byCompoundOrder);
    }
    return products.map(withDemoProductContent);
  },
  ['products'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: ['products'] },
);

const seedProducts = (): readonly Product[] => products.map(withDemoProductContent);

export const getProducts = cache(async (): Promise<readonly Product[]> => {
  return readOr(getProductsCached, seedProducts);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  // The cached catalogue already holds every compound with its research
  // content, so a compound in it costs no query. Reading one directly took six
  // Supabase calls (the row plus five content tables) on every page view.
  // A slug that isn't in the list, e.g. a compound created since it was
  // cached, still falls through to the direct read below.
  const listed = (await getProducts()).find((product) => product.slug === slug);
  if (listed) return listed;

  const client = getSupabaseServerClient();
  if (client) {
    const fromDb = await fetchProductFromDb(client, slug);
    if (fromDb !== null) return withDemoProductContent(fromDb);
  }
  const seed = products.find((p) => p.slug === slug);
  return seed ? withDemoProductContent(seed) : null;
});

export async function getOffersForProduct(productSlug: string): Promise<readonly Offer[]> {
  return (await allOffers()).filter((o) => o.productSlug === productSlug);
}

/** Every offer across every vendor, used by the lab-reports directory, which needs the whole catalogue at once. */
export async function getAllOffers(): Promise<readonly Offer[]> {
  return allOffers();
}

export async function getOffersForSupplier(supplierSlug: string): Promise<readonly Offer[]> {
  return (await allOffers()).filter((o) => o.supplierSlug === supplierSlug);
}

export async function countProductsForSupplier(supplierSlug: string): Promise<number> {
  return (await allOffers()).filter((o) => o.supplierSlug === supplierSlug).length;
}

/**
 * Listings per supplier in one pass over the offer list. Callers that need a
 * count for many suppliers use this instead of {@link countProductsForSupplier}
 * in a loop, which re-scanned every offer once per supplier.
 */
export async function countProductsBySupplier(): Promise<ReadonlyMap<string, number>> {
  const counts = new Map<string, number>();
  for (const offer of await allOffers()) {
    counts.set(offer.supplierSlug, (counts.get(offer.supplierSlug) ?? 0) + 1);
  }
  return counts;
}

/** Adapt a stored offer into the shape the price math consumes. */
export function toListing(offer: Offer): Listing {
  return {
    supplierSlug: offer.supplierSlug,
    productSlug: offer.productSlug,
    listPrice: cents(offer.listPrice),
    salePrice: offer.salePrice === null ? null : cents(offer.salePrice),
    currency: offer.currency,
    vialSize: mcg(offer.vialSize),
    vialCount: offer.vialCount,
    inStock: offer.inStock,
    scrapedAt: offer.scrapedAt,
    url: offer.productUrl,
  };
}
