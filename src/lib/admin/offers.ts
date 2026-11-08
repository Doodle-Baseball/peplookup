import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isOwnImageUrl, mirrorOfferImage, OfferImageError, type SiblingImage } from '@/lib/admin/offer-images';
import {
  fetchOffersForSupplierFromDb,
  fetchOfferFromDb,
  offerInputToInsertRow,
  type OfferInput,
} from '@/lib/supabase/offers';
import type { Offer } from '@/lib/schema';
import { AdminDbError } from '@/lib/admin/vendors';
import { withPublishedCoaLink } from '@/data/vendor-coa-links';
import { getSupplierSlugAliases } from '@/lib/seo-redirects';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

/** One vendor's listings, read straight from the table so admin edits show immediately. */
export async function listOffersForVendor(supplierSlug: string): Promise<Offer[]> {
  const stored = await fetchOffersForSupplierFromDb(requireClient(), supplierSlug);
  if (stored === null) {
    throw new AdminDbError(
      'The offers table could not be read. Run supabase/migrations/0006_offers.sql in the Supabase SQL editor first.',
    );
  }
  const previousSlugs = (await getSupplierSlugAliases()).get(supplierSlug);
  return stored.map((offer) => withPublishedCoaLink(offer, previousSlugs));
}

export async function getOfferRow(id: string): Promise<Offer | null> {
  const client = requireClient();
  return fetchOfferFromDb(client, id);
}

function offersInsertRowWithOptionalCoa(input: OfferInput, includeCoaUrl: boolean) {
  const row = offerInputToInsertRow(input);
  if (!includeCoaUrl) {
    delete (row as { coa_url?: string | null }).coa_url;
  }
  return row;
}

function isMissingCoaUrlColumnError(error: { message?: string } | null | undefined) {
  const message = error?.message ?? '';
  return message.includes("'coa_url' column") || message.includes('coa_url') && message.includes('column');
}

/**
 * The same supplier's other pictures of this compound, so a new copy doesn't take a file name
 * one of them already holds. Null when `image_source_url` doesn't exist yet (0032 not run).
 */
async function fetchSiblingImages(
  client: SupabaseClient,
  supplierSlug: string,
  productSlug: string,
  excludeOfferId: string | undefined,
): Promise<SiblingImage[] | null> {
  const { data, error } = await client
    .from('offers')
    .select('id, image_url, image_source_url')
    .eq('supplier_slug', supplierSlug)
    .eq('product_slug', productSlug);
  if (error) {
    if (error.message.includes('image_source_url')) return null;
    throw new AdminDbError(error.message);
  }
  return (data ?? [])
    .filter((row) => row.id !== excludeOfferId)
    .map((row) => ({ imageUrl: row.image_url as string | null, imageSourceUrl: row.image_source_url as string | null }));
}

/**
 * Saves a supplier's picture as our own copy: `imageUrl` becomes our URL and the original is kept
 * in `imageSourceUrl`. A picture that is already ours is left alone. When the copy fails the
 * supplier's URL is kept, so the offer still saves and the card falls back to its placeholder.
 */
async function withMirroredImage(client: SupabaseClient, input: OfferInput, offerId?: string): Promise<OfferInput> {
  const sourceUrl = input.imageUrl;
  if (sourceUrl && isOwnImageUrl(sourceUrl)) return input;

  const siblings = await fetchSiblingImages(client, input.supplierSlug, input.productSlug, offerId);
  if (!sourceUrl) {
    // A cleared picture also clears the note of where it was copied from, once that column exists.
    return siblings === null ? input : { ...input, imageSourceUrl: null };
  }
  if (siblings === null) {
    console.warn('[offer-images] Kept the supplier image URL: run supabase/migrations/0032_offers_image_source_url.sql to copy product images.');
    return input;
  }
  try {
    const mirrored = await mirrorOfferImage(client, {
      sourceUrl,
      supplierSlug: input.supplierSlug,
      productSlug: input.productSlug,
      siblings,
    });
    return { ...input, imageUrl: mirrored.imageUrl, imageSourceUrl: mirrored.imageSourceUrl };
  } catch (error) {
    if (!(error instanceof OfferImageError)) throw error;
    console.warn(`[offer-images] Kept the supplier image URL for ${input.supplierSlug}/${input.productSlug}: ${error.message} (${sourceUrl})`);
    return { ...input, imageSourceUrl: null };
  }
}

export async function createOffer(rawInput: OfferInput): Promise<Offer> {
  const client = requireClient();
  const input = await withMirroredImage(client, rawInput);
  let row = offersInsertRowWithOptionalCoa(input, true);
  let { data, error } = await client.from('offers').insert(row).select('id').single();

  if (error && isMissingCoaUrlColumnError(error)) {
    row = offersInsertRowWithOptionalCoa(input, false);
    ({ data, error } = await client.from('offers').insert(row).select('id').single());
  }

  if (error) throw new AdminDbError(error.message);
  if (!data || !data.id) throw new AdminDbError('Product was created but could not be re-read.');
  const created = await fetchOfferFromDb(client, data.id as string);
  if (!created) throw new AdminDbError('Product was created but could not be re-read.');
  return created;
}

export async function updateOffer(id: string, rawInput: OfferInput): Promise<void> {
  const client = requireClient();
  const input = await withMirroredImage(client, rawInput, id);
  let row = offersInsertRowWithOptionalCoa(input, true);
  let { error } = await client.from('offers').update(row).eq('id', id);

  if (error && isMissingCoaUrlColumnError(error)) {
    row = offersInsertRowWithOptionalCoa(input, false);
    ({ error } = await client.from('offers').update(row).eq('id', id));
  }

  if (error) throw new AdminDbError(error.message);
}

export async function deleteOffer(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('offers').delete().eq('id', id);
  if (error) throw new AdminDbError(error.message);
}
