import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReviewPageContentFromDb } from '@/lib/supabase/review-page-content';
import {
  defaultReviewPageContent,
  resolveReviewPageContent,
  type ReviewPageContent,
  type ReviewPageContentOverride,
} from '@/lib/review-page-content';
import { ratingSourceLabel } from '@/lib/review-pages';
import type { Supplier } from '@/lib/schema';
import { CATALOGUE_REVALIDATE_SECONDS } from '@/lib/cache-ttl';

export const REVIEW_CONTENT_CACHE_TAG = 'review-page-content';

/**
 * Saved overrides for every vendor, cached like the rest of the repository;
 * the admin revalidates the tag on save so an edit shows straight away.
 */
const getSavedReviewPageContent = unstable_cache(
  async (): Promise<Record<string, ReviewPageContentOverride>> => {
    const client = getSupabaseServerClient();
    if (!client) return {};
    const bySlug = await fetchReviewPageContentFromDb(client);
    // Null means the table is unreachable or not migrated yet; the generated
    // text then stands in, so every reviews page keeps all its sections.
    return bySlug === null ? {} : Object.fromEntries(bySlug);
  },
  ['review-page-content'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: [REVIEW_CONTENT_CACHE_TAG] },
);

/** The text a reviews page renders: saved where there is some, generated elsewhere. */
export async function getReviewPageContent(
  supplier: Pick<Supplier, 'slug' | 'name' | 'description' | 'reviewsUrl'>,
): Promise<ReviewPageContent> {
  const saved = await getSavedReviewPageContent();
  return resolveReviewPageContent(
    defaultReviewPageContent(supplier, ratingSourceLabel(supplier.reviewsUrl)),
    saved[supplier.slug] ?? null,
  );
}
