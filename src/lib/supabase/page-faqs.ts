import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FaqItem } from '@/data/default-page-faqs';

/** Snake_case shape of a row in the `page_faqs` table (see supabase/migrations/0014_page_faqs.sql). */
export interface PageFaqRow {
  id: string;
  path: string;
  question: string;
  answer: string;
  position: number;
}

export interface StoredFaq extends FaqItem {
  id: string;
}

export function rowToFaq(row: PageFaqRow): StoredFaq {
  return { id: row.id, question: row.question, answer: row.answer };
}

const FETCH_PAGE_SIZE = 1000;

/**
 * Every stored FAQ, grouped by page path and ordered within each page.
 *
 * Fetched in one query rather than per page: the admin dashboard needs the
 * whole set at once, and a single page's lookup is then a map read. Returns
 * null (not an empty map) on failure so callers can tell "nothing saved" from
 * "table unreachable" and fall back to the built-in defaults either way.
 *
 * Read in pages of FETCH_PAGE_SIZE: a plain select is silently cut off at
 * PostgREST's 1000-row cap, and every path sorted past the cut-off would fall
 * back to its built-in FAQs without any error. The `id` sort makes the order
 * total, so paging can't skip or repeat a row.
 */
export async function fetchPageFaqsFromDb(
  client: SupabaseClient,
): Promise<Map<string, StoredFaq[]> | null> {
  const rows: PageFaqRow[] = [];
  for (let from = 0; ; from += FETCH_PAGE_SIZE) {
    const { data, error } = await client
      .from('page_faqs')
      .select('id, path, question, answer, position')
      .order('path', { ascending: true })
      .order('position', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1);
    if (error || !data) return null;
    rows.push(...(data as PageFaqRow[]));
    if (data.length < FETCH_PAGE_SIZE) break;
  }

  const byPath = new Map<string, StoredFaq[]>();
  for (const row of rows) {
    const list = byPath.get(row.path) ?? [];
    list.push(rowToFaq(row));
    byPath.set(row.path, list);
  }
  return byPath;
}

/**
 * Replaces the whole set for one path in a single transaction-ish pass: delete
 * what's there, then insert the new order. The admin always submits the full
 * list, so a diff would be more moving parts for no gain, and this can't leave
 * two rows fighting over the same position.
 */
export async function replacePageFaqsInDb(
  client: SupabaseClient,
  path: string,
  faqs: readonly FaqItem[],
): Promise<{ error?: string }> {
  const { error: deleteError } = await client.from('page_faqs').delete().eq('path', path);
  if (deleteError) return { error: deleteError.message };

  if (faqs.length === 0) return {};

  const rows = faqs.map((faq, index) => ({
    path,
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    position: (index + 1) * 10,
  }));

  const { error: insertError } = await client.from('page_faqs').insert(rows);
  if (insertError) return { error: insertError.message };
  return {};
}
