'use client';

import { useMemo, useState } from 'react';
import type { SeoEntry, SeoPageKind } from '@/lib/admin/seo';
import { effectiveSeo, type EffectiveSeo } from '@/lib/seo-status';
import { SeoEditDialog } from '@/components/admin/seo/seo-edit-dialog';
import { cn } from '@/lib/cn';
import { ExternalIcon, PencilIcon, SearchIcon, WarningIcon } from '@/components/icons/icons';

const PAGE_SIZE = 24;
const VISIBLE_KEYWORDS = 4;

/** Review pages are left out: each one now redirects to its supplier page, so there is nothing to edit. */
type ListedKind = Exclude<SeoPageKind, 'review'>;
type KindFilter = 'all' | ListedKind;

const KIND_TABS: readonly { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'All pages' },
  { value: 'static', label: 'Static pages' },
  { value: 'compound', label: 'Compounds' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'guide', label: 'Guides' },
  { value: 'coupon', label: 'Coupon pages' },
];

const KIND_LABEL: Record<ListedKind, string> = {
  static: 'Static',
  compound: 'Compound',
  supplier: 'Supplier',
  guide: 'Guide',
  coupon: 'Coupon page',
};

interface Row {
  entry: SeoEntry & { kind: ListedKind };
  seo: EffectiveSeo;
}

function isListed(entry: SeoEntry): entry is SeoEntry & { kind: ListedKind } {
  return entry.kind !== 'review';
}

export function SeoDashboard({ entries, setupError }: { entries: SeoEntry[]; setupError: string | null }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [page, setPage] = useState(0);
  const [editingPath, setEditingPath] = useState<string | null>(null);

  const rows = useMemo<Row[]>(
    () =>
      entries.filter(isListed).map((entry) => ({
        entry,
        seo: effectiveSeo(entry.defaults, entry.override),
      })),
    [entries],
  );

  const kindCounts = useMemo(() => {
    const counts: Record<KindFilter, number> = { all: rows.length, static: 0, compound: 0, supplier: 0, guide: 0, coupon: 0 };
    for (const row of rows) counts[row.entry.kind] += 1;
    return counts;
  }, [rows]);

  const needle = query.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (kind !== 'all' && row.entry.kind !== kind) return false;
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

      <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
        <label className="flex items-center gap-2 rounded-chip border border-line bg-surface px-3.5 py-2.5 focus-within:border-brand">
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
            No pages match this search.
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
          <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-micro font-bold uppercase text-muted">
            {KIND_LABEL[entry.kind]}
          </span>
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
        <RobotsBadge indexable={entry.indexing.indexable} />
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

      <div className="mt-auto flex justify-end pt-4">
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

/** The robots tag the live page carries: "Index" or "Noindex". */
function RobotsBadge({ indexable }: { indexable: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-2.5 py-1 text-micro font-bold uppercase',
        indexable ? 'border-ok/30 bg-ok/10 text-ok' : 'border-line bg-surface-sunken text-muted',
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', indexable ? 'bg-ok' : 'bg-faint')} />
      {indexable ? 'Index' : 'Noindex'}
    </span>
  );
}
