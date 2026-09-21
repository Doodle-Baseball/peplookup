import 'server-only';
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { parseNamedMetaTags } from '@/lib/seo-html';

/** Revalidated by every save in /admin/seo. */
export const SEO_CACHE_TAG = 'seo';

/** Manual workflow status, set from the SEO edit dialog. Unset until chosen. */
export type SeoTaskStatus = 'needs-work' | 'pending' | 'done';

/** Longest redirect chain followed before giving up, so a bad row can never loop. */
const MAX_REDIRECT_HOPS = 10;

export interface SeoOverride {
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  headHtml: string | null;
  bodyHtml: string | null;
  taskStatus: SeoTaskStatus | null;
  updatedAt: string;
}

export interface SeoRedirect {
  fromPath: string;
  toPath: string;
  createdAt: string;
}

/** Snake_case row in `seo_pages` (0010_seo_management.sql). */
export interface SeoPageRow {
  path: string;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  keywords: string[] | null;
  canonical_url: string | null;
  og_image_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  head_html: string | null;
  body_html: string | null;
  task_status: string | null;
  updated_at: string;
}

interface SeoRedirectRow {
  from_path: string;
  to_path: string;
  created_at: string;
}

const TASK_STATUSES: readonly SeoTaskStatus[] = ['needs-work', 'pending', 'done'];

function toTaskStatus(value: string | null): SeoTaskStatus | null {
  return TASK_STATUSES.includes(value as SeoTaskStatus) ? (value as SeoTaskStatus) : null;
}

export function rowToSeoOverride(row: SeoPageRow): SeoOverride {
  return {
    path: row.path,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    h1: row.h1,
    keywords: row.keywords ?? [],
    canonicalUrl: row.canonical_url,
    ogImageUrl: row.og_image_url,
    robotsIndex: row.robots_index,
    robotsFollow: row.robots_follow,
    headHtml: row.head_html,
    bodyHtml: row.body_html,
    taskStatus: toTaskStatus(row.task_status),
    updatedAt: row.updated_at,
  };
}

export function rowToSeoRedirect(row: SeoRedirectRow): SeoRedirect {
  return { fromPath: row.from_path, toPath: row.to_path, createdAt: row.created_at };
}

interface SeoData {
  pages: SeoOverride[];
  redirects: SeoRedirect[];
}

/** A failure to reach Supabase at all, as opposed to the query itself being rejected. */
class SeoNetworkError extends Error {}

/**
 * Last successful read, held in module scope so it survives between requests
 * in a server process. Lets a transient Supabase blip serve real overrides
 * rather than failing the read outright.
 */
let lastGoodSeoData: SeoData | null = null;

function isNetworkFailure(message: string): boolean {
  return /fetch failed|network|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|socket/i.test(message);
}

/**
 * Every override and redirect in two small queries, cached for the whole site.
 * Pages look up their own row from this rather than querying per request.
 */
const getSeoDataCached = unstable_cache(
  async (): Promise<SeoData> => {
    const client = getSupabaseServerClient();
    if (!client) return { pages: [], redirects: [] };

    const [pages, redirects] = await Promise.all([
      client.from('seo_pages').select('*'),
      client.from('seo_redirects').select('from_path, to_path, created_at'),
    ]);

    // A dropped connection must not be cached as "no overrides": that would
    // silently strip every SEO override from the site until the cache next
    // revalidated. Serving the last good snapshot keeps the data correct and,
    // unlike throwing, doesn't surface a request-level error for what is a
    // recoverable blip. Before any successful read there is nothing safe to
    // serve, so that case still throws and getSeoData() falls back below.
    const networkFailure = [pages, redirects]
      .map((result) => result.error)
      .find((error) => error && isNetworkFailure(error.message));
    if (networkFailure) {
      if (lastGoodSeoData) {
        console.warn('[seo] Supabase unreachable, serving last known overrides:', networkFailure.message);
        return lastGoodSeoData;
      }
      throw new SeoNetworkError(networkFailure.message);
    }

    // Before 0010_seo_management.sql has run both tables are missing. Pages
    // must keep rendering with their defaults, so this degrades to "no
    // overrides" and says why in the server log.
    if (pages.error) console.warn('[seo] seo_pages could not be read:', pages.error.message);
    if (redirects.error) console.warn('[seo] seo_redirects could not be read:', redirects.error.message);

    const data: SeoData = {
      pages: pages.error ? [] : ((pages.data ?? []) as SeoPageRow[]).map(rowToSeoOverride),
      redirects: redirects.error ? [] : ((redirects.data ?? []) as SeoRedirectRow[]).map(rowToSeoRedirect),
    };
    lastGoodSeoData = data;
    return data;
  },
  ['seo-data'],
  { revalidate: 300, tags: [SEO_CACHE_TAG] },
);

