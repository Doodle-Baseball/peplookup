import { NextResponse } from 'next/server';

/**
 * A watchlist holds a handful of saved items, so this is far above any real
 * caller while still bounding the work a single request can ask for.
 */
export const MAX_SLUGS = 50;

/**
 * Null means the caller did not send a usable `slugs` list and the route
 * should reject rather than fall back to returning everything.
 */
export function parseSlugsParam(raw: string | null): Set<string> | null {
  if (!raw) return null;
  const slugs = raw.split(',').filter(Boolean).slice(0, MAX_SLUGS);
  return slugs.length > 0 ? new Set(slugs) : null;
}

/**
 * Catalogue data changes when a vendor is edited, not per visitor, so letting
 * the CDN answer repeat requests keeps identical reads off the origin. Serving
 * stale while revalidating means a bot storm costs one origin render rather
 * than one per request.
 */
export function publicJson(payload: unknown): NextResponse {
  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  });
}
