import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchPageFaqsFromDb, type StoredFaq } from '@/lib/supabase/page-faqs';
import { DEFAULT_PAGE_FAQS, defaultGuideFaqs, defaultSupplierFaqs, type FaqItem } from '@/data/default-page-faqs';
import { getGuideBySlug, getSupplier } from '@/lib/repository';

export const FAQS_CACHE_TAG = 'page-faqs';

/**
 * Stored FAQs for every page, keyed by path. Cached like the rest of the
 * repository; the admin revalidates `FAQS_CACHE_TAG` on save so an edit shows
 * on the front end straight away rather than after the window expires.
 */
const getStoredFaqsCached = unstable_cache(
  async (): Promise<Record<string, StoredFaq[]>> => {
    const client = getSupabaseServerClient();
    if (!client) return {};
    const byPath = await fetchPageFaqsFromDb(client);
    // Null means the table is unreachable or not migrated yet; the built-in
    // defaults then stand in, so pages keep their FAQs either way.
    if (byPath === null) return {};
    return Object.fromEntries(byPath);
  },
  ['page-faqs'],
  { revalidate: 300, tags: [FAQS_CACHE_TAG] },
);

/** Memoised per request: one page render can ask for FAQs and the schema separately. */
export const getStoredFaqs = cache(
  async (): Promise<Record<string, readonly StoredFaq[]>> => getStoredFaqsCached(),
);

/**
 * Built-in FAQs for a path, used when nothing has been saved for it.
 *
 * Supplier pages are generated from the vendor's own record so the questions
 * name real shipping terms, payment methods and codes rather than placeholders.
 */
async function defaultFaqsFor(path: string): Promise<readonly FaqItem[]> {
  const stat = DEFAULT_PAGE_FAQS[path];
  if (stat) return stat;

  const supplierSlug = path.startsWith('/suppliers/') ? path.slice('/suppliers/'.length) : null;
  if (supplierSlug) {
    const supplier = await getSupplier(supplierSlug);
    if (supplier) return defaultSupplierFaqs(supplier);
  }

  const guideSlug = path.startsWith('/guides/') ? path.slice('/guides/'.length) : null;
  if (guideSlug) {
    const guide = await getGuideBySlug(guideSlug);
    if (guide) return defaultGuideFaqs(guide);
  }

  return [];
}

/**
 * The FAQs a page should render: whatever is saved for it, else the built-in
 * set. An empty saved set is respected as "no FAQs here" rather than falling
 * back, so a page's questions can be removed entirely from the admin.
 */
export async function getFaqsForPath(path: string): Promise<readonly FaqItem[]> {
  const stored = await getStoredFaqs();
  const saved = stored[path];
  if (saved) return saved;
  return defaultFaqsFor(path);
}

/** Whether a path's questions come from the database rather than the built-in defaults. */
export async function hasStoredFaqs(path: string): Promise<boolean> {
  const stored = await getStoredFaqs();
  return Boolean(stored[path]);
}
