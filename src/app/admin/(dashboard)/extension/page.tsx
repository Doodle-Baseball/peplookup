import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/page-header';
import { getExtensionAdminSnapshot, type ClickTotals, type ExtensionAdminSnapshot } from '@/lib/admin/extension';
import { UNINSTALL_REASONS } from '@/lib/extension/schema';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = { title: 'Chrome Extension | Admin', robots: { index: false, follow: false } };

// Clicks and uninstall answers arrive independently of any page render.
export const dynamic = 'force-dynamic';

const FEED_PATH = '/api/extension/coupons.json';
const PANEL_CLASS = 'rounded-card border border-line bg-surface-raised p-4 sm:p-6';
const REASON_LABELS = new Map(UNINSTALL_REASONS.map((reason) => [reason.value, reason.label]));

function ClickTotalsCard({ label, totals }: { label: string; totals: ClickTotals }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-micro font-bold uppercase tracking-wide text-faint">{label}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <dt className="text-xs text-muted">Extension</dt>
          <dd className="text-2xl font-black text-content">{totals.extension}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Website</dt>
          <dd className="text-2xl font-black text-content">{totals.website}</dd>
        </div>
      </dl>
    </div>
  );
}

function ClicksSection({ snapshot }: { snapshot: ExtensionAdminSnapshot }) {
  return (
    <section aria-labelledby="clicks-heading" className={PANEL_CLASS}>
      <h2 id="clicks-heading" className="text-sm font-black uppercase tracking-wide text-content">
        Affiliate clicks
      </h2>
      <p className="mt-1 text-xs text-muted">
        Website counts the site&rsquo;s supplier shop links (Shop Now, Visit Site, Continue); Extension counts the
        extension&rsquo;s offer links. Bots, link prefetches and a repeat click on the same supplier within 10 minutes
        aren&rsquo;t counted. Product links that open one product page aren&rsquo;t counted.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ClickTotalsCard label="Last 7 days" totals={snapshot.clicks.last7Days} />
        <ClickTotalsCard label="Last 30 days" totals={snapshot.clicks.last30Days} />
        <ClickTotalsCard label="All time" totals={snapshot.clicks.allTime} />
      </div>

      {snapshot.clicksBySupplier.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">
          No clicks recorded yet.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-96 text-left text-sm">
            <caption className="sr-only">All-time clicks per supplier</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                <th scope="col" className="py-2 pr-4 font-bold">Supplier</th>
                <th scope="col" className="py-2 pr-4 text-right font-bold">Extension</th>
                <th scope="col" className="py-2 text-right font-bold">Website</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.clicksBySupplier.map((row) => (
                <tr key={row.slug} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2 pr-4 font-semibold text-content">
                    {row.name}
                  </th>
                  <td className="py-2 pr-4 text-right tabular-nums text-content">{row.extension}</td>
                  <td className="py-2 text-right tabular-nums text-content">{row.website}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FeedSection({ snapshot }: { snapshot: ExtensionAdminSnapshot }) {
  return (
    <section aria-labelledby="feed-heading" className={PANEL_CLASS}>
      <h2 id="feed-heading" className="text-sm font-black uppercase tracking-wide text-content">
        Coupon feed
      </h2>
      <p className="mt-1 text-sm text-muted">
        The extension reads{' '}
        <a href={FEED_PATH} target="_blank" rel="noopener" className="font-bold text-brand hover:underline">
          {FEED_PATH}
        </a>
        . It updates within minutes of a supplier save.
      </p>

      <h3 className="mt-5 text-xs font-black uppercase tracking-wide text-faint">
        Active suppliers left out of the feed ({snapshot.feedGaps.length})
      </h3>
      {snapshot.feedGaps.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Every active supplier is in the feed.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {snapshot.feedGaps.map((gap) => (
            <li key={gap.slug}>
              <Link href={`/admin/vendors/${gap.slug}/edit`} className="font-bold text-brand hover:underline">
                {gap.name}
              </Link>{' '}
              <span className="text-muted">· {gap.problem}</span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-5 text-xs font-black uppercase tracking-wide text-faint">Domains used by more than one supplier</h3>
      {snapshot.sharedDomains.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No shared domains.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {snapshot.sharedDomains.map((shared) => (
            <li key={shared.domain}>
              <span className="font-mono font-bold text-warn">{shared.domain}</span>{' '}
              <span className="text-muted">·</span>{' '}
              {shared.suppliers.map((supplier, index) => (
                <span key={supplier.slug}>
                  {index > 0 ? ', ' : null}
                  <Link href={`/admin/vendors/${supplier.slug}/edit`} className="font-bold text-brand hover:underline">
                    {supplier.name}
                  </Link>
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FeedbackSection({ snapshot }: { snapshot: ExtensionAdminSnapshot }) {
  return (
    <section aria-labelledby="feedback-heading" className={PANEL_CLASS}>
      <h2 id="feedback-heading" className="text-sm font-black uppercase tracking-wide text-content">
        Uninstall answers ({snapshot.feedback.length})
      </h2>
      <p className="mt-1 text-xs text-muted">From the optional form on /extension/uninstalled. Newest first.</p>
      {snapshot.feedback.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">
          No answers yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {snapshot.feedback.map((row) => (
            <li key={row.id} className="rounded-card border border-line bg-surface p-3">
              <p className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-bold text-content">
                  {row.reason ? REASON_LABELS.get(row.reason) : 'No reason picked'}
                </span>
                <span className="text-xs text-faint">{formatDateTime(row.createdAt)}</span>
              </p>
              {row.details ? <p className="mt-1 whitespace-pre-line text-sm text-muted">{row.details}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminExtensionPage() {
  let snapshot: ExtensionAdminSnapshot | null = null;
  let loadError: string | null = null;
  try {
    snapshot = await getExtensionAdminSnapshot();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Extension data could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Chrome Extension" />
      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {loadError ? (
          <p role="alert" className="rounded-card border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
            {loadError}
          </p>
        ) : null}
        {snapshot?.migrationMissing ? (
          <p role="alert" className="rounded-card border border-warn/30 bg-warn/10 p-4 text-sm font-semibold text-content">
            Run <code className="font-mono">supabase/migrations/0029_chrome_extension.sql</code> in the Supabase SQL
            editor to turn on the extension feed, click counts and uninstall answers.
          </p>
        ) : null}
        {snapshot && !snapshot.migrationMissing ? (
          <>
            <FeedSection snapshot={snapshot} />
            <ClicksSection snapshot={snapshot} />
            <FeedbackSection snapshot={snapshot} />
          </>
        ) : null}
      </div>
    </>
  );
}
