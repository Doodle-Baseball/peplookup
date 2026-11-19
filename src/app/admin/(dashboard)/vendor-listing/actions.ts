'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import {
  deleteRequest,
  getRequest,
  markAllSeen,
  markPaymentVerified,
  reviewRequest,
} from '@/lib/vendor-listing/requests';
import { deletePaymentScreenshot } from '@/lib/vendor-listing/screenshots';

export interface RequestActionState {
  requestId: string;
  message: string;
  tone: 'ok' | 'info' | 'error';
}

/** The middleware already guards /admin, but these actions change payment and listing state, so they check the session themselves too. */
async function assertAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) throw new Error('Not signed in.');
}

function refresh() {
  // 'layout' so the sidebar badge, which lives in the layout, is recounted too.
  revalidatePath('/admin/vendor-listing', 'layout');
}

function failure(requestId: string, error: unknown, fallback: string): RequestActionState {
  console.error(`[vendor-listing] ${fallback}`, error);
  return { requestId, message: error instanceof Error ? error.message : fallback, tone: 'error' };
}

/** The admin has matched the screenshot to a payment received in the BTC wallet or PayPal account. */
export async function verifyRequestPayment(requestId: string): Promise<RequestActionState> {
  await assertAdmin();
  try {
    const updated = await markPaymentVerified(requestId);
    refresh();
    if (updated) return { requestId, message: 'Payment marked as verified.', tone: 'ok' };
    const request = await getRequest(requestId);
    if (!request) return { requestId, message: 'Request not found.', tone: 'error' };
    return { requestId, message: 'Nothing changed: this payment is already verified or the request was already reviewed.', tone: 'info' };
  } catch (error) {
    return failure(requestId, error, 'Could not verify the payment.');
  }
}

/** Approves a request whose payment is verified. It does not publish the supplier; that stays a separate step. */
export async function approveRequest(requestId: string): Promise<RequestActionState> {
  await assertAdmin();
  try {
    const updated = await reviewRequest(requestId, 'APPROVED');
    refresh();
    if (updated) return { requestId, message: 'Listing approved. Add the supplier to publish it.', tone: 'ok' };
    const request = await getRequest(requestId);
    if (!request) return { requestId, message: 'Request not found.', tone: 'error' };
    if (!request.paymentVerifiedAt) return { requestId, message: 'Verify the payment before approving.', tone: 'info' };
    return { requestId, message: 'This request was already reviewed.', tone: 'info' };
  } catch (error) {
    return failure(requestId, error, 'Could not approve the listing.');
  }
}

export async function rejectRequest(requestId: string): Promise<RequestActionState> {
  await assertAdmin();
  try {
    const updated = await reviewRequest(requestId, 'REJECTED');
    refresh();
    if (updated) return { requestId, message: 'Listing rejected.', tone: 'ok' };
    const request = await getRequest(requestId);
    if (!request) return { requestId, message: 'Request not found.', tone: 'error' };
    return { requestId, message: 'This request was already reviewed.', tone: 'info' };
  } catch (error) {
    return failure(requestId, error, 'Could not reject the listing.');
  }
}

export async function markRequestsSeen(): Promise<void> {
  await assertAdmin();
  await markAllSeen();
  refresh();
}

export async function deleteVendorRequest(requestId: string): Promise<RequestActionState> {
  await assertAdmin();
  try {
    const request = await getRequest(requestId);
    await deleteRequest(requestId);
    if (request?.paymentScreenshotPath) {
      // The row is gone either way; a screenshot left behind is logged rather than undoing the delete.
      await deletePaymentScreenshot(request.paymentScreenshotPath).catch((error: unknown) =>
        console.error('[vendor-listing] Screenshot of a deleted request could not be removed:', error),
      );
    }
    refresh();
    return { requestId, message: 'Request deleted.', tone: 'ok' };
  } catch (error) {
    return failure(requestId, error, 'Could not delete the request.');
  }
}
