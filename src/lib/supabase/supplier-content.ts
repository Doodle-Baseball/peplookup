import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { SupplierContentOverride } from '@/lib/supplier-content';
import type { SupplierPageSectionsOverride } from '@/lib/supplier-page-sections';

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

/*
 * The intro, "Is {Name} legit?", market price and FAQ sections, stored in the
 * same row as columns added by 0033_supplier_page_sections.sql. Read and
 * written apart from the About/Why/Compare columns so that, until 0033 runs,
 * a failure here never hides the About text already saved.
 */

interface SupplierSectionsRow {
  supplier_slug: string;
  intro_body: string | null;
  legit_title: string | null;
  legit_body: string | null;
  market_title: string | null;
  market_body: string | null;
  faqs: unknown;
}

const SECTION_COLUMNS = 'supplier_slug, intro_body, legit_title, legit_body, market_title, market_body, faqs';

const storedFaqsSchema = z.array(z.object({ question: z.string(), answer: z.string() }));

function rowToSections(row: SupplierSectionsRow): SupplierPageSectionsOverride {
  const faqs = row.faqs === null ? null : storedFaqsSchema.safeParse(row.faqs);
  return {
    intro: row.intro_body,
    legitTitle: row.legit_title,
    legitBody: row.legit_body,
    marketTitle: row.market_title,
    marketBody: row.market_body,
    // A malformed value is treated as "not saved" rather than breaking the page.
    faqs: faqs?.success ? faqs.data : null,
  };
}

/** Saved section overrides keyed by supplier slug. Null when the columns or table are missing. */
export async function fetchSupplierSectionsFromDb(
  client: SupabaseClient,
): Promise<Map<string, SupplierPageSectionsOverride> | null> {
  const { data, error } = await client.from('supplier_page_content').select(SECTION_COLUMNS);
  if (error || !data) return null;
  return new Map((data as SupplierSectionsRow[]).map((row) => [row.supplier_slug, rowToSections(row)]));
}

/** True for Postgres/PostgREST "column does not exist" errors, i.e. 0033 has not run. */
export function isMissingSectionColumns(error: { code?: string; message: string }): boolean {
  return error.code === '42703' || error.code === 'PGRST204' || /intro_body|legit_|market_|faqs/.test(error.message);
}

/**
 * Writes every column of one vendor's row in one statement: the About/Why/
 * Compare text and the sections. An all-null row is deleted, putting the whole
 * page back on its own text.
 */
export async function saveSupplierPageInDb(
  client: SupabaseClient,
  supplierSlug: string,
  content: SupplierContentOverride,
  sections: SupplierPageSectionsOverride,
): Promise<{ error?: { code?: string; message: string } }> {
  const row = {
    supplier_slug: supplierSlug,
    about_title: content.about.title,
    about_body: content.about.body,
    why_title: content.why.title,
    why_body: content.why.body,
    compare_title: content.compare.title,
    compare_body: content.compare.body,
    intro_body: sections.intro,
    legit_title: sections.legitTitle,
    legit_body: sections.legitBody,
    market_title: sections.marketTitle,
    market_body: sections.marketBody,
    faqs: sections.faqs,
  };
  const isEmpty = Object.entries(row).every(([key, value]) => key === 'supplier_slug' || value === null);
  const { error } = isEmpty
    ? await client.from('supplier_page_content').delete().eq('supplier_slug', supplierSlug)
    : await client.from('supplier_page_content').upsert(row, { onConflict: 'supplier_slug' });
  return error ? { error: { code: error.code, message: error.message } } : {};
}
