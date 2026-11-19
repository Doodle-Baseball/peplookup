import 'server-only';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { VendorListingPlanId, VendorPaymentMethod } from '@/config/vendor-listing';
import type { VendorApplication } from '@/lib/vendor-listing/application';

export class VendorListingDbError extends Error {}

const MISSING_TABLE_HINT =
  'The vendor_listing_requests table is not there yet. Run supabase/migrations/0020_vendor_listing_requests.sql in the Supabase SQL editor first.';

const MISSING_COLUMN_HINT =
  'Some supplier listing columns are not there yet. Run supabase/migrations/0021_vendor_listing_message.sql and 0034_vendor_listing_manual_payment.sql in the Supabase SQL editor first.';

/**
 * The flow is manual payment, then admin review. Rows left over from the old
 * Whop checkout (PENDING_PAYMENT, PAID) are never read: every query asks only
 * for these statuses, so they stay untouched in the table and cannot break a page.
 */
const CURRENT_STATUSES = ['PENDING_REVIEW', 'APPROVED', 'REJECTED'] as const;
export type VendorListingStatus = (typeof CURRENT_STATUSES)[number];

export interface VendorListingRequest {
  requestId: string;
  plan: VendorListingPlanId;
  amountCents: number;
  organizationName: string;
  email: string;
  contactNumber: string | null;
  websiteUrl: string;
  affiliateSignupUrl: string | null;
  coaPageUrl: string | null;
  commissionPercent: number;
  customerDiscountPercent: number;
  message: string | null;
  status: VendorListingStatus;
  paymentMethod: VendorPaymentMethod | null;
  paymentScreenshotPath: string | null;
  paymentVerifiedAt: string | null;
  reviewedAt: string | null;
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
  // The columns below are absent until their migrations (0021, 0034) have been run.
  affiliate_signup_url: z.string().nullish(),
  coa_page_url: z.string().nullish(),
  commission_percent: z.coerce.number(),
  customer_discount_percent: z.coerce.number(),
  message: z.string().nullish(),
  status: z.enum(CURRENT_STATUSES),
  payment_method: z.enum(['btc', 'paypal']).nullish(),
  payment_screenshot_path: z.string().nullish(),
  payment_verified_at: z.string().nullish(),
  reviewed_at: z.string().nullish(),
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
    affiliateSignupUrl: parsed.affiliate_signup_url ?? null,
    coaPageUrl: parsed.coa_page_url ?? null,
    commissionPercent: parsed.commission_percent,
    customerDiscountPercent: parsed.customer_discount_percent,
    message: parsed.message ?? null,
    status: parsed.status,
    paymentMethod: parsed.payment_method ?? null,
    paymentScreenshotPath: parsed.payment_screenshot_path ?? null,
    paymentVerifiedAt: parsed.payment_verified_at ?? null,
    reviewedAt: parsed.reviewed_at ?? null,
    paidAt: parsed.paid_at,
    seenAt: parsed.seen_at,
    createdAt: parsed.created_at,
  };
}

export function requireClient() {
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
  if (error.code === '42703' || error.code === 'PGRST204') throw new VendorListingDbError(MISSING_COLUMN_HINT);
  // 23514 = check_violation: the status check still predates 0034.
  if (error.code === '23514') throw new VendorListingDbError(`${MISSING_COLUMN_HINT} (${error.message})`);
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

/** A submitted application with its payment screenshot, waiting for the admin's review. */
export async function createRequest(input: {
  requestId: string;
  application: VendorApplication;
  amountCents: number;
  paymentMethod: VendorPaymentMethod;
  paymentScreenshotPath: string;
}): Promise<VendorListingRequest> {
  const { application } = input;
  const { data, error } = await requireClient()
    .from('vendor_listing_requests')
    .insert({
      request_id: input.requestId,
      plan: application.plan,
      amount_cents: input.amountCents,
      organization_name: application.organizationName,
      email: application.email,
      contact_number: application.contactNumber ?? null,
      website_url: application.websiteUrl,
      affiliate_signup_url: application.affiliateSignupUrl,
      coa_page_url: application.coaPageUrl,
      commission_percent: application.commissionPercent,
      customer_discount_percent: application.customerDiscountPercent,
      message: application.message ?? null,
      status: 'PENDING_REVIEW',
      payment_method: input.paymentMethod,
      payment_screenshot_path: input.paymentScreenshotPath,
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
    .in('status', [...CURRENT_STATUSES])
    .maybeSingle();
  if (error) fail(error);
  return data ? fromRow(data) : null;
}

export async function listRequests(): Promise<VendorListingRequest[]> {
  const { data, error } = await requireClient()
    .from('vendor_listing_requests')
    .select()
    .in('status', [...CURRENT_STATUSES])
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
    .in('status', [...CURRENT_STATUSES])
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

/** The admin has checked the screenshot against the BTC wallet or PayPal account. Only a request still under review. */
export async function markPaymentVerified(requestId: string): Promise<VendorListingRequest | null> {
  const now = new Date().toISOString();
  const { data, error } = await requireClient()
    .from('vendor_listing_requests')
    .update({ payment_verified_at: now, updated_at: now })
    .eq('request_id', requestId)
    .eq('status', 'PENDING_REVIEW')
    .is('payment_verified_at', null)
    .select()
    .maybeSingle();
  if (error) fail(error);
  return data ? fromRow(data) : null;
}

/**
 * PENDING_REVIEW -> APPROVED or REJECTED, once. Approving needs a verified
 * payment; the filters make the update a no-op otherwise, and the caller
 * reports that instead of guessing why.
 */
export async function reviewRequest(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
): Promise<VendorListingRequest | null> {
  const now = new Date().toISOString();
  let query = requireClient()
    .from('vendor_listing_requests')
    .update({ status: decision, reviewed_at: now, updated_at: now })
    .eq('request_id', requestId)
    .eq('status', 'PENDING_REVIEW');
  if (decision === 'APPROVED') query = query.not('payment_verified_at', 'is', null);
  const { data, error } = await query.select().maybeSingle();
  if (error) fail(error);
  return data ? fromRow(data) : null;
}
