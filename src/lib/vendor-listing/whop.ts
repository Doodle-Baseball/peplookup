import 'server-only';
import { z } from 'zod';
import type { VendorListingPlanId } from '@/config/vendor-listing';

/**
 * Thin Whop client for the vendor-listing payments. Everything that differs
 * between Whop's sandbox and production (API host, key, plan ids, checkout
 * links, business id) comes from the environment, so going live is an env
 * change.
 *
 * Each application gets its own Whop checkout, created through the API. It
 * carries the request id as metadata and, on https sites, sends the buyer back
 * to /thanks when payment completes. A payment is matched to its application
 * by that request id, falling back to the buyer's email.
 */

export class WhopError extends Error {}

interface WhopConfig {
  apiKey: string;
  baseUrl: string;
  accountId: string;
  planIds: Record<VendorListingPlanId, string>;
}

function readConfig(): WhopConfig {
  const apiKey = process.env.WHOP_API_KEY;
  const accountId = process.env.WHOP_ACCOUNT_ID;
  const basicPlanId = process.env.WHOP_BASIC_PLAN_ID;
  const proPlanId = process.env.WHOP_PRO_PLAN_ID;
  if (!apiKey || !accountId || !basicPlanId || !proPlanId) {
    throw new WhopError(
      'Whop is not configured. Set WHOP_API_KEY, WHOP_ACCOUNT_ID, WHOP_BASIC_PLAN_ID and WHOP_PRO_PLAN_ID.',
    );
  }
  return {
    apiKey,
    accountId,
    planIds: { basic: basicPlanId, pro: proPlanId },
    baseUrl: (process.env.WHOP_API_BASE_URL ?? 'https://api.whop.com/api/v1').replace(/\/$/, ''),
  };
}

/**
 * Whop only accepts an https redirect, so on a plain http dev server no
 * redirect is sent and the buyer stays on Whop's receipt page.
 * `WHOP_REDIRECT_BASE_URL` (e.g. an https tunnel) turns it on locally.
 */
function redirectBaseUrl(): string | null {
  const explicit = process.env.WHOP_REDIRECT_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? 'https://www.peplookup.com' : null;
}

const checkoutSchema = z.object({ purchase_url: z.string().url() });

/**
 * One Whop checkout per application, for the chosen plan. The applicant's
 * email is filled in and locked so the payment matches their application.
 * Returns the URL to send the buyer to.
 */
export async function createCheckout(input: {
  plan: VendorListingPlanId;
  requestId: string;
  email: string;
}): Promise<string> {
  const config = readConfig();
  const base = redirectBaseUrl();
  const body = await whopFetch(config, '/checkout_configurations', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: config.planIds[input.plan],
      metadata: { request_id: input.requestId },
      ...(base ? { redirect_url: `${base}/thanks?request=${encodeURIComponent(input.requestId)}` } : {}),
    }),
  });
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) throw new WhopError('Whop returned an unexpected checkout response.');
  const url = new URL(parsed.data.purchase_url);
  url.searchParams.set('email', input.email);
  url.searchParams.set('email.disabled', '1');
  return url.toString();
}

/** Which of our plans a Whop plan id belongs to, or null for any other plan on the account. */
export function planForWhopPlanId(whopPlanId: string | null): VendorListingPlanId | null {
  if (!whopPlanId) return null;
  if (whopPlanId === process.env.WHOP_BASIC_PLAN_ID) return 'basic';
  if (whopPlanId === process.env.WHOP_PRO_PLAN_ID) return 'pro';
  return null;
}

async function whopFetch(config: WhopConfig, path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = z.object({ error: z.object({ message: z.string() }) }).safeParse(body);
    throw new WhopError(
      message.success ? `Whop: ${message.data.error.message}` : `Whop request failed (${response.status}).`,
    );
  }
  return body;
}

/**
 * The subset of a Whop payment this feature reads. The payload is external
 * data, so everything is optional; `paid` is decided from `status`/`paid_at`
 * rather than trusting any single field.
 */
const paymentSchema = z.object({
  id: z.string(),
  status: z.string().nullish(),
  paid_at: z.string().nullish(),
  // Confirmed against a real sandbox payment: the buyer's email is the flat
  // `customer_email`, and the plan is the flat `plan_id` string.
  customer_email: z.string().nullish(),
  plan_id: z.string().nullish(),
  // Carries the request id when the buyer paid through our own checkout.
  metadata: z.record(z.unknown()).nullish(),
});

export interface WhopPayment {
  paymentId: string;
  isPaid: boolean;
  paidAt: string | null;
  buyerEmail: string | null;
  whopPlanId: string | null;
  requestId: string | null;
}

export function parseWhopPayment(raw: unknown): WhopPayment | null {
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) return null;
  const payment = parsed.data;
  const requestId = payment.metadata?.request_id;
  return {
    paymentId: payment.id,
    isPaid: payment.status === 'paid' || Boolean(payment.paid_at),
    paidAt: payment.paid_at ?? null,
    buyerEmail: payment.customer_email?.trim().toLowerCase() || null,
    whopPlanId: payment.plan_id ?? null,
    requestId: typeof requestId === 'string' ? requestId : null,
  };
}

/** Paid payments for a plan made since `createdAt`, newest first. */
export async function listPaidPayments(input: {
  plan: VendorListingPlanId;
  createdAt: string;
}): Promise<WhopPayment[]> {
  const config = readConfig();
  const params = new URLSearchParams({
    account_id: config.accountId,
    plan_id: config.planIds[input.plan],
    created_after: input.createdAt,
    first: '50',
  });
  const body = await whopFetch(config, `/payments?${params.toString()}`);
  const list = z.object({ data: z.array(z.unknown()) }).safeParse(body);
  if (!list.success) throw new WhopError('Whop returned an unexpected payments response.');
  return list.data.data
    .map(parseWhopPayment)
    .filter((payment): payment is WhopPayment => payment !== null && payment.isPaid);
}

/** The paid payment for this application: by request id, else by the applicant's email. */
export async function findPaidPayment(input: {
  plan: VendorListingPlanId;
  email: string;
  createdAt: string;
  requestId?: string;
}): Promise<{ match: WhopPayment | null; others: WhopPayment[] }> {
  const email = input.email.trim().toLowerCase();
  const payments = await listPaidPayments(input);
  const match =
    payments.find((payment) => input.requestId !== undefined && payment.requestId === input.requestId) ??
    payments.find((payment) => payment.buyerEmail === email) ??
    null;
  return { match, others: payments.filter((payment) => payment !== match) };
}

/** One payment by id (a single fast lookup, unlike scanning the payments list). */
export async function getPayment(paymentId: string): Promise<WhopPayment | null> {
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) return null;
  return parseWhopPayment(await whopFetch(readConfig(), `/payments/${paymentId}`));
}
