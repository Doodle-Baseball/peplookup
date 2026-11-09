import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Renamed-page redirects (seo_redirects, 0010_seo_management.sql). Kept apart
 * from '@/lib/seo' because middleware imports this module, and middleware runs
 * on the Edge Runtime: it must not pull in the repository, the page-quality
 * checks or anything built on `unstable_cache`.
 */

/** Longest redirect chain followed before giving up, so a bad row can never loop. */
const MAX_REDIRECT_HOPS = 10;

export interface SeoRedirect {
  fromPath: string;
  toPath: string;
  createdAt: string;
}

/** Snake_case row in `seo_redirects`. */
export interface SeoRedirectRow {
  from_path: string;
  to_path: string;
  created_at: string;
}

export function rowToSeoRedirect(row: SeoRedirectRow): SeoRedirect {
  return { fromPath: row.from_path, toPath: row.to_path, createdAt: row.created_at };
}

export function followRedirects(path: string, redirects: readonly SeoRedirect[]): string {
  const targets = new Map(redirects.map((redirect) => [redirect.fromPath, redirect.toPath]));
  const seen = new Set([path]);
  let current = path;
  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
    const next = targets.get(current);
    if (!next || seen.has(next)) break;
    seen.add(next);
    current = next;
  }
  return current;
}

/** How long middleware reuses a redirect snapshot before querying again. */
const REDIRECT_TTL_MS = 60_000;

/**
 * Longest a redirect read may block a request. Middleware sits in front of
 * every product, supplier and guide page, so a hung Supabase must cost each
 * page this much at most, not the platform's 25s middleware limit (a 504).
 */
const REDIRECT_QUERY_TIMEOUT_MS = 2_000;

/**
 * After a failed read, how long to keep serving the previous snapshot before
 * trying again. Without it every request during an outage would wait out the
 * timeout above.
 */
const REDIRECT_RETRY_MS = 15_000;

/**
 * Last redirect read, held in module scope. A server instance keeps module
 * state between requests, so this is what stops the read below from running
 * per page view.
 */
let redirectSnapshot: { rows: SeoRedirect[]; expiresAt: number } | null = null;

/**
 * Drops the snapshot so the next request re-reads the table. Called after a
 * rename so the old URL starts redirecting at once rather than after the TTL,
 * which works whenever middleware shares a process with the admin action.
 */
export function clearRedirectCache(): void {
  redirectSnapshot = null;
}

/**
 * Reads `seo_redirects` directly, with no `unstable_cache` wrapper: this is
 * called from middleware, which runs on the Edge Runtime and has no
 * incremental cache to back `unstable_cache`, using it there throws on every
 * request.
 *
 * It is cached by hand instead. Middleware runs on every public request, so an
 * uncached read here is a blocking Supabase round trip (measured at 350ms+)
 * in front of every single page, including the statically prerendered ones,
 * and the table is usually empty. A short TTL brings that down to one query
 * per server instance per minute; the cost is that a slug renamed in
 * /admin/seo takes up to a minute before its old URL starts redirecting. The
 * new URL works immediately either way.
 */
async function fetchRedirectsUncached(): Promise<SeoRedirect[]> {
  const now = Date.now();
  if (redirectSnapshot && redirectSnapshot.expiresAt > now) return redirectSnapshot.rows;

  const client = getSupabaseServerClient();
  if (!client) return [];
  const { data, error } = await client
    .from('seo_redirects')
    .select('from_path, to_path, created_at')
    .abortSignal(AbortSignal.timeout(REDIRECT_QUERY_TIMEOUT_MS));
  // An unreachable or unmigrated table must not drop live redirects, so a
  // previous snapshot keeps serving until the next attempt succeeds.
  if (error) {
    console.warn('[seo] seo_redirects could not be read, retrying in 15s:', error.message);
    const rows = redirectSnapshot?.rows ?? [];
    redirectSnapshot = { rows, expiresAt: now + REDIRECT_RETRY_MS };
    return rows;
  }

  const rows = (data as SeoRedirectRow[]).map(rowToSeoRedirect);
  redirectSnapshot = { rows, expiresAt: now + REDIRECT_TTL_MS };
  return rows;
}

/**
 * Every earlier slug of each renamed supplier, keyed by its current slug.
 * A rename moves the row and everything stored against it, but data shipped
 * in code (e.g. the published COA links in src/data/vendor-coa-links.ts) is
 * still keyed by the slug it was written for, so lookups there must also try
 * the vendor's earlier slugs or a rename silently disconnects it.
 */
export function supplierSlugAliases(redirects: readonly SeoRedirect[]): Map<string, string[]> {
  const prefix = '/supplier/';
  const aliases = new Map<string, string[]>();
  for (const { fromPath } of redirects) {
    if (!fromPath.startsWith(prefix)) continue;
    const target = followRedirects(fromPath, redirects);
    if (target === fromPath || !target.startsWith(prefix)) continue;
    const current = target.slice(prefix.length);
    aliases.set(current, [...(aliases.get(current) ?? []), fromPath.slice(prefix.length)]);
  }
  return aliases;
}

export async function getSupplierSlugAliases(): Promise<Map<string, string[]>> {
  return supplierSlugAliases(await fetchRedirectsUncached());
}

/** Where a renamed page lives now, or null when this path was never renamed. */
export async function getRedirectTarget(path: string): Promise<string | null> {
  const redirects = await fetchRedirectsUncached();
  const target = followRedirects(path, redirects);
  return target === path ? null : target;
}
