import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSupplierContentFromDb } from '@/lib/supabase/supplier-content';
import {
  defaultSupplierContent,
  resolveSupplierContent,
  supplierMarketStats,
  type SupplierContent,
  type SupplierContentOverride,
} from '@/lib/supplier-content';
import type { Offer, Supplier } from '@/lib/schema';

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
  { revalidate: 300, tags: [SUPPLIER_CONTENT_CACHE_TAG] },
);

/** The three boxes a supplier page renders: saved text where there is some, generated text elsewhere. */
export async function getSupplierContent(supplier: Supplier, allOffers: readonly Offer[]): Promise<SupplierContent> {
  const saved = await getSavedSupplierContent();
  const defaults = defaultSupplierContent(supplier, supplierMarketStats(supplier.slug, allOffers));
  return resolveSupplierContent(defaults, saved[supplier.slug] ?? null);
}
