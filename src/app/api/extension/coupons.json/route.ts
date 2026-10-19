import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getExtensionFeed } from '@/lib/extension/store';
import { ExtensionMigrationMissingError } from '@/lib/supabase/supplier-extension';

const CORS_HEADERS = {
  // The extension reads this from its own chrome-extension:// origin.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'If-None-Match',
  'Access-Control-Expose-Headers': 'ETag',
} as const;

const CACHE_HEADERS = {
  // Browsers and the extension keep a copy for 15 minutes.
  'Cache-Control': 'public, max-age=900',
  // Vercel's CDN answers repeat requests for 5 minutes and keeps serving the last
  // copy while it refreshes, so the feed stays up when the origin is slow. An
  // admin edit reaches the CDN within those 5 minutes. Vercel strips this header
  // before the response reaches the browser.
  'Vercel-CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
} as const;

function etagFor(body: string): string {
  return `"${createHash('sha1').update(body).digest('base64url')}"`;
}

/** If-None-Match may list several tags, weak or strong, or be "*". */
function matchesEtag(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  return ifNoneMatch
    .split(',')
    .map((tag) => tag.trim().replace(/^W\//, ''))
    .some((tag) => tag === '*' || tag === etag);
}

/**
 * Public coupon feed for the PepLookup Chrome extension. Read-only, no login,
 * and holds nothing that /coupons doesn't already show (see buildExtensionFeed).
 */
export async function GET(request: NextRequest) {
  let body: string;
  try {
    body = JSON.stringify(await getExtensionFeed());
  } catch (error) {
    // Logged in full for us; the public answer names no internals.
    console.error('[extension-feed] could not build the feed:', error);
    const message =
      error instanceof ExtensionMigrationMissingError ? 'Feed not set up yet.' : 'Feed temporarily unavailable.';
    return NextResponse.json(
      { error: message },
      { status: 503, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store', 'Retry-After': '300' } },
    );
  }

  const etag = etagFor(body);
  const headers = { ...CORS_HEADERS, ...CACHE_HEADERS, ETag: etag };

  if (matchesEtag(request.headers.get('if-none-match'), etag)) {
    return new NextResponse(null, { status: 304, headers });
  }

  return new NextResponse(body, {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { ...CORS_HEADERS, 'Access-Control-Max-Age': '86400' } });
}
