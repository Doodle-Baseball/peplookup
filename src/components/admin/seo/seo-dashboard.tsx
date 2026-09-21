'use client';

import { useMemo, useState, useTransition } from 'react';
import type { SeoEntry, SeoPageKind } from '@/lib/admin/seo';
import type { SeoRedirect } from '@/lib/seo';
import { effectiveSeo, seoChecks, seoStatus, type EffectiveSeo, type SeoStatus } from '@/lib/seo-status';
import type { SeoTaskStatus } from '@/lib/seo';
import { deleteSeoRedirectAction } from '@/app/admin/(dashboard)/seo/actions';
import { SeoEditDialog } from '@/components/admin/seo/seo-edit-dialog';
import { cn } from '@/lib/cn';
import { ExternalIcon, PencilIcon, SearchIcon, TrashIcon, WarningIcon } from '@/components/icons/icons';

const PAGE_SIZE = 24;
const VISIBLE_KEYWORDS = 4;

type KindFilter = 'all' | SeoPageKind;
type StatusFilter = 'any' | SeoStatus | 'customized';

const KIND_TABS: readonly { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'All pages' },
  { value: 'static', label: 'Static pages' },
  { value: 'compound', label: 'Compounds' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'guide', label: 'Guides' },
];

const KIND_LABEL: Record<SeoPageKind, string> = {
  static: 'Static',
  compound: 'Compound',
  supplier: 'Supplier',
  guide: 'Guide',
};

const TASK_STATUS_LABEL: Record<SeoTaskStatus, string> = {
  'needs-work': 'Needs work',
  pending: 'Pending',
  done: 'Done',
};

