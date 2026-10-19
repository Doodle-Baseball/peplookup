import 'server-only';
import { randomUUID } from 'node:crypto';
import type { AffiliateClickSource } from '@/lib/extension/schema';

/** Same property the root layout's gtag snippet reports to. */
const GA_MEASUREMENT_ID = 'G-CTRYVJ794V';

/**
 * The client id gtag stored in the visitor's _ga cookie ("GA1.1.<id>.<time>"
 * becomes "<id>.<time>"), so a click joins that visitor's existing session.
 * A visitor GA has never seen gets a fresh random id.
 */
export function gaClientIdFromCookie(gaCookie: string | undefined): string {
  const match = gaCookie?.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
  return match?.[1] ?? randomUUID();
}

/**
 * Sends GA4's "affiliate_click" event from the server through the Measurement
 * Protocol. /go answers with a redirect, so there is no page for gtag to run
 * on. Needs GA4_API_SECRET (GA4 > Admin > Data streams > Measurement Protocol
 * API secrets); without it this does nothing, so the redirect never depends on it.
 */
export async function sendAffiliateClickEvent({
  clientId,
  supplierSlug,
  source,
}: {
  clientId: string;
  supplierSlug: string;
  source: AffiliateClickSource;
}): Promise<void> {
  const apiSecret = process.env.GA4_API_SECRET;
  if (!apiSecret) return;

  const url = new URL('https://www.google-analytics.com/mp/collect');
  url.searchParams.set('measurement_id', GA_MEASUREMENT_ID);
  url.searchParams.set('api_secret', apiSecret);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      events: [{ name: 'affiliate_click', params: { source, supplier: supplierSlug } }],
    }),
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error(`GA4 Measurement Protocol answered ${response.status}.`);
}
