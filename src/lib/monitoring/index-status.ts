import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getIndexDecisions } from '@/lib/seo';
import { listSitePages } from '@/lib/seo/site-pages';

/**
 * The daily snapshot of every page's indexing decision (seo_index_status,
 * 0031), so the weekly report can say which pages changed and why.
 */

export interface PageStatus {
  path: string;
  pageType: string;
  indexable: boolean;
  qualityPasses: boolean;
  /** Why it is noindex, else the quality rules it fails, else empty. */
  reasons: string[];
}

interface StatusRow {
  path: string;
  indexable: boolean;
  quality_passes: boolean;
  reasons: string[];
  indexable_changed_at: string | null;
  quality_changed_at: string | null;
}

export async function currentPageStatuses(): Promise<PageStatus[]> {
  const pages = await listSitePages();
  const decisions = await getIndexDecisions(pages.map((page) => page.path));
  return pages.map((page) => {
    const decision = decisions.get(page.path)!;
    return {
      path: page.path,
      pageType: page.type,
      indexable: decision.indexable,
      qualityPasses: decision.qualityFailures.length === 0,
      reasons: decision.indexable ? decision.qualityFailures : decision.reasons,
    };
  });
}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) throw new Error('Supabase is not configured: set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  return client;
}

/** Writes today's statuses, stamping when each page last changed state. Returns the pages that changed. */
export async function recordPageStatuses(statuses: readonly PageStatus[]): Promise<PageStatus[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('seo_index_status')
    .select('path, indexable, quality_passes, reasons, indexable_changed_at, quality_changed_at');
  if (error) throw new Error(`seo_index_status could not be read (run supabase/migrations/0031_seo_quality.sql): ${error.message}`);
  const previous = new Map(((data ?? []) as StatusRow[]).map((row) => [row.path, row]));

  const now = new Date().toISOString();
  const changed: PageStatus[] = [];
  const rows = statuses.map((status) => {
    const before = previous.get(status.path);
    const indexableChanged = before !== undefined && before.indexable !== status.indexable;
    const qualityChanged = before !== undefined && before.quality_passes !== status.qualityPasses;
    if (indexableChanged || qualityChanged) changed.push(status);
    return {
      path: status.path,
      page_type: status.pageType,
      indexable: status.indexable,
      quality_passes: status.qualityPasses,
      reasons: status.reasons,
      checked_at: now,
      indexable_changed_at: indexableChanged ? now : (before?.indexable_changed_at ?? null),
      quality_changed_at: qualityChanged ? now : (before?.quality_changed_at ?? null),
    };
  });
  const { error: writeError } = await client.from('seo_index_status').upsert(rows, { onConflict: 'path' });
  if (writeError) throw new Error(`seo_index_status could not be written: ${writeError.message}`);
  return changed;
}

/** Pages that became noindex, or started failing their quality rules, since `since`. */
export async function pagesThatWorsenedSince(since: Date): Promise<{ path: string; reasons: string[]; noindex: boolean }[]> {
  const { data, error } = await requireClient()
    .from('seo_index_status')
    .select('path, indexable, quality_passes, reasons, indexable_changed_at, quality_changed_at')
    .or(`indexable_changed_at.gte.${since.toISOString()},quality_changed_at.gte.${since.toISOString()}`);
  if (error) throw new Error(`seo_index_status could not be read: ${error.message}`);
  return ((data ?? []) as StatusRow[])
    .filter((row) => !row.indexable || !row.quality_passes)
    .map((row) => ({ path: row.path, reasons: row.reasons, noindex: !row.indexable }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
