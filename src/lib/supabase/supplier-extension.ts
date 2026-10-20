import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupplierExtensionSettings } from '@/lib/extension/feed';
import type { VendorExtensionFields } from '@/lib/extension/vendor-fields';

/** Columns added by 0029_chrome_extension.sql. Selected by name so nothing private is ever read here by accident. */
const EXTENSION_COLUMNS = 'slug, store_domains, show_in_extension, updated_at';

interface ExtensionSettingsRow {
  slug: string;
  store_domains: string[] | null;
  show_in_extension: boolean | null;
  updated_at: string;
}

/** Thrown when the 0029 columns or tables don't exist yet, so callers can say which migration to run. */
export class ExtensionMigrationMissingError extends Error {
  constructor() {
    super('The Chrome extension columns are missing. Run supabase/migrations/0029_chrome_extension.sql in the Supabase SQL editor.');
  }
}

/** Postgres "undefined column/table" and PostgREST's "not in the schema cache" all mean 0029 hasn't run. */
export function isMissingMigrationError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === '42703' || error.code === '42P01' || error.code === 'PGRST204' || error.code === 'PGRST205') return true;
  return /schema cache|does not exist/i.test(error.message ?? '');
}

function rowToSettings(row: ExtensionSettingsRow): SupplierExtensionSettings {
  return {
    slug: row.slug,
    storeDomains: row.store_domains ?? [],
    showInExtension: row.show_in_extension ?? true,
    updatedAt: row.updated_at,
  };
}

export async function fetchExtensionSettingsFromDb(client: SupabaseClient): Promise<SupplierExtensionSettings[]> {
  const { data, error } = await client.from('suppliers').select(EXTENSION_COLUMNS).eq('is_active', true);
  if (isMissingMigrationError(error)) throw new ExtensionMigrationMissingError();
  if (error || !data) throw new Error(error?.message ?? 'Supplier extension settings could not be read.');
  return (data as ExtensionSettingsRow[]).map(rowToSettings);
}

interface VendorExtensionRow {
  store_domains: string[] | null;
  show_in_extension: boolean | null;
  review_rating_updated_at: string | null;
  coupon_verified_at: string | null;
}

/** Null when 0029 hasn't run, so the form can still open and say so. */
export async function fetchVendorExtensionFields(
  client: SupabaseClient,
  slug: string,
): Promise<VendorExtensionFields | null> {
  const { data, error } = await client
    .from('suppliers')
    .select('store_domains, show_in_extension, review_rating_updated_at, coupon_verified_at')
    .eq('slug', slug)
    .maybeSingle();
  if (isMissingMigrationError(error)) return null;
  if (error) throw new Error(error.message);
  const row = data as VendorExtensionRow | null;
  return {
    storeDomains: row?.store_domains ?? [],
    showInExtension: row?.show_in_extension ?? true,
    ratingUpdatedAt: row?.review_rating_updated_at ?? null,
    couponVerifiedAt: row?.coupon_verified_at ?? null,
  };
}

export async function updateVendorExtensionFields(
  client: SupabaseClient,
  slug: string,
  fields: VendorExtensionFields,
): Promise<void> {
  const { error } = await client
    .from('suppliers')
    .update({
      store_domains: fields.storeDomains,
      show_in_extension: fields.showInExtension,
      review_rating_updated_at: fields.ratingUpdatedAt,
      coupon_verified_at: fields.couponVerifiedAt,
    })
    .eq('slug', slug);
  if (isMissingMigrationError(error)) throw new ExtensionMigrationMissingError();
  if (error) throw new Error(error.message);
}

/** Whether 0029 has run, for the new-supplier form, which has no row to read yet. */
export async function extensionColumnsExist(client: SupabaseClient): Promise<boolean> {
  const { error } = await client.from('suppliers').select('show_in_extension').limit(1);
  if (isMissingMigrationError(error)) return false;
  if (error) throw new Error(error.message);
  return true;
}

/**
 * The review count lives in the original review_count columns (0001), shown
 * on supplier cards as "· 120 reviews", so the extension and the site quote
 * one number. An unchanged "at least" count keeps its kind; a new number is exact.
 */
export async function updateVendorReviewCount(
  client: SupabaseClient,
  slug: string,
  reviewCount: { kind: 'exact' | 'atLeast'; value: number } | null,
): Promise<void> {
  const { error } = await client
    .from('suppliers')
    .update({ review_count_kind: reviewCount?.kind ?? null, review_count_value: reviewCount?.value ?? null })
    .eq('slug', slug);
  if (error) throw new Error(error.message);
}

/** Other suppliers already using any of these domains, for the admin's duplicate-domain warning. */
export async function findSuppliersSharingDomains(
  client: SupabaseClient,
  slug: string,
  domains: readonly string[],
): Promise<{ slug: string; name: string; domains: string[] }[]> {
  if (domains.length === 0) return [];
  const { data, error } = await client
    .from('suppliers')
    .select('slug, name, store_domains')
    .overlaps('store_domains', [...domains])
    .neq('slug', slug);
  if (isMissingMigrationError(error)) return [];
  if (error || !data) throw new Error(error?.message ?? 'Could not check for shared domains.');
  return (data as { slug: string; name: string; store_domains: string[] | null }[]).map((row) => ({
    slug: row.slug,
    name: row.name,
    domains: (row.store_domains ?? []).filter((domain) => domains.includes(domain)),
  }));
}

export interface SupplierExtensionOverviewRow {
  slug: string;
  name: string;
  domains: string[];
  showInExtension: boolean;
  /** The coupon columns as stored, so the admin can tell "no code" from "no discount %". */
  couponCode: string | null;
  couponPercentOff: number | null;
}

/** Every supplier's domains and coupon columns, active or not, for /admin/extension. */
export async function fetchAllStoreDomains(client: SupabaseClient): Promise<SupplierExtensionOverviewRow[] | null> {
  const { data, error } = await client
    .from('suppliers')
    .select('slug, name, store_domains, show_in_extension, coupon_code, coupon_percent_off');
  if (isMissingMigrationError(error)) return null;
  if (error || !data) throw new Error(error?.message ?? 'Could not read supplier domains.');
  return (
    data as {
      slug: string;
      name: string;
      store_domains: string[] | null;
      show_in_extension: boolean | null;
      coupon_code: string | null;
      coupon_percent_off: number | null;
    }[]
  ).map((row) => ({
    slug: row.slug,
    name: row.name,
    domains: row.store_domains ?? [],
    showInExtension: row.show_in_extension ?? true,
    couponCode: row.coupon_code,
    couponPercentOff: row.coupon_percent_off,
  }));
}
