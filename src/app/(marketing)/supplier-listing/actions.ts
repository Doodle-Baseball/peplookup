'use server';

import { LISTED_PLAN_ID, vendorListingPlan } from '@/config/vendor-listing';
import {
  fieldErrorsFrom,
  matchesImageSignature,
  paymentMethodSchema,
  screenshotProblem,
  vendorApplicationSchema,
  type SubmitFieldErrors,
} from '@/lib/vendor-listing/application';
import { sendNewRequestEmail } from '@/lib/vendor-listing/email';
import { getPaymentDetails } from '@/lib/vendor-listing/payment-details';
import { createRequest, generateRequestId, VendorListingDbError } from '@/lib/vendor-listing/requests';
import { deletePaymentScreenshot, uploadPaymentScreenshot } from '@/lib/vendor-listing/screenshots';

export type SubmitApplicationResult =
  | { ok: true; requestId: string }
  | { ok: false; error: string | null; fieldErrors: SubmitFieldErrors };

const GENERIC_ERROR = 'Something went wrong submitting your application. Please try again, or email us.';

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

/**
 * Brand details + payment method + payment screenshot -> the screenshot in
 * private storage, a PENDING_REVIEW row, and an email to the site owner. The
 * listing goes live only after the admin verifies the payment and approves it.
 */
export async function submitVendorApplication(formData: FormData): Promise<SubmitApplicationResult> {
  const application = vendorApplicationSchema.safeParse({
    plan: LISTED_PLAN_ID,
    organizationName: text(formData, 'organizationName'),
    email: text(formData, 'email'),
    contactNumber: text(formData, 'contactNumber'),
    websiteUrl: text(formData, 'websiteUrl'),
    affiliateSignupUrl: text(formData, 'affiliateSignupUrl'),
    coaPageUrl: text(formData, 'coaPageUrl'),
    commissionPercent: text(formData, 'commissionPercent'),
    customerDiscountPercent: text(formData, 'customerDiscountPercent'),
    message: text(formData, 'message'),
  });
  if (!application.success) return { ok: false, error: null, fieldErrors: fieldErrorsFrom(application.error) };

  const method = paymentMethodSchema.safeParse(formData.get('paymentMethod'));
  if (!method.success) return { ok: false, error: null, fieldErrors: { paymentMethod: 'Choose how you paid' } };
  if (!getPaymentDetails()[method.data]) {
    return { ok: false, error: null, fieldErrors: { paymentMethod: 'This payment method is not available right now' } };
  }

  const file = formData.get('paymentScreenshot');
  const screenshot = file instanceof File ? file : null;
  const problem = screenshotProblem(screenshot);
  if (problem || !screenshot) return { ok: false, error: null, fieldErrors: { paymentScreenshot: problem ?? undefined } };
  const bytes = new Uint8Array(await screenshot.arrayBuffer());
  if (!matchesImageSignature(bytes, screenshot.type)) {
    return { ok: false, error: null, fieldErrors: { paymentScreenshot: 'This file is not a valid PNG, JPG or WebP image' } };
  }

  try {
    const requestId = generateRequestId();
    const path = await uploadPaymentScreenshot(requestId, bytes, screenshot.type);
    let request;
    try {
      request = await createRequest({
        requestId,
        application: application.data,
        amountCents: vendorListingPlan(application.data.plan).priceCents,
        paymentMethod: method.data,
        paymentScreenshotPath: path,
      });
    } catch (error) {
      // Without its row the screenshot would be an orphan nobody can find.
      await deletePaymentScreenshot(path).catch((cleanupError: unknown) =>
        console.error('[vendor-listing] Orphaned screenshot could not be removed:', path, cleanupError),
      );
      throw error;
    }
    // Awaited so a serverless function isn't frozen mid-send; it never throws.
    await sendNewRequestEmail(request, { filename: `${requestId}-payment${extensionFor(screenshot.type)}`, bytes });
    return { ok: true, requestId: request.requestId };
  } catch (error) {
    console.error('[vendor-listing] Could not record the application:', error);
    return {
      ok: false,
      error: error instanceof VendorListingDbError && process.env.NODE_ENV !== 'production' ? error.message : GENERIC_ERROR,
      fieldErrors: {},
    };
  }
}

function extensionFor(type: string): string {
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  return '.jpg';
}
