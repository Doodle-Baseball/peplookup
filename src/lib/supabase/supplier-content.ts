import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupplierContentOverride } from '@/lib/supplier-content';

/** Snake_case shape of a row in `supplier_page_content` (see supabase/migrations/0019_supplier_page_content.sql). */
export interface SupplierContentRow {
  supplier_slug: string;
  about_title: string | null;
  about_body: string | null;
  why_title: string | null;
  why_body: string | null;
  compare_title: string | null;
  compare_body: string | null;
}

const COLUMNS = 'supplier_slug, about_title, about_body, why_title, why_body, compare_title, compare_body';

export function rowToSupplierContent(row: SupplierContentRow): SupplierContentOverride {
  return {
    about: { title: row.about_title, body: row.about_body },
    why: { title: row.why_title, body: row.why_body },
    compare: { title: row.compare_title, body: row.compare_body },
  };
}

/**
 * Every saved override, keyed by supplier slug, in one query: there's one row
 * per vendor at most, and both the admin and the public pages want the lot.
 * Null (not an empty map) on failure, so callers can tell "nothing saved" from
 * "table not migrated yet" and fall back to generated text either way.
 */
export async function fetchSupplierContentFromDb(
  client: SupabaseClient,
): Promise<Map<string, SupplierContentOverride> | null> {
  const { data, error } = await client.from('supplier_page_content').select(COLUMNS);
  if (error || !data) return null;
  return new Map((data as SupplierContentRow[]).map((row) => [row.supplier_slug, rowToSupplierContent(row)]));
}

/** Writes one vendor's overrides. An all-null override deletes the row, putting every box back on generated text. */
export async function saveSupplierContentInDb(
  client: SupabaseClient,
  supplierSlug: string,
  content: SupplierContentOverride,
): Promise<{ error?: string }> {
  const row: SupplierContentRow = {
    supplier_slug: supplierSlug,
    about_title: content.about.title,
    about_body: content.about.body,
    why_title: content.why.title,
    why_body: content.why.body,
    compare_title: content.compare.title,
    compare_body: content.compare.body,
  };

  const isEmpty = Object.entries(row).every(([key, value]) => key === 'supplier_slug' || value === null);
  const { error } = isEmpty
    ? await client.from('supplier_page_content').delete().eq('supplier_slug', supplierSlug)
    : await client.from('supplier_page_content').upsert(row, { onConflict: 'supplier_slug' });
  return error ? { error: error.message } : {};
}
