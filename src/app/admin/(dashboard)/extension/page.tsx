import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/page-header';
import { getExtensionAdminSnapshot, type ExtensionAdminSnapshot } from '@/lib/admin/extension';

export const metadata: Metadata = { title: 'Chrome Extension | Admin', robots: { index: false, follow: false } };

// Clicks and uninstall answers arrive independently of any page render.
export const dynamic = 'force-dynamic';

const FEED_PATH = '/api/extension/coupons.json';
const PANEL_CLASS = 'rounded-card border border-line bg-surface-raised p-4 sm:p-6';

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
          </>
        ) : null}
      </div>
    </>
  );
}
