import type { Metadata } from 'next';
import Link from 'next/link';
import { listGuides, type AdminGuide } from '@/lib/admin/guides';
import { formatDate } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/page-header';
import { GuideDeleteButton } from '@/components/admin/guide-delete-button';
import { GuideDuplicateButton } from '@/components/admin/guide-duplicate-button';
import { GuidePublishToggle } from '@/components/admin/guide-publish-toggle';
import { ExternalIcon, InfoIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

export const metadata: Metadata = { title: 'Guides | Admin', robots: { index: false, follow: false } };

// Guides change on every save; never serve a build-time snapshot.
export const dynamic = 'force-dynamic';

type StatusFilter = 'all' | 'published' | 'draft';

function readParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function readStatus(value: string): StatusFilter {
  return value === 'published' || value === 'draft' ? value : 'all';
}

/** Built-in guides have no is_published column and are always live. */
function isLive(guide: AdminGuide): boolean {
  return guide.isPublished ?? true;
}

const FILTER_INPUT_CLASS =
  'mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors';

export default async function AdminGuidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = readParam(params.q);
  const categoryFilter = readParam(params.category);
  const statusFilter = readStatus(readParam(params.status));

  let guides: AdminGuide[] = [];
  let loadError: string | null = null;
  try {
    guides = await listGuides();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Guides could not be loaded.';
  }

  const categories = [...new Set(guides.map((guide) => guide.category))].sort((a, b) => a.localeCompare(b));
  const totalSections = guides.reduce((sum, guide) => sum + guide.sections.length, 0);
  const stats = [
    { label: 'Guides', value: guides.length },
    { label: 'Topics covered', value: categories.length },
    { label: 'Sections written', value: totalSections },
  ];

  const needle = query.toLowerCase();
  const visible = guides.filter(
    (guide) =>
      (!needle || guide.title.toLowerCase().includes(needle)) &&
      (!categoryFilter || guide.category === categoryFilter) &&
      (statusFilter === 'all' || (statusFilter === 'published') === isLive(guide)),
  );
  const isFiltered = Boolean(query || categoryFilter || statusFilter !== 'all');

  return (
    <>
      <AdminPageHeader title="Guides" />

      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {loadError ? (
          <p role="alert" className="mb-6 rounded-card border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
            {loadError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <dl className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={
                  index === 0
                    ? 'rounded-card border border-accent/30 bg-accent-tint p-5'
                    : 'rounded-card border border-line bg-surface-raised p-5'
                }
              >
                <dt className="text-micro font-bold uppercase text-faint">{stat.label}</dt>
                <dd className={index === 0 ? 'mt-1 text-3xl font-black text-accent-strong' : 'mt-1 text-3xl font-black text-content'}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/admin/guides/new"
            className="shrink-0 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
          >
            Add guide
          </Link>
        </div>

        {guides.some((guide) => guide.source === 'built-in') ? (
          <div className="mt-8 flex items-start gap-3 rounded-card border border-line bg-surface-raised p-4">
            <span className="mt-0.5 shrink-0 text-muted">
              <InfoIcon className="h-5 w-5" />
            </span>
            <p className="text-sm text-muted">
              Guides marked <span className="font-bold text-content">built-in</span> ship in the repository.
              Editing one writes a database copy that takes over from it; the original stays as a fallback and
              cannot be deleted from here.
            </p>
          </div>
        ) : null}

        <section className="mt-8 rounded-card border border-line bg-surface-raised">
          <form method="get" className="grid grid-cols-1 gap-4 border-b border-line p-4 sm:grid-cols-[1fr_12rem_10rem_auto] sm:items-end sm:p-5">
            <div>
              <label htmlFor="guide-search" className="block text-sm font-semibold text-content">
                Search by title
              </label>
              <input
                id="guide-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Hospira bacteriostatic water"
                className={FILTER_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="guide-category" className="block text-sm font-semibold text-content">
                Category
              </label>
              <select id="guide-category" name="category" defaultValue={categoryFilter} className={FILTER_INPUT_CLASS}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="guide-status" className="block text-sm font-semibold text-content">
                Status
              </label>
              <select id="guide-status" name="status" defaultValue={statusFilter} className={FILTER_INPUT_CLASS}>
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-chip bg-brand px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
              >
                Apply
              </button>
              {isFiltered ? (
                <Link href="/admin/guides" className="text-sm font-bold text-muted hover:text-content">
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          <h2 className="px-4 pt-4 text-micro font-bold uppercase tracking-wide text-faint sm:px-5">
            {isFiltered ? `${visible.length} of ${guides.length} guides` : `All guides (${guides.length})`}
          </h2>

          {guides.length === 0 && !loadError ? (
            <p className="m-4 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted sm:m-5">
              No guides yet. Add the first one.
            </p>
          ) : visible.length === 0 && guides.length > 0 ? (
            <p className="m-4 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted sm:m-5">
              No guides match these filters.{' '}
              <Link href="/admin/guides" className="font-bold text-brand hover:underline">
                Clear filters
              </Link>
            </p>
          ) : visible.length > 0 ? (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[60rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-micro font-bold uppercase text-faint">
                    <th scope="col" className="px-5 py-3">Title</th>
                    <th scope="col" className="px-5 py-3">Category</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3">Publish date</th>
                    <th scope="col" className="px-5 py-3">Last updated</th>
                    <th scope="col" className="px-5 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((guide) => {
                    const live = isLive(guide);
                    return (
                      <tr key={guide.slug} className="border-b border-line align-top last:border-0">
                        <th scope="row" className="px-5 py-4 text-left font-normal">
                          <p className="font-bold text-content">{guide.title}</p>
                          <p className="mt-0.5 font-mono text-xs text-faint">/guides/{guide.slug}</p>
                        </th>
                        <td className="px-5 py-4 text-content">{guide.category}</td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold',
                              live ? 'bg-ok/10 text-ok' : 'bg-surface-sunken text-muted',
                            )}
                          >
                            <span aria-hidden="true">{live ? '●' : '○'}</span>
                            {live ? 'Published' : 'Draft'}
                          </span>
                          {guide.source === 'built-in' ? (
                            <p className="mt-1 text-xs text-faint">Built-in</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-content">
                          <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
                        </td>
                        <td className="px-5 py-4 text-content">
                          {guide.updatedAt ? <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time> : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-start justify-end gap-2">
                            <Link
                              href={`/admin/guides/${guide.slug}/edit`}
                              aria-label={`Edit ${guide.title}`}
                              className="rounded-chip bg-brand px-3 py-2 text-xs font-bold text-surface transition-colors hover:bg-brand-strong"
                            >
                              Edit
                            </Link>
                            {guide.source === 'database' ? (
                              <>
                                <GuideDuplicateButton slug={guide.slug} title={guide.title} />
                                <GuidePublishToggle slug={guide.slug} title={guide.title} isPublished={live} />
                              </>
                            ) : null}
                            {live ? (
                              <a
                                href={`/guides/${guide.slug}`}
                                target="_blank"
                                rel="noopener"
                                aria-label={`View ${guide.title} live (opens in a new tab)`}
                                className="inline-flex items-center gap-1 rounded-chip border border-line bg-surface px-3 py-2 text-xs font-bold text-content transition-colors hover:border-brand hover:text-brand-strong"
                              >
                                View live
                                <ExternalIcon className="h-3 w-3" />
                              </a>
                            ) : (
                              <span
                                title="Drafts are not public. Publish the guide to view it live."
                                className="rounded-chip border border-dashed border-line px-3 py-2 text-xs font-bold text-faint"
                              >
                                Not live
                              </span>
                            )}
                            {guide.source === 'database' ? (
                              <GuideDeleteButton slug={guide.slug} title={guide.title} />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
