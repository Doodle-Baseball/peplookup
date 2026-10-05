'use server';

import { cookies } from 'next/headers';
import { REQUEST_COOKIE, vendorListingPlan } from '@/config/vendor-listing';
import {
  fieldErrorsFrom,
  vendorApplicationSchema,
  type VendorApplicationFieldErrors,
} from '@/lib/vendor-listing/application';
import { sendNewRequestEmail } from '@/lib/vendor-listing/email';
import { createRequest, VendorListingDbError } from '@/lib/vendor-listing/requests';
import { createCheckout, WhopError } from '@/lib/vendor-listing/whop';

export type SubmitApplicationResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string | null; fieldErrors: VendorApplicationFieldErrors };

const GENERIC_ERROR = 'Something went wrong starting your checkout. Please try again, or email us.';

/**
 * Form → PENDING_PAYMENT row → a Whop checkout for the chosen plan. The row is written before the
 * redirect so an applicant who abandons checkout is still a lead in the
 * admin, and so the payment webhook always has something to match.
 */
export async function submitVendorApplication(input: unknown): Promise<SubmitApplicationResult> {
  const parsed = vendorApplicationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: null, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const request = await createRequest({
      application: parsed.data,
      amountCents: vendorListingPlan(parsed.data.plan).priceCents,
    });
    const checkoutUrl = await createCheckout({
      plan: request.plan,
      requestId: request.requestId,
      email: request.email,
    });
    // The after-payment redirect on Whop's side carries the request id too, but
    // this cookie covers a redirect that arrives without it.
    (await cookies()).set(REQUEST_COOKIE, request.requestId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    // Awaited so a serverless function isn't frozen mid-send; it never throws.
    await sendNewRequestEmail(request);
    return { ok: true, checkoutUrl };
  } catch (error) {
    console.error('[vendor-listing] Could not start checkout:', error);
    const known = error instanceof VendorListingDbError || error instanceof WhopError;
    return {
      ok: false,
      error: known && process.env.NODE_ENV !== 'production' ? error.message : GENERIC_ERROR,
      fieldErrors: {},
    };
  }
}
