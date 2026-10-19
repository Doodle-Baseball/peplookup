import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSuppliersFromDb } from '@/lib/supabase/suppliers';
import { fetchAllStoreDomains, isMissingMigrationError } from '@/lib/supabase/supplier-extension';
import { uninstallReasonSchema, type UninstallReason } from '@/lib/extension/schema';
import { AdminDbError } from '@/lib/admin/vendors';

export interface ClickTotals {
  extension: number;
  website: number;
}

export interface SupplierClickRow extends ClickTotals {
  slug: string;
  name: string;
}

export interface UninstallFeedbackRow {
  id: number;
  createdAt: string;
  reason: UninstallReason | null;
  details: string | null;
}

export interface FeedGap {
  slug: string;
  name: string;
  problem: string;
}

export interface ExtensionAdminSnapshot {
  migrationMissing: boolean;
  clicks: { last7Days: ClickTotals; last30Days: ClickTotals; allTime: ClickTotals };
  /** All-time clicks per supplier, most clicked first. */
  clicksBySupplier: SupplierClickRow[];
  feedback: UninstallFeedbackRow[];
  sharedDomains: { domain: string; suppliers: { slug: string; name: string }[] }[];
  /** Suppliers with an active coupon that the feed still leaves out, and why. */
  feedGaps: FeedGap[];
}

interface SummaryRow {
  supplier_slug: string;
  source: string;
  clicks: number | string;
}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) throw new AdminDbError('Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  return client;
}

function emptyTotals(): ClickTotals {
  return { extension: 0, website: 0 };
}

function totalsOf(rows: readonly SummaryRow[]): ClickTotals {
  const totals = emptyTotals();
  for (const row of rows) {
    if (row.source === 'extension' || row.source === 'website') totals[row.source] += Number(row.clicks);
  }
  return totals;
}

async function clickSummary(since: Date | null): Promise<SummaryRow[]> {
  const { data, error } = await requireClient().rpc('affiliate_clicks_summary', {
    since: since ? since.toISOString() : null,
  });
  if (error) throw new AdminDbError(error.message);
  return (data ?? []) as SummaryRow[];
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Everything /admin/extension shows, read live (no cache) so a click or answer appears on reload. */
export async function getExtensionAdminSnapshot(): Promise<ExtensionAdminSnapshot> {
  const client = requireClient();
  const [domainRows, suppliers, feedbackResult] = await Promise.all([
    fetchAllStoreDomains(client),
    fetchSuppliersFromDb(client, { includeInactive: true }),
    client
      .from('extension_uninstall_feedback')
      .select('id, created_at, reason, details')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  if (domainRows === null || isMissingMigrationError(feedbackResult.error)) {
    return {
      migrationMissing: true,
      clicks: { last7Days: emptyTotals(), last30Days: emptyTotals(), allTime: emptyTotals() },
      clicksBySupplier: [],
      feedback: [],
      sharedDomains: [],
      feedGaps: [],
    };
  }
  if (feedbackResult.error) throw new AdminDbError(feedbackResult.error.message);
  if (suppliers === null) throw new AdminDbError('The suppliers table could not be read.');

  const [week, month, allTime] = await Promise.all([
    clickSummary(daysAgo(7)),
    clickSummary(daysAgo(30)),
    clickSummary(null),
  ]);

  const names = new Map(suppliers.map((supplier) => [supplier.slug, supplier.name]));
  const bySupplier = new Map<string, SupplierClickRow>();
  for (const row of allTime) {
    const entry = bySupplier.get(row.supplier_slug) ?? {
      slug: row.supplier_slug,
      name: names.get(row.supplier_slug) ?? row.supplier_slug,
      ...emptyTotals(),
    };
    if (row.source === 'extension' || row.source === 'website') entry[row.source] += Number(row.clicks);
    bySupplier.set(row.supplier_slug, entry);
  }

  const suppliersByDomain = new Map<string, { slug: string; name: string }[]>();
  for (const row of domainRows) {
    for (const domain of row.domains) {
      suppliersByDomain.set(domain, [...(suppliersByDomain.get(domain) ?? []), { slug: row.slug, name: row.name }]);
    }
  }

  const settingsBySlug = new Map(domainRows.map((row) => [row.slug, row]));
  const feedGaps = suppliers.flatMap((supplier): FeedGap[] => {
    if (!supplier.isActive) return [];
    const settings = settingsBySlug.get(supplier.slug);
    const gap = (problem: string): FeedGap[] => [{ slug: supplier.slug, name: supplier.name, problem }];
    // Switched off on purpose; only worth listing when there is a coupon it is hiding.
    if (settings && !settings.showInExtension) return supplier.coupon ? gap('Show in extension is off') : [];
    if (!settings?.couponCode?.trim()) return gap('No code');
    if (settings.couponPercentOff === null) return gap('No discount %');
    if (settings.domains.length === 0) return gap('No store domains');
    return [];
  });

  return {
    migrationMissing: false,
    clicks: { last7Days: totalsOf(week), last30Days: totalsOf(month), allTime: totalsOf(allTime) },
    clicksBySupplier: [...bySupplier.values()].sort(
      (a, b) => b.extension + b.website - (a.extension + a.website) || a.name.localeCompare(b.name),
    ),
    feedback: (feedbackResult.data as { id: number; created_at: string; reason: string | null; details: string | null }[]).map(
      (row) => {
        const reason = uninstallReasonSchema.safeParse(row.reason);
        return { id: row.id, createdAt: row.created_at, reason: reason.success ? reason.data : null, details: row.details };
      },
    ),
    sharedDomains: [...suppliersByDomain.entries()]
      .filter(([, owners]) => owners.length > 1)
      .map(([domain, owners]) => ({ domain, suppliers: owners }))
      .sort((a, b) => a.domain.localeCompare(b.domain)),
    feedGaps: feedGaps.sort((a, b) => a.name.localeCompare(b.name)),
  };
}
