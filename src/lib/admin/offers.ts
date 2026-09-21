import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchOffersForSupplierFromDb,
  fetchOfferFromDb,
  offerInputToInsertRow,
  type OfferInput,
} from '@/lib/supabase/offers';
import type { Offer } from '@/lib/schema';
import { AdminDbError } from '@/lib/admin/vendors';
import { withPublishedCoaLink } from '@/data/vendor-coa-links';

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
  return stored.map(withPublishedCoaLink);
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

export async function createOffer(input: OfferInput): Promise<Offer> {
  const client = requireClient();
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

export async function updateOffer(id: string, input: OfferInput): Promise<void> {
  const client = requireClient();
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
