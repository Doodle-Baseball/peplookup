import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Whop signs webhooks per the Standard Webhooks spec: HMAC-SHA256 over
 * `${webhook-id}.${webhook-timestamp}.${raw body}`, base64-encoded, sent as
 * `v1,<signature>` (several space-separated signatures during key rotation).
 *
 * Whop documents the secret as an opaque `ws_…` string; the reference SDK
 * feeds it to the HMAC as-is. The Standard Webhooks default (a base64 secret)
 * decodes it first. Accepting either keeps this working without having to
 * guess which one a given Whop API version uses, and a wrong secret fails
 * both just the same.
 */

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

export interface WebhookHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export type WebhookVerification = { ok: true } | { ok: false; reason: string };

function candidateKeys(secret: string): Buffer[] {
  const keys = [Buffer.from(secret, 'utf8')];
  const stripped = secret.replace(/^(whsec_|ws_)/, '');
  const decoded = Buffer.from(stripped, 'base64');
  if (decoded.length > 0) keys.push(decoded);
  return keys;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyWebhookSignature(
  rawBody: string,
  headers: WebhookHeaders,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): WebhookVerification {
  if (!headers.id || !headers.timestamp || !headers.signature) {
    return { ok: false, reason: 'Missing webhook headers.' };
  }

  const sentAt = Number(headers.timestamp);
  if (!Number.isFinite(sentAt)) return { ok: false, reason: 'Invalid webhook timestamp.' };
  // Stops a captured request from being replayed later.
  if (Math.abs(nowSeconds - sentAt) > MAX_CLOCK_SKEW_SECONDS) {
    return { ok: false, reason: 'Webhook timestamp is outside the allowed window.' };
  }

  const signedContent = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const provided = headers.signature
    .split(' ')
    .map((part) => part.split(',', 2))
    .filter((pair): pair is [string, string] => pair.length === 2 && pair[0] === 'v1')
    .map(([, signature]) => signature);

  const matches = candidateKeys(secret).some((key) => {
    const expected = createHmac('sha256', key).update(signedContent).digest('base64');
    return provided.some((signature) => safeEqual(signature, expected));
  });

  return matches ? { ok: true } : { ok: false, reason: 'Signature does not match.' };
}
