import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getAllOffers, getGuides, getOffersForSupplier, getProducts, getSupplier, getSuppliers } from '@/lib/repository';
import { getSavedSupplierContentOverrides, SUPPLIER_CONTENT_CACHE_TAG } from '@/lib/supplier-content-store';
import { guideHasContent } from '@/data/guides';
import { couponPagePath, supplierSlugFromCouponPath } from '@/lib/coupon-pages';
import { reviewsPagePath, supplierSlugFromReviewsPath } from '@/lib/review-pages';
import { OFFERS_REVALIDATE_SECONDS } from '@/lib/cache-ttl';
import { closestMatches, wordCountOf } from '@/lib/seo/text';
import type { PageQualityFacts } from '@/lib/seo/indexing';

/** What a supplier-related page needs for its title, description and body text rules. */
export interface SupplierTextContext {
  hasRating: boolean;
  hasLinkedCoa: boolean;
  shippingSpeed: string | null;
}

export interface PageQualityIndex {
  /** Facts for every supplier, coupon, review, product and guide page, keyed by path. */
  facts: Record<string, PageQualityFacts>;
  /** Text rules per supplier-related path (supplier, coupon and review pages). */
  textContext: Record<string, SupplierTextContext>;
}

/**
 * The facts behind every page's quality rules, built once from the same
 * catalogue the pages render and cached like it. Similarity is compared across
 * every supplier here, so a page's own render never has to.
 */
const getPageQualityIndexCached = unstable_cache(
  async (): Promise<PageQualityIndex> => {
    const [suppliers, offers, products, guides, savedContent] = await Promise.all([
      getSuppliers(),
      getAllOffers(),
      getProducts(),
      getGuides(),
      getSavedSupplierContentOverrides(),
    ]);
    const productSlugs = new Set(products.map((product) => product.slug));
    const activeSlugs = new Set(suppliers.filter((supplier) => supplier.isActive).map((supplier) => supplier.slug));
    const liveOffers = offers.filter((offer) => productSlugs.has(offer.productSlug) && offer.listPrice > 0);

    const pricedProducts = new Map<string, Set<string>>();
    const sellers = new Map<string, Set<string>>();
    const withCoa = new Set<string>();
    for (const offer of liveOffers) {
      pricedProducts.set(offer.supplierSlug, (pricedProducts.get(offer.supplierSlug) ?? new Set()).add(offer.productSlug));
      if (activeSlugs.has(offer.supplierSlug)) {
        sellers.set(offer.productSlug, (sellers.get(offer.productSlug) ?? new Set()).add(offer.supplierSlug));
      }
      if (offer.labReport !== null || offer.coaUrl) withCoa.add(offer.supplierSlug);
    }

    // Only text an admin wrote counts: the generated fallback is template text by definition.
    const aboutMatches = closestMatches(
      suppliers.map((supplier) => ({
        key: supplier.slug,
        name: supplier.name,
        text: savedContent[supplier.slug]?.about.body?.trim() ?? '',
      })),
    );
    const summaryMatches = closestMatches(
      suppliers.map((supplier) => ({ key: supplier.slug, name: supplier.name, text: supplier.reviewSummary ?? '' })),
    );
    const closest = (matches: typeof aboutMatches, slug: string) => {
      const best = matches.get(slug);
      return best ? { name: best.match.name, score: best.score } : null;
    };

    const facts: Record<string, PageQualityFacts> = {};
    const textContext: Record<string, SupplierTextContext> = {};
    for (const supplier of suppliers) {
      const context: SupplierTextContext = {
        hasRating: supplier.reviewRating !== null,
        hasLinkedCoa: withCoa.has(supplier.slug),
        shippingSpeed: supplier.shippingSpeed,
      };
      const profile = `/suppliers/${supplier.slug}`;
      const coupon = couponPagePath(supplier.slug);
      const reviews = reviewsPagePath(supplier.slug);
      facts[profile] = {
        type: 'supplier',
        isActive: supplier.isActive,
        pricedProductCount: pricedProducts.get(supplier.slug)?.size ?? 0,
        descriptionWords: wordCountOf(savedContent[supplier.slug]?.about.body),
        mostSimilarDescription: closest(aboutMatches, supplier.slug),
      };
      facts[coupon] = {
        type: 'coupon',
        hasActiveCode: supplier.isActive && supplier.coupon !== null,
        couponVerifiedAt: supplier.couponVerifiedAt ?? null,
      };
      facts[reviews] = {
        type: 'review',
        summaryWords: wordCountOf(supplier.reviewSummary),
        mostSimilarSummary: closest(summaryMatches, supplier.slug),
      };
      textContext[profile] = context;
      textContext[coupon] = context;
      textContext[reviews] = context;
    }
    for (const product of products) {
      facts[`/products/${product.slug}`] = { type: 'product', activeSupplierCount: sellers.get(product.slug)?.size ?? 0 };
    }
    for (const guide of guides) {
      facts[`/guides/${guide.slug}`] = {
        type: 'guide',
        reviewedByMe: guide.reviewedByMe === true,
        hasContent: guideHasContent(guide),
        isPublished: guide.isPublished !== false,
      };
    }
    return { facts, textContext };
  },
  ['page-quality-index'],
  {
    revalidate: OFFERS_REVALIDATE_SECONDS,
    tags: ['suppliers', 'offers', 'products', 'guides', SUPPLIER_CONTENT_CACHE_TAG],
  },
);

/**
 * One read in flight per server process. unstable_cache doesn't share a miss
 * between concurrent renders, so at build time every page being prerendered at
 * once would otherwise rebuild the index itself.
 */
let inFlight: { promise: Promise<PageQualityIndex>; startedAt: number } | null = null;
const IN_FLIGHT_MS = 30_000;

/** Memoised per request: metadata, the page and its structured data each ask for it. */
export const getPageQualityIndex = cache(async (): Promise<PageQualityIndex> => {
  const now = Date.now();
  if (!inFlight || now - inFlight.startedAt > IN_FLIGHT_MS) {
    const promise = getPageQualityIndexCached();
    inFlight = { promise, startedAt: now };
    // A failed read must not be reused by the next request.
    promise.catch(() => {
      if (inFlight?.promise === promise) inFlight = null;
    });
  }
  return inFlight.promise;
});

/** The supplier behind a supplier, coupon or reviews page path, or null for any other page. */
function supplierSlugOf(path: string): string | null {
  if (/^\/suppliers\/[^/]+$/.test(path)) return path.slice('/suppliers/'.length);
  return supplierSlugFromCouponPath(path) ?? supplierSlugFromReviewsPath(path);
}

/**
 * The text rules for a supplier-related page. Live suppliers come from the
 * index; a supplier switched off in the admin isn't in it but its pages still
 * answer, so its context is built from its own record.
 */
export async function getSupplierTextContext(path: string): Promise<SupplierTextContext | null> {
  const { textContext } = await getPageQualityIndex();
  if (textContext[path]) return textContext[path];
  const slug = supplierSlugOf(path);
  if (!slug) return null;
  const supplier = await getSupplier(slug);
  if (!supplier) return null;
  const offers = await getOffersForSupplier(slug);
  return {
    hasRating: supplier.reviewRating !== null,
    hasLinkedCoa: offers.some((offer) => offer.labReport !== null || Boolean(offer.coaUrl)),
    shippingSpeed: supplier.shippingSpeed,
  };
}
