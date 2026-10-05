import { NextResponse } from 'next/server';
import { outboundClickPayloadSchema } from '@/lib/traffic/outbound';
import { recordOutboundClick } from '@/lib/traffic/store';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_CLICKS_PER_WINDOW = 60;
const MAX_TRACKED_CLIENTS = 5_000;

const recentByClient = new Map<string, { windowStart: number; count: number }>();

/**
 * Best-effort, per server instance: this is a public write endpoint, so it
 * caps how fast one client can fill the table, without trying to be a real
 * rate limiter across instances.
 */
function isThrottled(clientKey: string): boolean {
  const now = Date.now();
  if (recentByClient.size > MAX_TRACKED_CLIENTS) recentByClient.clear();
  const entry = recentByClient.get(clientKey);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    recentByClient.set(clientKey, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_CLICKS_PER_WINDOW;
}

/**
 * Receives the beacon the browser sends as a visitor leaves for another
 * website. The body is read as text because sendBeacon posts it as text/plain
 * (a simple request, so no CORS preflight can delay it while the page unloads).
 * Always answers 204: the visitor is already on their way out and has nothing
 * to do with a failure here.
 */
export async function POST(request: Request) {
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isThrottled(clientKey)) return new NextResponse(null, { status: 204 });

  try {
    const payload = outboundClickPayloadSchema.safeParse(JSON.parse(await request.text()));
    if (!payload.success) return new NextResponse(null, { status: 400 });
    await recordOutboundClick(payload.data);
  } catch (error) {
    console.error('[traffic] could not record outbound click:', error);
  }
  return new NextResponse(null, { status: 204 });
}
