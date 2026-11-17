import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchSupplierContentFromDb,
  fetchSupplierSectionsFromDb,
  isMissingSectionColumns,
  saveSupplierContentInDb,
  saveSupplierPageInDb,
} from '@/lib/supabase/supplier-content';
import { AdminDbError } from '@/lib/admin/vendors';
import type { SupplierContentOverride } from '@/lib/supplier-content';
import { isEmptySectionsOverride, type SupplierPageSectionsOverride } from '@/lib/supplier-page-sections';

const CONTENT_MIGRATION = 'supabase/migrations/0019_supplier_page_content.sql';
const SECTIONS_MIGRATION = 'supabase/migrations/0033_supplier_page_sections.sql';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError('Supabase is not configured. Set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  return client;
}

/** Saved overrides keyed by supplier slug. Empty when the table is missing, so the dashboard still loads. */
export async function listSavedSupplierContent(): Promise<Map<string, SupplierContentOverride>> {
  return (await fetchSupplierContentFromDb(requireClient())) ?? new Map();
}

export async function saveSupplierContent(supplierSlug: string, content: SupplierContentOverride): Promise<void> {
  const { error } = await saveSupplierContentInDb(requireClient(), supplierSlug, content);
  if (!error) return;

  if (error.includes('supplier_page_content') || error.includes('schema cache')) {
    throw new AdminDbError(
      `These sections need the supplier_page_content table. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
  }
  throw new AdminDbError(error);
}

/** Saved intro / legit / market / FAQ overrides keyed by supplier slug. Empty until 0033 has run. */
export async function listSavedSupplierSections(): Promise<Map<string, SupplierPageSectionsOverride>> {
  return (await fetchSupplierSectionsFromDb(requireClient())) ?? new Map();
}

/**
 * Saves every editable section of one supplier page in one write. Before 0033
 * has run, a save that changes none of the newer sections still goes through
 * on the original columns, so About keeps working; one that does change them
 * asks for the migration.
 */
export async function saveSupplierPage(
  supplierSlug: string,
  content: SupplierContentOverride,
  sections: SupplierPageSectionsOverride,
): Promise<void> {
  const client = requireClient();
  const { error } = await saveSupplierPageInDb(client, supplierSlug, content, sections);
  if (!error) return;

  if (isMissingSectionColumns(error)) {
    if (isEmptySectionsOverride(sections)) {
      await saveSupplierContent(supplierSlug, content);
      return;
    }
    throw new AdminDbError(
      `The intro, "legit?", market price and FAQ sections need new columns. Run ${SECTIONS_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
  }
  if (error.message.includes('supplier_page_content') || error.message.includes('schema cache')) {
    throw new AdminDbError(
      `These sections need the supplier_page_content table. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
  }
  throw new AdminDbError(error.message);
}