/**
 * The cached SEO data, retried once on a network blip. If Supabase still can't
 * be reached the page renders with its default SEO for this request only; the
 * next request tries again rather than inheriting a cached failure.
 */
async function getSeoData(): Promise<SeoData> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await getSeoDataCached();
    } catch (error) {
      if (!(error instanceof SeoNetworkError)) throw error;
      if (attempt >= 2) {
        console.warn('[seo] Supabase unreachable, using default SEO for this request:', error.message);
        return { pages: [], redirects: [] };
      }
    }
  }
}

export async function getSeoOverride(path: string): Promise<SeoOverride | null> {
  const { pages } = await getSeoData();
  return pages.find((page) => page.path === path) ?? null;
}

function followRedirects(path: string, redirects: readonly SeoRedirect[]): string {
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
  const { data, error } = await client.from('seo_redirects').select('from_path, to_path, created_at');
  // An unreachable or unmigrated table must not drop live redirects, so a
  // previous snapshot keeps serving until the next attempt succeeds.
  if (error) return redirectSnapshot?.rows ?? [];

  const rows = (data as SeoRedirectRow[]).map(rowToSeoRedirect);
  redirectSnapshot = { rows, expiresAt: now + REDIRECT_TTL_MS };
  return rows;
}

/** Where a renamed page lives now, or null when this path was never renamed. */
export async function getRedirectTarget(path: string): Promise<string | null> {
  const redirects = await fetchRedirectsUncached();
  const target = followRedirects(path, redirects);
  return target === path ? null : target;
}

/**
 * Rewrites hard-coded internal links (nav menus, featured quick links) to a
 * renamed page's current address, so they never point at an old slug.
 */
export async function getHrefResolver(): Promise<(href: string) => string> {
  const { redirects } = await getSeoData();
  if (redirects.length === 0) return (href) => href;
  return (href) => {
    if (!href.startsWith('/')) return href;
    const suffixAt = href.search(/[?#]/);
    const pathname = suffixAt === -1 ? href : href.slice(0, suffixAt);
    const suffix = suffixAt === -1 ? '' : href.slice(suffixAt);
    return followRedirects(pathname, redirects) + suffix;
  };
}

function titleText(title: Metadata['title']): string | undefined {
  if (!title) return undefined;
  if (typeof title === 'string') return title;
  if ('absolute' in title) return title.absolute;
  return title.default;
}

/**
 * Layers a page's /admin/seo override (if any) on top of its default
 * metadata. A page nobody has edited gets exactly its defaults back.
 */
export async function withSeo(path: string, base: Metadata): Promise<Metadata> {
  const seo = await getSeoOverride(path);
  if (!seo) return base;

  const title = seo.metaTitle ? { absolute: seo.metaTitle } : base.title;
  const description = seo.metaDescription ?? base.description;
  const canonical = seo.canonicalUrl ?? base.alternates?.canonical;
  const socialTitle = titleText(title);

  return {
    ...base,
    title,
    description,
    keywords: seo.keywords.length > 0 ? seo.keywords : base.keywords,
    alternates: { ...base.alternates, canonical },
    robots: seo.robotsIndex && seo.robotsFollow ? base.robots : { index: seo.robotsIndex, follow: seo.robotsFollow },
    openGraph: {
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      ...(typeof canonical === 'string' ? { url: canonical } : {}),
      ...(seo.ogImageUrl ? { images: [seo.ogImageUrl] } : {}),
    },
    other: { ...base.other, ...(seo.headHtml ? parseNamedMetaTags(seo.headHtml) : {}) },
  };
}

export interface SeoInjection {
  headHtml: string | null;
  bodyHtml: string | null;
}

/** Custom head/body HTML by path, only for pages that actually have some. */
export async function getSeoInjections(): Promise<Record<string, SeoInjection>> {
  const { pages } = await getSeoData();
  return Object.fromEntries(
    pages
      .filter((page) => page.headHtml || page.bodyHtml)
      .map((page) => [page.path, { headHtml: page.headHtml, bodyHtml: page.bodyHtml }]),
  );
}
