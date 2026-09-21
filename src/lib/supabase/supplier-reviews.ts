import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupplierReview } from '@/lib/schema';

/** Snake_case shape of a row in the `supplier_reviews` table (see supabase/migrations/0011). */
export interface SupplierReviewRow {
  id: string;
  supplier_slug: string;
  position: number;
  author: string;
  rating: number;
  body: string;
  reviewed_at: string | null;
  source: string | null;
  source_url: string | null;
}

export function rowToSupplierReview(row: SupplierReviewRow): SupplierReview {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    body: row.body,
    reviewedAt: row.reviewed_at,
  };
}

/**
 * Reviews for one supplier, in the order the admin arranged them. Returns null
 * (not []) when the table is missing or the read fails, so callers can tell
 * "no reviews" apart from "could not ask", the same contract as
 * fetchSuppliersFromDb.
 */
export async function fetchSupplierReviewsFromDb(
  client: SupabaseClient,
  supplierSlug: string,
): Promise<SupplierReview[] | null> {
  const { data, error } = await client
    .from('supplier_reviews')
    .select('*')
    .eq('supplier_slug', supplierSlug)
    .order('position', { ascending: true });

  if (error || !data) return null;
  return (data as SupplierReviewRow[]).map(rowToSupplierReview);
}

/**
 * Replaces a supplier's whole review list in one go. The admin form always
 * submits the complete, ordered set, and `position` is uniquely constrained
 * per supplier, so rewriting wholesale is both simpler and safer than
 * diffing, a reorder would otherwise collide on the unique index mid-update.
 */
export async function replaceSupplierReviewsInDb(
  client: SupabaseClient,
  supplierSlug: string,
  reviews: SupplierReview[],
): Promise<void> {
  const { error: deleteError } = await client
    .from('supplier_reviews')
    .delete()
    .eq('supplier_slug', supplierSlug);
  if (deleteError) throw new Error(deleteError.message);

  if (reviews.length === 0) return;

  const rows = reviews.map((review, index) => ({
    supplier_slug: supplierSlug,
    position: index,
    author: review.author,
    rating: review.rating,
    body: review.body,
    reviewed_at: review.reviewedAt,
    source: 'trustpilot',
  }));

  const { error: insertError } = await client.from('supplier_reviews').insert(rows);
  if (insertError) throw new Error(insertError.message);
}
