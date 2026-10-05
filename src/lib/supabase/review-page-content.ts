import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isEmptyReviewOverride, type ReviewPageContentOverride } from '@/lib/review-page-content';

/** Snake_case shape of a row in `review_page_content` (see supabase/migrations/0024_review_page_content.sql). */
export interface ReviewPageContentRow {
  supplier_slug: string;
  intro: string | null;
  rating_note: string | null;
  reviews_note: string | null;
}

const COLUMNS = 'supplier_slug, intro, rating_note, reviews_note';

export function rowToReviewPageContent(row: ReviewPageContentRow): ReviewPageContentOverride {
  return { intro: row.intro, ratingNote: row.rating_note, reviewsNote: row.reviews_note };
}

/**
 * Every saved override, keyed by supplier slug, in one query: one row per
 * vendor at most, and both the admin and the public pages want the lot. Null
 * (not an empty map) on failure, so callers can tell "nothing saved" from
 * "table not migrated yet" and fall back to generated text either way.
 */
export async function fetchReviewPageContentFromDb(
  client: SupabaseClient,
): Promise<Map<string, ReviewPageContentOverride> | null> {
  const { data, error } = await client.from('review_page_content').select(COLUMNS);
  if (error || !data) return null;
  return new Map((data as ReviewPageContentRow[]).map((row) => [row.supplier_slug, rowToReviewPageContent(row)]));
}

/** Writes one vendor's overrides. An all-null override deletes the row, putting the whole page back on generated text. */
export async function saveReviewPageContentInDb(
  client: SupabaseClient,
  supplierSlug: string,
  content: ReviewPageContentOverride,
): Promise<{ error?: string }> {
  const { error } = isEmptyReviewOverride(content)
    ? await client.from('review_page_content').delete().eq('supplier_slug', supplierSlug)
    : await client.from('review_page_content').upsert(
        {
          supplier_slug: supplierSlug,
          intro: content.intro,
          rating_note: content.ratingNote,
          reviews_note: content.reviewsNote,
        },
        { onConflict: 'supplier_slug' },
      );
  return error ? { error: error.message } : {};
}