interface Row {
  entry: SeoEntry;
  seo: EffectiveSeo;
  status: SeoStatus;
  passed: number;
  total: number;
  taskStatus: SeoTaskStatus | null;
  taskStatusLabel: string | null;
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' | 'info' }) {
  return (
    <div
      className={cn(
        // Tinted to match the number it carries, so the row reads as a summary
        // at a glance rather than five identical grey boxes.
        'rounded-card border px-4 py-3 shadow-sm transition-colors',
        tone === 'ok' && 'border-ok/25 bg-ok/5',
        tone === 'warn' && 'border-warn/25 bg-warn/5',
        tone === 'info' && 'border-info/25 bg-info/5',
        !tone && 'border-line bg-surface-raised',
      )}
    >
      <p className="text-micro font-bold uppercase text-faint">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-black text-content',
          tone === 'ok' && 'text-ok',
          tone === 'warn' && 'text-warn',
          tone === 'info' && 'text-info',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function SeoDashboard({
  entries,
  redirects,
  setupError,
}: {
  entries: SeoEntry[];
  redirects: SeoRedirect[];
  setupError: string | null;
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('any');
  const [page, setPage] = useState(0);
  const [editingPath, setEditingPath] = useState<string | null>(null);

  const rows = useMemo<Row[]>(
    () =>
      entries.map((entry) => {
        const seo = effectiveSeo(entry.defaults, entry.override);
        const checks = seoChecks(seo);
        const taskStatus = entry.override?.taskStatus ?? null;
        return {
          entry,
          seo,
          status: seoStatus(seo),
          passed: checks.filter((check) => check.passed).length,
          total: checks.length,
          taskStatus,
          taskStatusLabel: taskStatus ? TASK_STATUS_LABEL[taskStatus] : null,
        };
      }),
    [entries],
  );

  const kindCounts = useMemo(() => {
    const counts: Record<KindFilter, number> = { all: rows.length, static: 0, compound: 0, supplier: 0, guide: 0 };
    for (const row of rows) counts[row.entry.kind] += 1;
    return counts;
  }, [rows]);

  const needle = query.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (kind !== 'all' && row.entry.kind !== kind) return false;
    if (status === 'customized' && !row.entry.override) return false;
    if (status !== 'any' && status !== 'customized' && row.status !== status) return false;
    if (!needle) return true;
    return (
      row.entry.name.toLowerCase().includes(needle) ||
      row.entry.path.toLowerCase().includes(needle) ||
      row.seo.title.toLowerCase().includes(needle) ||
      row.seo.keywords.some((keyword) => keyword.toLowerCase().includes(needle))
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const editing = editingPath ? (entries.find((entry) => entry.path === editingPath) ?? null) : null;

  const optimizedCount = rows.filter((row) => row.status === 'optimized').length;
  const needsWorkCount = rows.filter((row) => row.status === 'needs-work').length;
  const customizedCount = rows.filter((row) => row.entry.override).length;

  function resetPaging<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  return (
    <div className="space-y-6">
      {setupError ? (
        <div role="alert" className="flex gap-3 rounded-card border border-warn/30 bg-warn/5 px-5 py-4 text-sm text-content">
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
          <div>
            <p className="font-bold">Saving is disabled until the SEO tables exist.</p>
            <p className="mt-1 text-muted">{setupError}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile label="Total pages" value={rows.length} />
        <StatTile label="Optimized" value={optimizedCount} tone="ok" />
        <StatTile label="Needs work" value={needsWorkCount} tone="warn" />
        <StatTile label="Customized" value={customizedCount} tone="info" />
        <StatTile label="Redirects" value={redirects.length} />
      </div>

      <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-chip border border-line bg-surface px-3.5 py-2.5 focus-within:border-brand">
            <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
            <span className="sr-only">Search pages</span>
            <input
              type="search"
              value={query}
              onChange={(event) => resetPaging(setQuery)(event.target.value)}
              placeholder="Search by page name, URL, title or keyword"
              className="min-w-0 flex-1 bg-transparent text-sm text-content outline-none placeholder:text-faint focus-visible:ring-0"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-content">
            Status
            <select
              value={status}
              onChange={(event) => resetPaging(setStatus)(event.target.value as StatusFilter)}
              className="rounded-chip border border-line bg-surface px-3 py-2.5 text-sm text-content outline-none"
            >
              <option value="any">Any status</option>
              <option value="optimized">Optimized</option>
              <option value="needs-work">Needs work</option>
              <option value="noindex">Noindex</option>
              <option value="customized">Customized</option>
            </select>
          </label>
        </div>

        <div role="group" aria-label="Page type" className="mt-4 flex flex-wrap gap-2">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={kind === tab.value}
              onClick={() => resetPaging(setKind)(tab.value)}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 text-xs font-bold transition-colors duration-150',
                kind === tab.value
                  ? 'border-brand bg-brand text-surface'
                  : 'border-line bg-surface text-muted hover:border-brand hover:text-content',
              )}
            >
              {tab.label} ({kindCounts[tab.value]})
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted">
          {filtered.length} page{filtered.length === 1 ? '' : 's'}
        </p>

        {pageRows.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No pages match these filters.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {pageRows.map((row) => (
              <SeoCard key={row.entry.path} row={row} onEdit={() => setEditingPath(row.entry.path)} disabled={Boolean(setupError)} />
            ))}
          </ul>
        )}

        {pageCount > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-chip border border-line bg-surface px-3 py-1.5 font-semibold text-content hover:border-brand disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-muted">
              Page {currentPage + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
              className="rounded-chip border border-line bg-surface px-3 py-1.5 font-semibold text-content hover:border-brand disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

      <RedirectsPanel redirects={redirects} />

      {editing ? <SeoEditDialog key={editing.path} entry={editing} onClose={() => setEditingPath(null)} /> : null}
    </div>
  );
}

function SeoCard({ row, onEdit, disabled }: { row: Row; onEdit: () => void; disabled: boolean }) {
  const { entry, seo } = row;
  const hiddenKeywords = seo.keywords.length - VISIBLE_KEYWORDS;

  return (
    <li className="flex flex-col rounded-card border border-line bg-surface p-4 shadow-sm transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-micro font-bold uppercase text-muted">
              {KIND_LABEL[entry.kind]}
            </span>
            {entry.override ? (
              <span className="rounded-pill bg-info/10 px-2 py-0.5 text-micro font-bold uppercase text-info">Customized</span>
            ) : null}
          </div>
          <h3 className="mt-1.5 truncate font-black text-content">{entry.name}</h3>
          <a
            href={entry.path}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-brand hover:underline"
          >
            <span className="truncate">{entry.path}</span>
            <ExternalIcon className="h-3 w-3 shrink-0" />
          </a>
        </div>
        {row.taskStatusLabel ? (
          <span
            className={cn(
              'shrink-0 rounded-pill px-2 py-0.5 text-micro font-bold uppercase',
              row.taskStatus === 'done' && 'bg-ok/10 text-ok',
              row.taskStatus === 'pending' && 'bg-info/10 text-info',
              row.taskStatus === 'needs-work' && 'bg-warn/10 text-warn',
            )}
          >
            {row.taskStatusLabel}
          </span>
        ) : null}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-micro font-bold uppercase text-faint">Meta title</dt>
          <dd className="line-clamp-2 text-content">{seo.title}</dd>
        </div>
        <div>
          <dt className="text-micro font-bold uppercase text-faint">Meta description</dt>
          <dd className="line-clamp-2 text-muted">{seo.description}</dd>
        </div>
        <div>
          <dt className="text-micro font-bold uppercase text-faint">Keywords</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {seo.keywords.length === 0 ? (
              <span className="text-xs text-faint">None yet</span>
            ) : (
              <>
                {seo.keywords.slice(0, VISIBLE_KEYWORDS).map((keyword) => (
                  <span key={keyword} className="rounded-pill bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-strong">
                    {keyword}
                  </span>
                ))}
                {hiddenKeywords > 0 ? <span className="text-xs text-faint">+{hiddenKeywords}</span> : null}
              </>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs text-muted">
          {row.passed}/{row.total} checks passed
        </span>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-chip bg-brand px-3.5 py-2 text-xs font-bold text-surface transition-colors duration-150 hover:bg-brand-strong disabled:opacity-50"
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
    </li>
  );
}

function RedirectsPanel({ redirects }: { redirects: SeoRedirect[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(fromPath: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteSeoRedirectAction(fromPath);
      if (result.error) setError(result.error);
    });
  }

  return (
    <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
      <h2 className="text-base font-black text-content">Redirects</h2>
      <p className="mt-1 text-sm text-muted">
        Created automatically when a compound or supplier slug changes, so old links and bookmarks land on the new URL.
        Delete one only if the old URL should stop working.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}

      {redirects.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">
          No redirects yet. They appear here after a slug is changed.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-micro font-bold uppercase text-faint">
                <th scope="col" className="px-3 py-2">Old URL</th>
                <th scope="col" className="px-3 py-2">Redirects to</th>
                <th scope="col" className="px-3 py-2">Created</th>
                <th scope="col" className="px-3 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((redirect) => (
                <tr key={redirect.fromPath} className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5 font-mono text-xs text-muted">{redirect.fromPath}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-content">{redirect.toPath}</td>
                  <td className="px-3 py-2.5 text-xs text-muted">{new Date(redirect.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => remove(redirect.fromPath)}
                      disabled={pending}
                      aria-label={`Delete redirect from ${redirect.fromPath}`}
                      className="rounded-chip p-1.5 text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
