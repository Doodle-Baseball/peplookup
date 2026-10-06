import 'server-only';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  MAX_PATH_LENGTH,
  MAX_URL_LENGTH,
  buildVendorHostIndex,
  isOwnHost,
  normalizeHost,
} from '@/lib/traffic/outbound';
import { sinceForRange, type TrafficRange, type TrafficSnapshot } from '@/lib/traffic/snapshot';

export class TrafficDbError extends Error {}

const MISSING_TABLE_HINT =
  'The outbound_clicks table is not there yet. Run supabase/migrations/0022_outbound_clicks.sql in the Supabase SQL editor first.';

const RECENT_LIMIT = 50;
const VENDOR_INDEX_TTL_MS = 5 * 60_000;

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new TrafficDbError('Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  return client;
}

function fail(error: { code?: string; message: string }): never {
  // 42P01 = undefined_table, 42883 = undefined_function, PGRST205/PGRST202 = PostgREST "not in schema cache".
  if (['42P01', '42883', 'PGRST205', 'PGRST202'].includes(error.code ?? '')) throw new TrafficDbError(MISSING_TABLE_HINT);
  throw new TrafficDbError(error.message);
}

const supplierHostRowSchema = z.object({
  slug: z.string(),
  name: z.string(),
  homepage_url: z.string().nullable(),
  affiliate_url: z.string().nullable(),
});

type VendorIndex = ReturnType<typeof buildVendorHostIndex>;
let vendorIndexCache: { index: VendorIndex; loadedAt: number } | null = null;
let vendorIndexLoad: Promise<VendorIndex> | null = null;

/**
 * Held in module memory (not unstable_cache): every click would otherwise cost
 * a suppliers query, and vendors change rarely enough that a few minutes of
 * staleness only means a brand-new vendor is attributed a little late.
 *
 * Clicks that arrive while the index is being read (a cold start, or the
 * moment it expires) share that one read instead of each issuing their own.
 */
async function vendorIndex(): Promise<VendorIndex> {
  if (vendorIndexCache && Date.now() - vendorIndexCache.loadedAt < VENDOR_INDEX_TTL_MS) return vendorIndexCache.index;
  vendorIndexLoad ??= loadVendorIndex().finally(() => {
    vendorIndexLoad = null;
  });
  return vendorIndexLoad;
}

async function loadVendorIndex(): Promise<VendorIndex> {
  const { data, error } = await requireClient().from('suppliers').select('slug, name, homepage_url, affiliate_url');
  if (error) {
    // Attribution is best-effort: keep serving the last index, or record the click unattributed.
    console.error('[traffic] could not load suppliers for attribution:', error.message);
    return vendorIndexCache?.index ?? new Map();
  }
  const index = buildVendorHostIndex(
    (data ?? []).flatMap((row) => {
      const parsed = supplierHostRowSchema.safeParse(row);
      if (!parsed.success) return [];
      const { slug, name, homepage_url, affiliate_url } = parsed.data;
      return [{ slug, name, urls: [homepage_url, affiliate_url].filter((u): u is string => Boolean(u)) }];
    }),
  );
  vendorIndexCache = { index, loadedAt: Date.now() };
  return index;
}

/** Records one outbound click. Returns false when the URL isn't a recordable external link. */
export async function recordOutboundClick(input: { url: string; path?: string }): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  const host = normalizeHost(parsed.hostname);
  if (!host || isOwnHost(host)) return false;

  const vendor = (await vendorIndex()).get(host) ?? null;
  const { error } = await requireClient()
    .from('outbound_clicks')
    .insert({
      url: parsed.href.slice(0, MAX_URL_LENGTH),
      host,
      vendor_slug: vendor?.slug ?? null,
      vendor_name: vendor?.name ?? null,
      source_path: input.path ? input.path.slice(0, MAX_PATH_LENGTH) : null,
    });
  if (error) fail(error);
  return true;
}

const hostRowSchema = z.object({
  host: z.string(),
  vendor_slug: z.string().nullable(),
  vendor_name: z.string().nullable(),
  clicks: z.coerce.number(),
  last_clicked_at: z.string(),
});

const urlRowSchema = z.object({
  url: z.string(),
  host: z.string(),
  vendor_name: z.string().nullable(),
  clicks: z.coerce.number(),
  last_clicked_at: z.string(),
});

const recentRowSchema = z.object({
  id: z.coerce.number(),
  clicked_at: z.string(),
  url: z.string(),
  host: z.string(),
  vendor_name: z.string().nullable(),
  source_path: z.string().nullable(),
});

export async function getTrafficSnapshot(range: TrafficRange): Promise<TrafficSnapshot> {
  const client = requireClient();
  const since = sinceForRange(range);
  const lastHour = new Date(Date.now() - 3_600_000).toISOString();

  let total = client.from('outbound_clicks').select('id', { count: 'exact', head: true });
  if (since) total = total.gte('clicked_at', since);

  const [totalResult, hourResult, hostsResult, urlsResult, recentResult] = await Promise.all([
    total,
    client.from('outbound_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', lastHour),
    client.rpc('outbound_clicks_by_host', { since }),
    client.rpc('outbound_clicks_by_url', { since }),
    client
      .from('outbound_clicks')
      .select('id, clicked_at, url, host, vendor_name, source_path')
      .order('id', { ascending: false })
      .limit(RECENT_LIMIT),
  ]);
  for (const result of [totalResult, hourResult, hostsResult, urlsResult, recentResult]) {
    if (result.error) fail(result.error);
  }

  return {
    generatedAt: new Date().toISOString(),
    range,
    totalClicks: totalResult.count ?? 0,
    clicksLastHour: hourResult.count ?? 0,
    destinations: z
      .array(hostRowSchema)
      .parse(hostsResult.data ?? [])
      .map((row) => ({
        host: row.host,
        vendorSlug: row.vendor_slug,
        vendorName: row.vendor_name,
        clicks: row.clicks,
        lastClickedAt: row.last_clicked_at,
      })),
    links: z
      .array(urlRowSchema)
      .parse(urlsResult.data ?? [])
      .map((row) => ({
        url: row.url,
        host: row.host,
        vendorName: row.vendor_name,
        clicks: row.clicks,
        lastClickedAt: row.last_clicked_at,
      })),
    recent: z
      .array(recentRowSchema)
      .parse(recentResult.data ?? [])
      .map((row) => ({
        id: row.id,
        clickedAt: row.clicked_at,
        url: row.url,
        host: row.host,
        vendorName: row.vendor_name,
        sourcePath: row.source_path,
      })),
  };
}
