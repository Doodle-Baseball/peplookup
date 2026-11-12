import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Offer, LabReport, ProductForm } from '@/lib/schema';
import type { Currency } from '@/lib/money';

/** Snake_case shape of a row in the `offers` table (see supabase/migrations/0006_offers.sql). */
export interface OfferRow {
  id: string;
  product_slug: string;
  supplier_slug: string;
  form: ProductForm;
  vial_size: number;
  vial_count: number;
  list_price: number;
  sale_price: number | null;
  currency: Currency;
  in_stock: boolean;
  product_url: string;
  image_url: string | null;
  /** The supplier's own address for the picture `image_url` was copied from (0032_offers_image_source_url.sql). */
  image_source_url?: string | null;
  lab_report: LabReport | null;
  coa_url: string | null;
  scraped_at: string;
  created_at: string;
  updated_at: string;
}

export function rowToOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    productSlug: row.product_slug,
    supplierSlug: row.supplier_slug,
    form: row.form,
    vialSize: row.vial_size,
    vialCount: row.vial_count,
    listPrice: row.list_price,
    salePrice: row.sale_price,
    currency: row.currency,
    inStock: row.in_stock,
    productUrl: row.product_url,
    imageUrl: row.image_url,
    labReport: row.lab_report,
    coaUrl: row.coa_url,
    scrapedAt: row.scraped_at,
  };
}

const FETCH_PAGE_SIZE = 1000;

/**
 * The offer list is read in this many slices of the id range. Next's data cache
 * refuses any entry over 2MB, and the whole table passed that, so each slice is
 * cached on its own. A uuid falls in exactly one slice for good, so slices
 * refreshed at different moments can never repeat or drop a row between them.
 */
export const OFFER_SHARD_COUNT = 8;

/** Lowest id in a slice. Postgres orders uuids by their bytes, the same order as their lowercase hex. */
function shardStartId(shard: number): string {
  const leading = ((shard * 16) / OFFER_SHARD_COUNT).toString(16);
  return `${leading}0000000-0000-0000-0000-000000000000`;
}

/**
 * One page of one slice of the offer list. `select('*')` rather than an explicit column
 * list because `coa_url` only exists after supabase/migrations/0007_offers_coa_url.sql,
 * and naming a column the table doesn't have yet fails the whole query.
 */
function offersPage(client: SupabaseClient, shard: number, from: number, withCount: boolean) {
  let query = client
    .from('offers')
    .select('*', withCount ? { count: 'exact' } : undefined)
    .gte('id', shardStartId(shard));
  if (shard + 1 < OFFER_SHARD_COUNT) query = query.lt('id', shardStartId(shard + 1));
  return query
    .order('scraped_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + FETCH_PAGE_SIZE - 1);
}

/** The order the full list is served in: newest first, ties by id, as one query over the whole table returned it. */
export function compareOffersNewestFirst(a: Offer, b: Offer): number {
  const byScraped = Date.parse(b.scrapedAt) - Date.parse(a.scrapedAt);
  if (byScraped !== 0) return byScraped;
  const aId = a.id ?? '';
  const bId = b.id ?? '';
  return aId < bId ? -1 : aId > bId ? 1 : 0;
}

/**
 * Every offer in one slice of the id range (see OFFER_SHARD_COUNT); reading each slice
 * 0 to OFFER_SHARD_COUNT - 1 covers the table exactly once.
 *
 * Returns null (not []) on any failure so callers can fall back to the static/demo seed.
 *
 * Paginates in `FETCH_PAGE_SIZE` chunks: a plain unbounded `select` silently truncates to
 * PostgREST's default row cap (1000), so once the table passes that size a single query
 * would drop everything past the cutoff instead of erroring. The secondary `id` sort makes
 * the order total (many rows share one `scraped_at` from a single seed run) so paging by
 * `range` can't skip or duplicate rows across a tie at the page boundary.
 *
 * The first page also asks for the exact row count, so the remaining pages can be fetched
 * in parallel instead of discovering the end one sequential round trip at a time.
 */
export async function fetchOffersFromDb(client: SupabaseClient, shard: number): Promise<Offer[] | null> {
  const first = await offersPage(client, shard, 0, true);
  if (first.error || !first.data) return null;

  const total = first.count ?? first.data.length;
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, Math.ceil(total / FETCH_PAGE_SIZE) - 1) }, (_, index) =>
      offersPage(client, shard, (index + 1) * FETCH_PAGE_SIZE, false),
    ),
  );

  const rows = [...(first.data as OfferRow[])];
  for (const page of rest) {
    if (page.error || !page.data) return null;
    rows.push(...(page.data as OfferRow[]));
  }
  return rows.map(rowToOffer);
}

/**
 * One vendor's listings only, filtered in the database. The admin vendor editor
 * used to pull every offer in the table (thousands of rows) to show one vendor's
 * few dozen. A single vendor never approaches the 1000-row cap, but this still
 * pages so it stays correct if one ever does.
 */
export async function fetchOffersForSupplierFromDb(
  client: SupabaseClient,
  supplierSlug: string,
): Promise<Offer[] | null> {
  const rows: OfferRow[] = [];
  for (let from = 0; ; from += FETCH_PAGE_SIZE) {
    const { data, error } = await client
      .from('offers')
      .select('*')
      .eq('supplier_slug', supplierSlug)
      .order('scraped_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1);
    if (error || !data) return null;
    rows.push(...(data as OfferRow[]));
    if (data.length < FETCH_PAGE_SIZE) break;
  }
  return rows.map(rowToOffer);
}

export async function fetchOfferFromDb(client: SupabaseClient, id: string): Promise<Offer | null> {
  const { data, error } = await client.from('offers').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToOffer(data as OfferRow);
}

export interface OfferInput {
  productSlug: string;
  supplierSlug: string;
  form: ProductForm;
  /** Integer micrograms per vial. */
  vialSize: number;
  vialCount: number;
  /** Integer cents. */
  listPrice: number;
  salePrice: number | null;
  currency: Currency;
  inStock: boolean;
  productUrl: string;
  imageUrl: string | null;
  /** Set only when `imageUrl` is our copy of a supplier picture; left out, the stored value is not touched. */
  imageSourceUrl?: string | null;
  labReport: LabReport | null;
  /** Plain COA link with no grade/score. See the field's doc comment on `offerSchema`. */
  coaUrl?: string | null;
}

/** `scrapedAt` isn't part of the admin form, it's stamped with the save time itself. */
export function offerInputToInsertRow(input: OfferInput) {
  return {
    product_slug: input.productSlug,
    supplier_slug: input.supplierSlug,
    form: input.form,
    vial_size: input.vialSize,
    vial_count: input.vialCount,
    list_price: input.listPrice,
    sale_price: input.salePrice,
    currency: input.currency,
    in_stock: input.inStock,
    product_url: input.productUrl,
    image_url: input.imageUrl,
    ...(input.imageSourceUrl !== undefined ? { image_source_url: input.imageSourceUrl } : {}),
    lab_report: input.labReport,
    coa_url: input.coaUrl ?? null,
    scraped_at: new Date().toISOString(),
  };
}
