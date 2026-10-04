import { NextResponse } from 'next/server';
import { z } from 'zod';
import { settlePayment } from '@/lib/vendor-listing/payment';
import { findPendingRequestByEmail, getRequest } from '@/lib/vendor-listing/requests';
import { verifyWebhookSignature } from '@/lib/vendor-listing/webhook-signature';
import { parseWhopPayment, planForWhopPlanId } from '@/lib/vendor-listing/whop';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({ type: z.string(), data: z.unknown() });

/**
 * Whop → PepLookup payment notifications. The body is read raw because the
 * signature covers the exact bytes Whop sent; re-serialising parsed JSON
 * would change them and every valid webhook would fail verification.
 */
export async function POST(request: Request) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[whop-webhook] WHOP_WEBHOOK_SECRET is not set; refusing to process webhooks.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const verification = verifyWebhookSignature(
    rawBody,
    {
      id: request.headers.get('webhook-id'),
      timestamp: request.headers.get('webhook-timestamp'),
      signature: request.headers.get('webhook-signature'),
    },
    secret,
  );
  if (!verification.ok) {
    return NextResponse.json({ error: verification.reason }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const event = eventSchema.safeParse(json);
  if (!event.success) return NextResponse.json({ error: 'Unexpected payload.' }, { status: 400 });

  // Anything else (membership events, failures) is acknowledged so Whop does not retry it.
  if (event.data.type !== 'payment.succeeded') return NextResponse.json({ received: true });

  const payment = parseWhopPayment(event.data.data);
  if (!payment) return NextResponse.json({ error: 'Unrecognised payment.' }, { status: 400 });

  try {
    // A payment for some other plan on the same Whop account is not ours.
    const plan = planForWhopPlanId(payment.whopPlanId);
    if (!plan) return NextResponse.json({ received: true, matched: false });

    // Our own checkout puts the request id on the payment, which is exact.
    // Failing that, the buyer's email is the match; if it differs from the
    // one on the form, the request stays pending and the admin can confirm
    // it by hand.
    const byRequestId = payment.requestId ? await getRequest(payment.requestId) : null;
    const match =
      byRequestId?.plan === plan
        ? byRequestId
        : payment.buyerEmail
          ? await findPendingRequestByEmail(payment.buyerEmail, plan)
          : null;
    if (!match) {
      console.warn(`[whop-webhook] Payment ${payment.paymentId} did not match a pending vendor request.`);
      return NextResponse.json({ received: true, matched: false });
    }

    await settlePayment(match.requestId, { ...payment, isPaid: true });
    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error('[whop-webhook] Failed to record payment:', error);
    // 500 makes Whop retry, which is what we want for a transient database failure.
    return NextResponse.json({ error: 'Could not record payment.' }, { status: 500 });
  }
}
