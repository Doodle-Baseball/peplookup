import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  COUPON_DETAIL_KEYS,
  isEmptyCouponOverride,
  type CouponDetailKey,
  type CouponPageContentOverride,
} from '@/lib/coupon-page-content';

/** Snake_case shape of a row in `coupon_page_content` (see supabase/migrations/0023_coupon_page_content.sql). */
export interface CouponPageContentRow {
  supplier_slug: string;
  intro: string | null;
  detail_code_and_offer: string | null;
  detail_offer_status: string | null;
  detail_customers: string | null;
  detail_expiry: string | null;
  detail_stacking: string | null;
  detail_shipping: string | null;
  how_to_steps: string[] | null;
  working_note: string | null;
}

const COLUMNS =
  'supplier_slug, intro, detail_code_and_offer, detail_offer_status, detail_customers, detail_expiry, detail_stacking, detail_shipping, how_to_steps, working_note';

const DETAIL_COLUMN: Record<CouponDetailKey, keyof CouponPageContentRow> = {
  codeAndOffer: 'detail_code_and_offer',
  offerStatus: 'detail_offer_status',
  customers: 'detail_customers',
  expiry: 'detail_expiry',
  stacking: 'detail_stacking',
  shipping: 'detail_shipping',
};

export function rowToCouponPageContent(row: CouponPageContentRow): CouponPageContentOverride {
  const details = {} as Record<CouponDetailKey, string | null>;
  for (const key of COUPON_DETAIL_KEYS) details[key] = row[DETAIL_COLUMN[key]] as string | null;
  return { intro: row.intro, details, steps: row.how_to_steps, workingNote: row.working_note };
}

/**
 * Every saved override, keyed by supplier slug, in one query: one row per
 * vendor at most, and both the admin and the public pages want the lot. Null
 * (not an empty map) on failure, so callers can tell "nothing saved" from
 * "table not migrated yet" and fall back to generated text either way.
 */
export async function fetchCouponPageContentFromDb(
  client: SupabaseClient,
): Promise<Map<string, CouponPageContentOverride> | null> {
  const { data, error } = await client.from('coupon_page_content').select(COLUMNS);
  if (error || !data) return null;
  return new Map((data as CouponPageContentRow[]).map((row) => [row.supplier_slug, rowToCouponPageContent(row)]));
}

/** Writes one vendor's overrides. An all-null override deletes the row, putting the whole page back on generated text. */
export async function saveCouponPageContentInDb(
  client: SupabaseClient,
  supplierSlug: string,
  content: CouponPageContentOverride,
): Promise<{ error?: string }> {
  const { error } = isEmptyCouponOverride(content)
    ? await client.from('coupon_page_content').delete().eq('supplier_slug', supplierSlug)
    : await client.from('coupon_page_content').upsert(
        {
          supplier_slug: supplierSlug,
          intro: content.intro,
          detail_code_and_offer: content.details.codeAndOffer,
          detail_offer_status: content.details.offerStatus,
          detail_customers: content.details.customers,
          detail_expiry: content.details.expiry,
          detail_stacking: content.details.stacking,
          detail_shipping: content.details.shipping,
          how_to_steps: content.steps,
          working_note: content.workingNote,
        },
        { onConflict: 'supplier_slug' },
      );
  return error ? { error: error.message } : {};
}
