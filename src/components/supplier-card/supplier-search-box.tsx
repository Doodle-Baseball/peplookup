'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { StarRating } from '@/components/ui/star-rating';
import { formatDate, formatRating } from '@/lib/format';
import { BoxIcon, CalendarIcon, ChevronRightIcon, SearchIcon } from '@/components/icons/icons';

/** Wait this long after the last keystroke before re-querying the results below, same as LiveSearchInput. */
const DEBOUNCE_MS = 250;
/**
 * Suggestions listed when the field is focused but empty or mid-search.
 * Six rows fit inside the panel's height cap, so the list shows whole rows
 * rather than scrolling with one sliced in half at the bottom.
 */
const SUGGESTION_LIMIT = 6;

export interface SupplierSuggestion {
  slug: string;
  name: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  listingCount: number;
  /** When the vendor was added to the directory, not when it was founded. */
  createdAt: string;
  reviewRating: number | null;
}

/**
 * The directory's search field, plus a suggestions panel that opens on focus.
 * Still writes into the URL like `LiveSearchInput` (so the result grid below
 * updates and the view stays a shareable link), but keeps its own `value`
 * state too, since the dropdown needs to filter locally without waiting on a
 * server round trip.
 */
export function SupplierSearchBox({
  defaultValue,
  suppliers,
}: {
  defaultValue: string;
  suppliers: SupplierSuggestion[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function pushQuery(next: string) {
    const params = new URLSearchParams(window.location.search);
    const trimmed = next.trim();
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    params.delete('page');
    const qs = params.toString();
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false }));
  }

  function onChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushQuery(next), DEBOUNCE_MS);
  }

  const q = value.trim().toLowerCase();
  const suggestions = (q ? suppliers.filter((s) => s.name.toLowerCase().includes(q)) : suppliers).slice(
    0,
    SUGGESTION_LIMIT,
  );

  return (
    <div ref={boxRef} className="relative">
      <div className="search-field flex h-12 min-w-0 flex-1 items-center gap-3 border px-4">
        <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
        <input
          id="supplier-search"
          name="q"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setOpen(true)}
          role="combobox"
          aria-expanded={open}
          aria-controls="supplier-search-suggestions"
          autoComplete="off"
          placeholder="Search by name…"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-content outline-none placeholder:text-faint"
        />
      </div>

      {open ? (
        <div
          id="supplier-search-suggestions"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-line bg-surface-raised shadow-lift"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-sunken/50 px-4 py-2.5">
            <p className="text-micro font-bold uppercase tracking-wide text-faint">
              {q ? 'Matching suppliers' : 'Recommended suppliers'}
            </p>
            <p className="text-micro font-bold text-faint">
              {suggestions.length} of {suppliers.length}
            </p>
          </div>
          {suggestions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No supplier matches “{value.trim()}”.</p>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto">
              {suggestions.map((supplier) => (
                <li key={supplier.slug}>
                  <Link
                    href={`/suppliers/${supplier.slug}`}
                    onClick={() => setOpen(false)}
                    className="group/row flex items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-brand-tint"
                  >
                    <SupplierLogo
                      src={supplier.logoUrl ?? supplier.faviconUrl}
                      name={supplier.name}
                      size={40}
                      className="h-10 w-10 shrink-0 rounded-chip border border-line bg-surface"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-black text-content group-hover/row:text-brand-strong">
                          {supplier.name}
                        </span>
                        {supplier.reviewRating !== null ? (
                          <span className="inline-flex shrink-0 items-center gap-1">
                            <StarRating rating={supplier.reviewRating} starClassName="h-3 w-3" />
                            <span className="text-xs font-bold text-content">
                              {formatRating(supplier.reviewRating)}
                            </span>
                          </span>
                        ) : null}
                      </span>

                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <BoxIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                          {supplier.listingCount} {supplier.listingCount === 1 ? 'product' : 'products'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                          Listed {formatDate(supplier.createdAt)}
                        </span>
                      </span>
                    </span>

                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint transition-transform group-hover/row:translate-x-0.5 group-hover/row:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
