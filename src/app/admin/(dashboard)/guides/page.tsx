import type { Metadata } from 'next';
import Link from 'next/link';
import { listGuides, type AdminGuide } from '@/lib/admin/guides';
import { formatDate } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/page-header';
import { GuideCover } from '@/components/guides/guide-cover';
import { GuideDeleteButton } from '@/components/admin/guide-delete-button';
import { ClockIcon, ExternalIcon, InfoIcon } from '@/components/icons/icons';

export const metadata: Metadata = { title: 'Guides | Admin', robots: { index: false, follow: false } };

// Guides change on every save; never serve a build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function AdminGuidesPage() {
  let guides: AdminGuide[] = [];
  let loadError: string | null = null;
  try {
    guides = await listGuides();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Guides could not be loaded.';
  }

  const categories = [...new Set(guides.map((guide) => guide.category))];
  const totalSections = guides.reduce((sum, guide) => sum + guide.sections.length, 0);
  const stats = [
    { label: 'Guides', value: guides.length },
    { label: 'Topics covered', value: categories.length },
    { label: 'Sections written', value: totalSections },
  ];

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

        <section className="mt-8">
          <h2 className="text-micro font-bold uppercase tracking-wide text-faint">All guides ({guides.length})</h2>

          {guides.length === 0 ? (
            <p className="mt-3 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
              No guides yet. Add the first one.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {guides.map((guide) => (
                <li
                  key={guide.slug}
                  className="flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-4 transition-colors hover:border-accent/40 sm:flex-row sm:items-center"
                >
                  <GuideCover
                    imageUrl={guide.coverImageUrl}
                    icon={guide.icon}
                    accent={guide.accent}
                    className="h-20 w-full shrink-0 rounded-chip sm:h-16 sm:w-24"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-micro font-bold uppercase text-faint">
                      <span className="rounded-pill border border-line bg-surface px-2 py-0.5 text-content">
                        {guide.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {guide.readMinutes} min read
                      </span>
                      <span>{guide.sections.length} sections</span>
                      <span
                        className={
                          guide.source === 'database'
                            ? 'rounded-pill bg-ok/10 px-2 py-0.5 text-ok'
                            : 'rounded-pill bg-surface-sunken px-2 py-0.5 text-muted'
                        }
                      >
                        {guide.source === 'database' ? 'Editable' : 'Built-in'}
                      </span>
                    </p>
                    <h3 className="mt-1.5 font-black text-content">{guide.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{guide.excerpt}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <time dateTime={guide.publishedAt} className="text-xs text-faint">
                      {formatDate(guide.publishedAt)}
                    </time>
                    <Link
                      href={`/guides/${guide.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
                    >
                      View
                      <ExternalIcon className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/guides/${guide.slug}/edit`}
                      className="rounded-chip bg-brand px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
                    >
                      Edit
                    </Link>
                    {guide.source === 'database' ? (
                      <GuideDeleteButton slug={guide.slug} title={guide.title} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
