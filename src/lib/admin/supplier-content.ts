import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSupplierContentFromDb, saveSupplierContentInDb } from '@/lib/supabase/supplier-content';
import { AdminDbError } from '@/lib/admin/vendors';
import type { SupplierContentOverride } from '@/lib/supplier-content';

const CONTENT_MIGRATION = 'supabase/migrations/0019_supplier_page_content.sql';

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
