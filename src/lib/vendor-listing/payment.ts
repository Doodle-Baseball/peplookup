import 'server-only';
import {
  sendPaymentConfirmedAdminEmail,
  sendPaymentConfirmedApplicantEmail,
} from '@/lib/vendor-listing/email';
import { findPaidPayment, getPayment, planForWhopPlanId, type WhopPayment } from '@/lib/vendor-listing/whop';
import { markPaid, type VendorListingRequest } from '@/lib/vendor-listing/requests';

/**
 * The one place a request becomes PAID, shared by the webhook, the admin's
 * "Verify with Whop" button and the thanks page. `markPaid` only succeeds
 * once per request, so the emails go out once however many of those paths
 * report the same payment.
 */
export async function settlePayment(requestId: string, payment: WhopPayment): Promise<VendorListingRequest | null> {
  const paid = await markPaid(requestId, { paymentId: payment.paymentId, paidAt: payment.paidAt });
  if (!paid) return null;
  await Promise.all([sendPaymentConfirmedAdminEmail(paid), sendPaymentConfirmedApplicantEmail(paid)]);
  return paid;
}

/**
 * Whop's after-payment redirect carries `payment_id`. That value comes from
 * the URL, so it is only trusted after Whop itself confirms the payment is
 * paid, is for this request's plan, and was made with the applicant's email.
 * One direct lookup, instead of scanning the payments list.
 */
export async function verifyPaymentId(
  request: VendorListingRequest,
  paymentId: string,
): Promise<VendorListingRequest> {
  if (request.status === 'PAID') return request;
  const payment = await getPayment(paymentId);
  const valid =
    payment?.isPaid &&
    (payment.requestId === request.requestId || payment.buyerEmail === request.email.toLowerCase()) &&
    planForWhopPlanId(payment.whopPlanId) === request.plan;
  if (!payment || !valid) return request;
  // `null` means another path (the webhook) paid it first; the row is already PAID.
  return (await settlePayment(request.requestId, payment)) ?? { ...request, status: 'PAID' };
}

export type WhopVerification =
  | { outcome: 'paid' }
  /** `otherEmails`: paid payments for this plan made with a different email, so the admin can spot a mismatch. */
  | { outcome: 'unpaid'; otherEmails: string[] };

/** Asks Whop whether this request has been paid, and records it if so. */
export async function verifyWithWhop(request: VendorListingRequest): Promise<WhopVerification> {
  if (request.status === 'PAID') return { outcome: 'paid' };
  const { match, others } = await findPaidPayment({
    plan: request.plan,
    email: request.email,
    createdAt: request.createdAt,
    requestId: request.requestId,
  });
  if (!match) {
    return {
      outcome: 'unpaid',
      otherEmails: others.flatMap((payment) => (payment.buyerEmail ? [payment.buyerEmail] : [])),
    };
  }
  await settlePayment(request.requestId, match);
  return { outcome: 'paid' };
}
