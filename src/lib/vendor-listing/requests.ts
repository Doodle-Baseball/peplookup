import 'server-only';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { VendorListingPlanId } from '@/config/vendor-listing';
import type { VendorApplication } from '@/lib/vendor-listing/application';

export class VendorListingDbError extends Error {}

const MISSING_TABLE_HINT =
  'The vendor_listing_requests table is not there yet. Run supabase/migrations/0020_vendor_listing_requests.sql in the Supabase SQL editor first.';

const MISSING_MESSAGE_COLUMN_HINT =
  'The message column is not there yet. Run supabase/migrations/0021_vendor_listing_message.sql in the Supabase SQL editor first.';

export type VendorListingStatus = 'PENDING_PAYMENT' | 'PAID';

export interface VendorListingRequest {
  requestId: string;
  plan: VendorListingPlanId;
  amountCents: number;
  organizationName: string;
  email: string;
  contactNumber: string | null;
  websiteUrl: string;
  commissionPercent: number;
  customerDiscountPercent: number;
  message: string | null;
  status: VendorListingStatus;
  whopPaymentId: string | null;
  paidAt: string | null;
  seenAt: string | null;
  createdAt: string;
}

const rowSchema = z.object({
  request_id: z.string(),
  plan: z.enum(['basic', 'pro']),
  amount_cents: z.number().int(),
  organization_name: z.string(),
  email: z.string(),
  contact_number: z.string().nullable(),
  website_url: z.string(),
  commission_percent: z.coerce.number(),
  customer_discount_percent: z.coerce.number(),
  // Absent until 0021_vendor_listing_message.sql has been run.
  message: z.string().nullish(),
  status: z.enum(['PENDING_PAYMENT', 'PAID']),
  whop_payment_id: z.string().nullable(),
  paid_at: z.string().nullable(),
  seen_at: z.string().nullable(),
  created_at: z.string(),
});

function fromRow(row: unknown): VendorListingRequest {
  const parsed = rowSchema.parse(row);
  return {
    requestId: parsed.request_id,
    plan: parsed.plan,
    amountCents: parsed.amount_cents,
    organizationName: parsed.organization_name,
    email: parsed.email,
    contactNumber: parsed.contact_number,
    websiteUrl: parsed.website_url,
    commissionPercent: parsed.commission_percent,
    customerDiscountPercent: parsed.customer_discount_percent,
    message: parsed.message ?? null,
    status: parsed.status,
    whopPaymentId: parsed.whop_payment_id,
    paidAt: parsed.paid_at,
    seenAt: parsed.seen_at,
    createdAt: parsed.created_at,
  };
}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new VendorListingDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

function fail(error: { code?: string; message: string }): never {
  // 42P01 = undefined_table, PGRST205 = PostgREST's "not in schema cache".
  if (error.code === '42P01' || error.code === 'PGRST205') throw new VendorListingDbError(MISSING_TABLE_HINT);
  // 42703 = undefined_column, PGRST204 = PostgREST's "column not in schema cache".
  if (error.code === '42703' || error.code === 'PGRST204') throw new VendorListingDbError(MISSING_MESSAGE_COLUMN_HINT);
  throw new VendorListingDbError(error.message);
}

// No 0/O/1/I, so an id read aloud or copied from an email is hard to get wrong.
const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRequestId(): string {
  const bytes = randomBytes(8);
  let id = '';
  for (const byte of bytes) id += ID_ALPHABET[byte % ID_ALPHABET.length];
  return `VL-${id}`;
}

export async function createRequest(input: {
  application: VendorApplication;
  amountCents: number;
}): Promise<VendorListingRequest> {
  const client = requireClient();
  const { application } = input;
  const { data, error } = await client
    .from('vendor_listing_requests')
    .insert({
      request_id: generateRequestId(),
      plan: application.plan,
      amount_cents: input.amountCents,
      organization_name: application.organizationName,
      email: application.email,
      contact_number: application.contactNumber ?? null,
      website_url: application.websiteUrl,
      commission_percent: application.commissionPercent,
      customer_discount_percent: application.customerDiscountPercent,
      // Only sent when filled in, so applications without one keep working
      // even before the message column exists.
      ...(application.message ? { message: application.message } : {}),
    })
    .select()
    .single();
  if (error) fail(error);
  return fromRow(data);
}

export async function getRequest(requestId: string): Promise<VendorListingRequest | null> {
  const { data, error } = await requireClient()
    .from('vendor_listing_requests')
    .select()
    .eq('request_id', requestId)
    .maybeSingle();
  if (error) fail(error);
  return data ? fromRow(data) : null;
}

/**
 * The newest unpaid request from this email, optionally for one plan. A
 * Whop plan-link payment carries no request id, so the buyer's email is the
 * only link back to the application they filled in.
 */
export async function findPendingRequestByEmail(
  email: string,
  plan?: VendorListingPlanId,
): Promise<VendorListingRequest | null> {
  let query = requireClient()
    .from('vendor_listing_requests')
    .select()
    .eq('status', 'PENDING_PAYMENT')
    .eq('email', email.trim().toLowerCase()); // stored lowercase by the application schema
  if (plan) query = query.eq('plan', plan);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) fail(error);
  return data ? fromRow(data) : null;
}

export async function listRequests(): Promise<VendorListingRequest[]> {
  const { data, error } = await requireClient()
    .from('vendor_listing_requests')
    .select()
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) fail(error);
  return (data ?? []).map(fromRow);
}

/** Never throws: it feeds the sidebar badge, which must not take the whole admin down. */
export async function countUnseenRequests(): Promise<number> {
  const client = getSupabaseServerClient();
  if (!client) return 0;
  const { count, error } = await client
    .from('vendor_listing_requests')
    .select('request_id', { count: 'exact', head: true })
    .is('seen_at', null);
  return error ? 0 : (count ?? 0);
}

export async function deleteRequest(requestId: string): Promise<void> {
  const { error } = await requireClient().from('vendor_listing_requests').delete().eq('request_id', requestId);
  if (error) fail(error);
}

export async function markAllSeen(): Promise<void> {
  const { error } = await requireClient()
    .from('vendor_listing_requests')
    .update({ seen_at: new Date().toISOString() })
    .is('seen_at', null);
  if (error) fail(error);
}

/**
 * PENDING_PAYMENT → PAID, exactly once. The `neq` guard makes the update a
 * no-op for a request that is already paid, so a Whop webhook retry (or the
 * webhook racing the admin's "Verify" button) returns `null` and the caller
 * does not send the confirmation emails a second time.
 */
export async function markPaid(
  requestId: string,
  payment: { paymentId: string; paidAt: string | null },
): Promise<VendorListingRequest | null> {
  const { data, error } = await requireClient()
    .from('vendor_listing_requests')
    .update({
      status: 'PAID',
      whop_payment_id: payment.paymentId,
      paid_at: payment.paidAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('request_id', requestId)
    .neq('status', 'PAID')
    .select()
    .maybeSingle();
  if (error) fail(error);
  return data ? fromRow(data) : null;
}
