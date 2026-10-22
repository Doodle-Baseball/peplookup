'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, SearchIcon } from '@/components/icons/icons';
import { IDLE_CLASS, ITEM_CLASS, pageSlots } from '@/components/ui/pagination';
import { useSupplierDirectory } from './supplier-directory-state';

/** Cards past this index share the last delay, so a full page never waits long to appear. */
const MAX_STAGGERED_CARDS = 8;

export interface SupplierDirectoryEntry {
  slug: string;
  name: string;
  /** The supplier's card, rendered on the server. */
  card: ReactNode;
}

/**
 * The directory's result grid: filters the server-rendered cards by the
 * shared search and pages through them in the browser, so neither the search
 * nor the page number goes into the URL.
 */
export function SupplierDirectoryResults({
  entries,
  perPage,
}: {
  /** Every listed supplier, already in directory order. */
  entries: readonly SupplierDirectoryEntry[];
  perPage: number;
}) {
  const { query: rawQuery, setQuery, page, setPage } = useSupplierDirectory();
  const gridTopRef = useRef<HTMLDivElement>(null);
  const query = rawQuery.trim();
  const needle = query.toLowerCase();
  const filtered = needle ? entries.filter((entry) => entry.name.toLowerCase().includes(needle)) : entries;

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const firstIndex = (currentPage - 1) * perPage;
  const pageEntries = filtered.slice(firstIndex, firstIndex + perPage);

  const goTo = (next: number) => {
    setPage(next);
    // A visitor who scrolled down to the page buttons is brought back to the top of the new page.
    const gridTop = gridTopRef.current;
    if (gridTop && gridTop.getBoundingClientRect().top < 0) gridTop.scrollIntoView({ block: 'start' });
  };

  return (
    <div ref={gridTopRef} className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-line pb-5">
        <div className="min-w-0">
          <p className="eyebrow">{query ? 'Search results' : 'All suppliers'}</p>
          <h2 className="mt-2 text-2xl font-black text-content sm:text-3xl">
            {filtered.length} <span className="text-accent">{filtered.length === 1 ? 'supplier' : 'suppliers'}</span>
            {query ? <span className="font-medium text-muted"> for &ldquo;{query}&rdquo;</span> : null}
          </h2>
          {pageCount > 1 ? (
            <p className="mt-1 text-sm text-muted">
              Showing {firstIndex + 1}–{firstIndex + pageEntries.length} of {filtered.length}
            </p>
          ) : null}
        </div>
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-raised px-3.5 py-2 text-sm font-semibold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            Clear search
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="animate-fade-up rounded-panel border border-dashed border-line bg-surface-raised px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-accent-tint text-accent-strong">
            <SearchIcon className="h-5 w-5" />
          </span>
          <p className="mt-4 text-base font-bold text-content">
            {query ? `No suppliers match "${query}".` : 'No suppliers listed yet.'}
          </p>
          {query ? <p className="mt-1 text-sm text-muted">Try a shorter name, or clear the search to see everyone.</p> : null}
        </div>
      ) : (
        <>
          <ul key={`${needle}-${currentPage}`} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pageEntries.map((entry, index) => (
              <li
                key={entry.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, MAX_STAGGERED_CARDS) * 60}ms` }}
              >
                {entry.card}
              </li>
            ))}
          </ul>

          {pageCount > 1 ? (
            <nav aria-label="Supplier directory pages" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
              <StepButton disabled={currentPage === 1} label="Previous page" onClick={() => goTo(currentPage - 1)}>
                <ArrowLeftIcon className="h-4 w-4" />
              </StepButton>
              {pageSlots(currentPage, pageCount).map((slot, index) =>
                slot === 'gap' ? (
                  <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-faint">
                    …
                  </span>
                ) : (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => goTo(slot)}
                    aria-current={slot === currentPage ? 'page' : undefined}
                    className={cn(ITEM_CLASS, slot === currentPage ? 'bg-brand text-surface' : IDLE_CLASS)}
                  >
                    {slot}
                  </button>
                ),
              )}
              <StepButton disabled={currentPage === pageCount} label="Next page" onClick={() => goTo(currentPage + 1)}>
                <ArrowRightIcon className="h-4 w-4" />
              </StepButton>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

function StepButton({
  disabled,
  label,
  onClick,
  children,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-hidden="true" className={cn(ITEM_CLASS, 'border border-line text-faint opacity-50')}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn(ITEM_CLASS, IDLE_CLASS)}>
      {children}
    </button>
  );
}
