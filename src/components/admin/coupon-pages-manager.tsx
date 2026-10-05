'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CouponPageSummary } from '@/lib/admin/coupon-pages';
import { couponPageIndexable } from '@/lib/coupon-pages';
import { SeoEditDialog } from '@/components/admin/seo/seo-edit-dialog';
import { cn } from '@/lib/cn';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { ExternalIcon, PencilIcon, SearchIcon, TagIcon, WarningIcon } from '@/components/icons/icons';

const PAGE_SIZE = 18;

type Filter = 'all' | 'indexed' | 'hidden' | 'needs-seo' | 'customized';

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'indexed', label: 'Indexing on' },
  { value: 'hidden', label: 'Indexing off' },
  { value: 'needs-seo', label: 'Needs SEO details' },
  { value: 'customized', label: 'Text edited' },
];

interface Row {
  page: CouponPageSummary;
  indexable: boolean;
  /** Both a meta title and a meta description are saved, the precondition for turning indexing on. */
  seoReady: boolean;
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' | 'info' }) {
  return (
    <div
      className={cn(
        'rounded-card border px-4 py-3 shadow-sm',
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

export function CouponPagesManager({
  pages,
  seoSetupError,
  contentSetupError,
}: {
  pages: CouponPageSummary[];
  seoSetupError: string | null;
  contentSetupError: string | null;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [editingPath, setEditingPath] = useState<string | null>(null);

  const rows = useMemo<Row[]>(
    () =>
      pages.map((page) => {
        const override = page.entry.override;
        return {
          page,
          indexable: couponPageIndexable(override),
          seoReady: Boolean(override?.metaTitle?.trim() && override?.metaDescription?.trim()),
        };
      }),
    [pages],
  );

  const needle = query.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (filter === 'indexed' && !row.indexable) return false;
    if (filter === 'hidden' && row.indexable) return false;
    if (filter === 'needs-seo' && row.seoReady) return false;
    if (filter === 'customized' && !row.page.contentCustomized) return false;
    if (!needle) return true;
    return (
      row.page.entry.name.toLowerCase().includes(needle) ||
      row.page.entry.path.toLowerCase().includes(needle) ||
      row.page.code.toLowerCase().includes(needle)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const editing = editingPath ? (pages.find((page) => page.entry.path === editingPath)?.entry ?? null) : null;

  const indexedCount = rows.filter((row) => row.indexable).length;
  const readyToIndexCount = rows.filter((row) => row.seoReady && !row.indexable).length;
  const customizedCount = rows.filter((row) => row.page.contentCustomized).length;

  return (
    <div className="space-y-6">
      {seoSetupError ? (
        <div role="alert" className="flex gap-3 rounded-card border border-warn/30 bg-warn/5 px-5 py-4 text-sm text-content">
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
          <div>
            <p className="font-bold">SEO can&rsquo;t be saved until the SEO tables exist.</p>
            <p className="mt-1 text-muted">{seoSetupError}</p>
          </div>
        </div>
      ) : null}
      {contentSetupError ? (
        <div role="alert" className="flex gap-3 rounded-card border border-warn/30 bg-warn/5 px-5 py-4 text-sm text-content">
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
          <div>
            <p className="font-bold">Page text can&rsquo;t be saved yet.</p>
            <p className="mt-1 text-muted">{contentSetupError}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Coupon pages" value={rows.length} />
        <StatTile label="Indexing on" value={indexedCount} tone="ok" />
        <StatTile label="Ready to index" value={readyToIndexCount} tone="warn" />
        <StatTile label="Text edited" value={customizedCount} tone="info" />
      </div>

      <p className="rounded-card border border-line bg-surface-raised px-5 py-3 text-sm text-muted">
        Every coupon page is hidden from search engines until you add its SEO details and switch indexing on. Use{' '}
        <span className="font-semibold text-content">Edit SEO</span> to set the meta title, description, keywords and FAQs, then tick
        &ldquo;Allow search engines to index this page&rdquo;.
      </p>

      <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-chip border border-line bg-surface px-3.5 py-2.5 focus-within:border-brand">
            <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
            <span className="sr-only">Search coupon pages</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPageIndex(0);
              }}
              placeholder="Search by supplier, URL or coupon code"
              className="min-w-0 flex-1 bg-transparent text-sm text-content outline-none placeholder:text-faint focus-visible:ring-0"
            />
          </label>
        </div>

        <div role="group" aria-label="Filter coupon pages" className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => {
                setFilter(option.value);
                setPageIndex(0);
              }}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 text-xs font-bold transition-colors duration-150',
                filter === option.value
                  ? 'border-brand bg-brand text-surface'
                  : 'border-line bg-surface text-muted hover:border-brand hover:text-content',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted" aria-live="polite">
          {filtered.length} page{filtered.length === 1 ? '' : 's'}
        </p>

        {pageRows.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            {rows.length === 0 ? 'No supplier has a coupon yet, so there are no coupon pages.' : 'No coupon pages match these filters.'}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
            {/* Column headings on large screens; below that each row stacks into its own card. */}
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.4fr)_auto] items-center gap-4 border-b border-line bg-surface-sunken px-5 py-2.5 text-micro font-bold uppercase tracking-wide text-faint lg:grid"
            >
              <span>Supplier page</span>
              <span>Coupon</span>
              <span>Status</span>
              <span className="w-[15.5rem] text-right">Actions</span>
            </div>

            <ul className="divide-y divide-line">
              {pageRows.map((row) => (
                <li
                  key={row.page.entry.path}
                  className="grid grid-cols-1 items-center gap-3 px-4 py-4 transition-colors hover:bg-accent-tint/50 sm:px-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.4fr)_auto] lg:gap-4"
                >
                  {/* Vendor + its page address */}
                  <div className="flex min-w-0 items-center gap-3">
                    <SupplierLogo
                      src={row.page.logoUrl}
                      name={row.page.vendorName}
                      alt={`${row.page.vendorName} logo`}
                      size={40}
                      className="h-10 w-10 shrink-0 rounded-chip bg-surface shadow-sm"
                      initialClassName="text-sm"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-content sm:text-base">{row.page.vendorName}</h3>
                      <a
                        href={row.page.entry.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent"
                      >
                        <span className="truncate">{row.page.entry.path}</span>
                        <ExternalIcon className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* The code and its discount */}
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-chip border border-accent/20 bg-accent-tint px-3 py-1.5 text-xs font-bold text-accent-strong">
                      <TagIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono">{row.page.code}</span>
                      <span aria-hidden="true" className="text-accent/50">
                        |
                      </span>
                      {row.page.percentOff}% off
                    </p>
                  </div>

                  {/* Indexing, SEO and text state */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-micro font-bold uppercase',
                        row.indexable ? 'bg-ok/10 text-ok' : 'bg-surface-sunken text-muted',
                      )}
                    >
                      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-pill', row.indexable ? 'bg-ok' : 'bg-faint')} />
                      {row.indexable ? 'Indexing on' : 'Indexing off'}
                    </span>
                    <span
                      className={cn(
                        'rounded-pill px-2.5 py-1 text-micro font-bold uppercase',
                        row.seoReady ? 'bg-info/10 text-info' : 'bg-warn/10 text-warn',
                      )}
                    >
                      {row.seoReady ? 'SEO added' : 'No SEO yet'}
                    </span>
                    {row.page.contentCustomized ? (
                      <span className="rounded-pill bg-brand-soft px-2.5 py-1 text-micro font-bold uppercase text-brand-strong">
                        Text edited
                      </span>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:w-[15.5rem] lg:flex-nowrap lg:justify-end">
                    <Link
                      href={`/admin/coupon-pages/${row.page.entry.slug}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-chip bg-brand px-3.5 py-2 text-xs font-bold text-surface transition-colors hover:bg-brand-strong"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Edit text
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingPath(row.page.entry.path)}
                      disabled={Boolean(seoSetupError)}
                      className="inline-flex items-center gap-1.5 rounded-chip border border-line bg-surface px-3.5 py-2 text-xs font-bold text-content transition-colors hover:border-accent hover:text-accent-strong disabled:opacity-50"
                    >
                      <SearchIcon className="h-3.5 w-3.5" />
                      Edit SEO
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pageCount > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => setPageIndex(currentPage - 1)}
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
              onClick={() => setPageIndex(currentPage + 1)}
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
