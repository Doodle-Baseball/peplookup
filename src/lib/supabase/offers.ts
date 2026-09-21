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
 * One page of the full offer list. `select('*')` rather than an explicit column list
 * because `coa_url` only exists after supabase/migrations/0007_offers_coa_url.sql, and
 * naming a column the table doesn't have yet fails the whole query.
 */
function offersPage(client: SupabaseClient, from: number, withCount: boolean) {
  return client
    .from('offers')
    .select('*', withCount ? { count: 'exact' } : undefined)
    .order('scraped_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + FETCH_PAGE_SIZE - 1);
}

/**
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
export async function fetchOffersFromDb(client: SupabaseClient): Promise<Offer[] | null> {
  const first = await offersPage(client, 0, true);
  if (first.error || !first.data) return null;

  const total = first.count ?? first.data.length;
  const rest = await Promise.all(
    Array.from({ length: Math.ceil(total / FETCH_PAGE_SIZE) - 1 }, (_, index) =>
      offersPage(client, (index + 1) * FETCH_PAGE_SIZE, false),
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
    lab_report: input.labReport,
    coa_url: input.coaUrl ?? null,
    scraped_at: new Date().toISOString(),
  };
}
