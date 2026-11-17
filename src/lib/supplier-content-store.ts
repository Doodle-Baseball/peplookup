import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSupplierContentFromDb, fetchSupplierSectionsFromDb } from '@/lib/supabase/supplier-content';
import {
  defaultSupplierContent,
  resolveSupplierContent,
  supplierMarketStats,
  type SupplierContent,
  type SupplierContentOverride,
} from '@/lib/supplier-content';
import type { Offer, Product, Supplier } from '@/lib/schema';
import { getAllOffers, getProducts, getSupplier, getVendorCount } from '@/lib/repository';
import {
  defaultSupplierPageSections,
  resolveSupplierPageSections,
  type SupplierPageSections,
  type SupplierPageSectionsOverride,
} from '@/lib/supplier-page-sections';
import { oneCoaPerProduct, supplierCoaReports } from '@/lib/supplier-coa-reports';
import { supplierFaqs, supplierLegitSummary } from '@/lib/supplier-legit';
import { isRewrittenSupplierPage, rewriteFaqs, rewriteSummary } from '@/lib/supplier-page-rewrite';
import { getRewriteFacts } from '@/lib/supplier-page-rewrite-store';
import { fillVendorCountDeep } from '@/lib/vendor-count';
import { CATALOGUE_REVALIDATE_SECONDS } from '@/lib/cache-ttl';

export const SUPPLIER_CONTENT_CACHE_TAG = 'supplier-page-content';

/**
 * Saved overrides for every vendor, cached like the rest of the repository;
 * the admin revalidates the tag on save so an edit shows straight away.
 */
const getSavedSupplierContent = unstable_cache(
  async (): Promise<Record<string, SupplierContentOverride>> => {
    const client = getSupabaseServerClient();
    if (!client) return {};
    const bySlug = await fetchSupplierContentFromDb(client);
    // Null means the table is unreachable or not migrated yet; the generated
    // text then stands in, so every supplier page keeps its three boxes.
    return bySlug === null ? {} : Object.fromEntries(bySlug);
  },
  ['supplier-page-content'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: [SUPPLIER_CONTENT_CACHE_TAG] },
);

/** Only what admins have saved, keyed by supplier slug, for the quality rules that count admin-written text alone. */
export async function getSavedSupplierContentOverrides(): Promise<Readonly<Record<string, SupplierContentOverride>>> {
  return getSavedSupplierContent();
}

/** The three boxes a supplier page renders: saved text where there is some, generated text elsewhere. */
export async function getSupplierContent(supplier: Supplier, allOffers: readonly Offer[]): Promise<SupplierContent> {
  const [saved, vendorCount] = await Promise.all([getSavedSupplierContent(), getVendorCount()]);
  const defaults = defaultSupplierContent(supplier, supplierMarketStats(supplier.slug, allOffers));
  return fillVendorCountDeep(resolveSupplierContent(defaults, saved[supplier.slug] ?? null), vendorCount);
}

/**
 * The generated text for one vendor, built from exactly the data the public
 * page uses, so the admin can tell "unchanged" edits from real ones. Null when
 * the supplier doesn't exist.
 */
export async function getGeneratedSupplierContent(slug: string): Promise<SupplierContent | null> {
  const [supplier, offers] = await Promise.all([getSupplier(slug), getAllOffers()]);
  return supplier ? defaultSupplierContent(supplier, supplierMarketStats(supplier.slug, offers)) : null;
}

/**
 * Saved intro / legit / market / FAQ overrides for every vendor. Null from the
 * database (0033 not run yet) means nothing is saved, so every page shows its
 * own text.
 */
const getSavedSupplierSections = unstable_cache(
  async (): Promise<Record<string, SupplierPageSectionsOverride>> => {
    const client = getSupabaseServerClient();
    if (!client) return {};
    const bySlug = await fetchSupplierSectionsFromDb(client);
    return bySlug === null ? {} : Object.fromEntries(bySlug);
  },
  ['supplier-page-sections'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: [SUPPLIER_CONTENT_CACHE_TAG] },
);

/**
 * What the intro, "Is {Name} legit?", market and FAQ sections show when
 * nothing is saved: built exactly as the supplier page builds them, so the
 * admin can tell an unchanged field from a real edit.
 */
export async function supplierPageSectionDefaults(
  supplier: Supplier,
  ownOffers: readonly Offer[],
  productsBySlug: ReadonlyMap<string, Pick<Product, 'name'>>,
): Promise<SupplierPageSections> {
  const resolvedOffers = ownOffers.filter((offer) => productsBySlug.has(offer.productSlug));
  const coaCount = oneCoaPerProduct(supplierCoaReports(resolvedOffers, productsBySlug)).length;
  const rewrite = isRewrittenSupplierPage(supplier.slug)
    ? (await getRewriteFacts(supplier, resolvedOffers)).rewrite
    : null;
  return defaultSupplierPageSections({
    name: supplier.name,
    intro: rewrite ? rewriteSummary(rewrite) : (supplier.description ?? ''),
    legitSummary: supplierLegitSummary(supplier, coaCount),
    faqs: rewrite ? rewriteFaqs(rewrite) : supplierFaqs(supplier),
  });
}

/** The sections a supplier page renders: saved text where there is some, the page's own text elsewhere. */
export async function getSupplierPageSections(
  supplier: Supplier,
  ownOffers: readonly Offer[],
  productsBySlug: ReadonlyMap<string, Pick<Product, 'name'>>,
): Promise<SupplierPageSections> {
  const [saved, vendorCount, defaults] = await Promise.all([
    getSavedSupplierSections(),
    getVendorCount(),
    supplierPageSectionDefaults(supplier, ownOffers, productsBySlug),
  ]);
  return fillVendorCountDeep(resolveSupplierPageSections(defaults, saved[supplier.slug] ?? null), vendorCount);
}

/** The sections' own text for one vendor, from the same data the public page uses. Null when the supplier doesn't exist. */
export async function getGeneratedSupplierPageSections(slug: string): Promise<SupplierPageSections | null> {
  const [supplier, offers, products] = await Promise.all([getSupplier(slug), getAllOffers(), getProducts()]);
  if (!supplier) return null;
  return supplierPageSectionDefaults(
    supplier,
    offers.filter((offer) => offer.supplierSlug === supplier.slug),
    new Map(products.map((product) => [product.slug, product])),
  );
}
