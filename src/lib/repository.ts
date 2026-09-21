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
      if (fromDb !== null) dbOffers = fromDb;
    }
    return [...offers, ...dbOffers];
  },
  ['all-offers'],
  { revalidate: 300, tags: ['offers'] },
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
  return (await getAllOffersCached()).map(withPublishedCoaLink);
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
      if (fromDb !== null) {
        const mapped = fromDb.map(withDemoData).map(withVendorReviewProfile);
        // No fallback comparator: sort is stable, so vendors without a saved
        // position keep the query's own order (newest first) rather than being
        // reshuffled before anyone has dragged anything.
        return sortByPosition(mapped);
      }
    }
    return seedSuppliers();
  },
  ['suppliers'],
  { revalidate: 300, tags: ['suppliers'] },
);

export const getSuppliers = cache(async (): Promise<readonly Supplier[]> => {
  return getSuppliersCached();
});

export const getSupplier = cache(async (slug: string): Promise<Supplier | null> => {
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
 * Individually-attributed reviews for one supplier, in the order the admin
 * arranged them. Falls back to the Trustpilot set supplied for this vendor
 * when the table holds nothing for it yet, so reviews show before anyone
 * touches the admin. An unmigrated or unreachable table reads as "no rows"
 * rather than an error.
 */
export async function getSupplierReviews(
  supplier: Pick<Supplier, 'slug' | 'name' | 'homepageUrl'>,
): Promise<readonly SupplierReview[]> {
  const client = getSupabaseServerClient();
  const fromDb = client ? await fetchSupplierReviewsFromDb(client, supplier.slug) : null;
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
    if (error || !data) return [];
    return [...new Set((data as { supplier_slug: string }[]).map((row) => row.supplier_slug))];
  },
  ['supplier-review-slugs'],
  { revalidate: 300, tags: ['supplier-reviews'] },
);

export async function getSupplierSlugsWithReviews(): Promise<ReadonlySet<string>> {
  return new Set(await getSlugsWithReviewsCached());
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
    if (fromDb === null || fromDb.length === 0) return seedGuides;

    const merged = new Map<string, Guide>(seedGuides.map((guide) => [guide.slug, guide]));
    for (const guide of fromDb) merged.set(guide.slug, guide);
    return [...merged.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  ['guides'],
  { revalidate: 300, tags: ['guides'] },
);

export async function getGuides(): Promise<readonly Guide[]> {
  return getGuidesCached();
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  return (await getGuides()).find((guide) => guide.slug === slug) ?? null;
}

const getProductsCached = unstable_cache(
  async (): Promise<readonly Product[]> => {
    const client = getSupabaseServerClient();
    if (client) {
      const fromDb = await fetchProductsFromDb(client);
      if (fromDb !== null) {
        // Falls back to the curated running order so the site keeps that
        // sequence until 0013_display_order.sql has populated `position`.
        return sortByPosition(fromDb.map(withDemoProductContent), byCompoundOrder);
      }
    }
    return products.map(withDemoProductContent);
  },
  ['products'],
  { revalidate: 300, tags: ['products'] },
);

export const getProducts = cache(async (): Promise<readonly Product[]> => {
  return getProductsCached();
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
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
