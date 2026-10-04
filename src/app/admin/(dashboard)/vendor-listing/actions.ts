'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { settlePayment, verifyWithWhop } from '@/lib/vendor-listing/payment';
import { findPaidPayment } from '@/lib/vendor-listing/whop';
import { deleteRequest, getRequest, markAllSeen } from '@/lib/vendor-listing/requests';

export interface VerifyPaymentState {
  requestId: string;
  message: string;
  tone: 'ok' | 'info' | 'error';
}

/** The middleware already guards /admin, but these actions change payment state, so they check the session themselves too. */
async function assertAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) throw new Error('Not signed in.');
}

function refresh() {
  // 'layout' so the sidebar badge, which lives in the layout, is recounted too.
  revalidatePath('/admin/vendor-listing', 'layout');
}

export async function verifyRequestPayment(requestId: string): Promise<VerifyPaymentState> {
  await assertAdmin();
  try {
    const request = await getRequest(requestId);
    if (!request) return { requestId, message: 'Request not found.', tone: 'error' };
    if (request.status === 'PAID') {
      // Read-only re-check: the status is left as it is, this only reports
      // whether Whop itself can still see the payment.
      const { match } = await findPaidPayment({
        plan: request.plan,
        email: request.email,
        createdAt: request.createdAt,
        requestId: request.requestId,
      });
      return match
        ? { requestId, message: 'Confirmed by Whop.', tone: 'ok' }
        : {
            requestId,
            message:
              'Marked as paid, but Whop shows no payment from this email. Expected if it was marked paid by hand or the buyer used a different email.',
            tone: 'info',
          };
    }

    const verification = await verifyWithWhop(request);
    if (verification.outcome === 'paid') {
      refresh();
      return { requestId, message: 'Payment confirmed by Whop. Emails sent.', tone: 'ok' };
    }
    const others = [...new Set(verification.otherEmails)];
    return {
      requestId,
      message:
        others.length === 0
          ? `Whop has no completed ${request.plan} payment since this request was made.`
          : `No payment from ${request.email}. Whop does show paid ${request.plan} payments from: ${others.join(', ')}. If one of those is this applicant, use "Mark as paid".`,
      tone: 'info',
    };
  } catch (error) {
    console.error('[vendor-listing] Admin payment verification failed:', error);
    return {
      requestId,
      message: error instanceof Error ? error.message : 'Could not reach Whop.',
      tone: 'error',
    };
  }
}

export async function markRequestsSeen(): Promise<void> {
  await assertAdmin();
  await markAllSeen();
  refresh();
}

/**
 * Escape hatch for a payment Whop shows as paid but that could not be matched
 * automatically, typically because the buyer used a different email at
 * checkout than on the form. The admin has seen the payment in Whop first.
 */
export async function markRequestPaidManually(requestId: string): Promise<VerifyPaymentState> {
  await assertAdmin();
  try {
    const request = await getRequest(requestId);
    if (!request) return { requestId, message: 'Request not found.', tone: 'error' };
    const settled = await settlePayment(requestId, {
      paymentId: 'manual',
      isPaid: true,
      paidAt: null,
      buyerEmail: null,
      whopPlanId: null,
      requestId: null,
    });
    refresh();
    return settled
      ? { requestId, message: 'Marked as paid. Emails sent.', tone: 'ok' }
      : { requestId, message: 'Already marked as paid.', tone: 'ok' };
  } catch (error) {
    console.error('[vendor-listing] Manual mark-as-paid failed:', error);
    return { requestId, message: error instanceof Error ? error.message : 'Could not update the request.', tone: 'error' };
  }
}

export async function deleteVendorRequest(requestId: string): Promise<VerifyPaymentState> {
  await assertAdmin();
  try {
    await deleteRequest(requestId);
    refresh();
    return { requestId, message: 'Request deleted.', tone: 'ok' };
  } catch (error) {
    console.error('[vendor-listing] Delete failed:', error);
    return { requestId, message: error instanceof Error ? error.message : 'Could not delete the request.', tone: 'error' };
  }
}
