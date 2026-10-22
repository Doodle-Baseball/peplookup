'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  DocumentIcon,
  ExternalIcon,
  FlaskIcon,
  SearchIcon,
} from '@/components/icons/icons';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { splitCategories } from '@/lib/categories';
import { cn } from '@/lib/cn';

export interface LabTestRow {
  key: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  category: string | null;
  formLabel: string;
  doseLabel: string;
  /** Micrograms per vial and vials per pack, for ordering sizes smallest first. */
  vialSize: number;
  vialCount: number;
  reportUrl: string | null;
}

/** One COA document and the sizes it covers, e.g. "5mg, 10mg". */
interface ReportDocument {
  url: string;
  sizesLabel: string;
}

/** One card: every size of a product in one form, with each distinct COA document it has. */
interface ReportCardGroup {
  key: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  category: string | null;
  formLabel: string;
  /** Empty while every size's report is still pending. */
  documents: ReportDocument[];
}

/**
 * A product's sizes in one form collapse into a single card. Sizes sharing a
 * COA share one link; sizes with their own document keep their own link
 * (behind the card's CoA menu), so every button still opens exactly the
 * certificate it covers.
 */
function groupReportRows(rows: LabTestRow[]): ReportCardGroup[] {
  const groups = new Map<string, { first: LabTestRow; rows: LabTestRow[] }>();
  for (const row of rows) {
    const key = `${row.productSlug}|${row.formLabel}`;
    const group = groups.get(key);
    if (group) group.rows.push(row);
    else groups.set(key, { first: row, rows: [row] });
  }
  return [...groups.entries()].map(([key, { first, rows: groupRows }]) => {
    const bySize = [...groupRows].sort((a, b) => a.vialSize - b.vialSize || a.vialCount - b.vialCount);
    const sizesByUrl = new Map<string, string[]>();
    for (const row of bySize) {
      if (!row.reportUrl) continue;
      const sizes = sizesByUrl.get(row.reportUrl) ?? [];
      if (!sizes.includes(row.doseLabel)) sizes.push(row.doseLabel);
      sizesByUrl.set(row.reportUrl, sizes);
    }
    return {
      key,
      productName: first.productName,
      productSlug: first.productSlug,
      productImage: first.productImage,
      category: first.category,
      formLabel: first.formLabel,
      documents: [...sizesByUrl.entries()].map(([url, sizes]) => ({ url, sizesLabel: sizes.join(', ') })),
    };
  });
}

export interface LabVendorGroup {
  slug: string;
  name: string;
  logo: string | null;
  labName: string | null;
  rows: LabTestRow[];
}

export interface QuickSearchTerm {
  term: string;
  /** Supplier chips carry the supplier's logo; substance chips have none. */
  logo: string | null;
  isSupplier: boolean;
}

/** A vendor's reports narrowed to the ones whose product, form or size mentions the query. */
function matchRows(rows: LabTestRow[], query: string): LabTestRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    [row.productName, row.formLabel, row.doseLabel].some((field) => field.toLowerCase().includes(q)),
  );
}

// A vendor-name match ("Alpha Pro Peptides") still browses that vendor's whole
// catalogue; a substance match ("BPC-157") narrows each vendor down to just
// the rows that mention it, so the Tests count and the expanded list both
// reflect the search rather than the vendor's full inventory.
function matchVendors(vendors: LabVendorGroup[], query: string): LabVendorGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return vendors;
  return vendors.flatMap((v) => {
    if (v.name.toLowerCase().includes(q)) return [v];
    const rows = v.rows.filter((r) => r.productName.toLowerCase().includes(q));
    return rows.length > 0 ? [{ ...v, rows }] : [];
  });
}

/** Initial page size for the vendor list; "Load more" reveals the rest. */
const PAGE_SIZE = 20;

export function LabReportsExplorer({
  vendors,
  quickSearchTerms,
  initialQuery,
}: {
  vendors: LabVendorGroup[];
  quickSearchTerms: QuickSearchTerm[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  // Each open vendor has its own search box, keyed by vendor slug.
  const [rowQueries, setRowQueries] = useState<Record<string, string>>({});
  const filtered = useMemo(() => matchVendors(vendors, query), [vendors, query]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = filtered.slice(0, visibleCount);

  // A fresh search starts paged again rather than staying expanded from a
  // previous "Load more" click on a different result set.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  // Searching for a substance surfaces every vendor that carries it, not one
  // at a time behind a single accordion toggle, so every match starts open.
  // Computed lazily (not from an effect) so the very first render, including
  // the server-rendered HTML for a shared `?q=` link, is already expanded,
  // with no post-hydration flash from collapsed to open.
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(
    () => new Set(query.trim() ? matchVendors(vendors, query).map((v) => v.slug) : []),
  );

  // A later search (typed after mount) still auto-expands its matches.
  useEffect(() => {
    if (query.trim()) setOpenSlugs(new Set(filtered.map((v) => v.slug)));
  }, [query, filtered]);

  function toggle(slug: string) {
    setOpenSlugs((current) => {
      const next = new Set(current);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  return (
    <div>
      <div className="rounded-card border border-line bg-surface-raised p-4 shadow-card sm:p-6">
        <div className="search-field flex items-center gap-3 border px-4 py-3.5">
          <SearchIcon className="h-5 w-5 shrink-0 text-brand" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search substance or supplier…"
            className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
          />
        </div>

        {quickSearchTerms.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:gap-3">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted">Quick Search:</span>
            <div className="scrollbar-hide flex w-full min-w-0 items-center gap-2 overflow-x-auto">
              {quickSearchTerms.map(({ term, logo, isSupplier }) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-pill border py-1.5 text-sm font-bold transition-colors',
                    isSupplier ? 'pl-1.5 pr-3.5' : 'px-3.5',
                    query.toLowerCase() === term.toLowerCase()
                      ? 'border-brand bg-brand-soft text-brand-strong'
                      : 'border-line bg-surface text-content hover:border-brand hover:bg-brand hover:text-white',
                  )}
                >
                  {isSupplier ? (
                    <SupplierLogo
                      src={logo}
                      name={term}
                      alt=""
                      size={20}
                      className="h-5 w-5 rounded-pill bg-surface"
                      initialClassName="text-micro"
                    />
                  ) : null}
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No suppliers or substances match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          visible.map((vendor) => {
            const open = openSlugs.has(vendor.slug);
            return (
              <div
                key={vendor.slug}
                className="tilt-card group relative overflow-hidden rounded-card border border-line bg-surface-raised"
              >
                {/* Decorative top accent, revealed on hover, matches the supplier-card pattern.
                    A fade, not a transform, so it never competes with the card's own hover lift. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-strong to-brand opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />

                <button
                  type="button"
                  onClick={() => toggle(vendor.slug)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-brand-tint sm:gap-4 sm:px-5 sm:py-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface shadow-sm sm:h-12 sm:w-12">
                    {vendor.logo ? (
                      <Image src={vendor.logo} alt={`${vendor.name} logo`} width={48} height={48} className="h-full w-full object-contain" unoptimized />
                    ) : (
                      <span aria-hidden="true" className="text-base font-bold text-faint">
                        {vendor.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black text-content">{vendor.name}</span>
                    {vendor.labName ? (
                      <span className="line-clamp-2 text-micro font-bold uppercase tracking-wide text-faint sm:line-clamp-none">{vendor.labName}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded-chip bg-brand-soft px-2.5 py-1.5 text-center sm:px-3">
                    <span className="block text-base font-black leading-none text-brand-strong sm:text-lg">{vendor.rows.length}</span>
                    <span className="block text-micro font-bold uppercase tracking-wide text-brand-strong/70">Tests</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-surface-sunken text-muted transition-colors group-hover:text-brand">
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {open ? (
                  <VendorReports
                    vendor={vendor}
                    query={rowQueries[vendor.slug] ?? ''}
                    onQueryChange={(value) => setRowQueries((current) => ({ ...current, [vendor.slug]: value }))}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {filtered.length > visibleCount ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount(filtered.length)}
            className="rounded-chip border border-line bg-surface px-6 py-3 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
          >
            Load more suppliers
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** An open vendor's reports: a search box over a grid of product cards. */
function VendorReports({
  vendor,
  query,
  onQueryChange,
}: {
  vendor: LabVendorGroup;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  // '' means every form. Only forms this vendor actually has reports for are offered.
  const [formFilter, setFormFilter] = useState('');
  const formOptions = [...new Set(vendor.rows.map((row) => row.formLabel))].sort((a, b) => a.localeCompare(b));
  const rowsForForm = formFilter ? vendor.rows.filter((row) => row.formLabel === formFilter) : vendor.rows;
  const cards = groupReportRows(matchRows(rowsForForm, query));
  const searchId = `lab-search-${vendor.slug}`;
  const trimmedQuery = query.trim();

  return (
    <div className="border-t border-line bg-surface-sunken/40 px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={searchId} className="sr-only">
          Search {vendor.name} reports
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-card border border-line bg-surface px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
          <input
            id={searchId}
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={`Search ${vendor.name} products…`}
            className="w-full min-w-0 bg-transparent text-sm font-semibold text-content outline-none placeholder:font-normal placeholder:text-faint focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <FormSelect
          label={`Filter ${vendor.name} reports by form`}
          options={[
            { value: '', label: 'All forms', count: vendor.rows.length },
            ...formOptions.map((form) => ({
              value: form,
              label: form,
              count: vendor.rows.filter((row) => row.formLabel === form).length,
            })),
          ]}
          value={formFilter}
          onChange={setFormFilter}
        />
      </div>

      {cards.length === 0 ? (
        <p className="mt-3 rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
          No {formFilter ? `${formFilter.toLowerCase()} ` : ''}
          {vendor.name} reports{trimmedQuery ? <> match &ldquo;{trimmedQuery}&rdquo;</> : null}.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${vendor.name} reports`}>
          {cards.map((card) => (
            <ReportCard key={card.key} card={card} />
          ))}
        </ul>
      )}
    </div>
  );
}

const COA_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-strong';

function ReportCard({ card }: { card: ReportCardGroup }) {
  const productHref = `/products/${card.productSlug}`;
  const hasReport = card.documents.length > 0;

  return (
    <li className="flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-4 shadow-card">
      <div className="flex min-w-0 gap-3 sm:gap-4">
        {/* The name beside it is the real link; this one only widens the click target. */}
        <Link
          href={productHref}
          tabIndex={-1}
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface lg:h-20 lg:w-20"
        >
          {card.productImage ? (
            <Image
              src={card.productImage}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
              // Some vendors (e.g. GenX) refuse image requests that name another site as the referrer.
              referrerPolicy="no-referrer"
            />
          ) : (
            <FlaskIcon className="h-6 w-6 text-faint" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={productHref}
              title={card.productName}
              className="min-w-0 truncate text-base font-black text-content transition-colors hover:text-brand"
            >
              {card.productName}
            </Link>
            {hasReport ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-ok/10 px-2 py-0.5 text-micro font-bold text-ok">
                <CheckCircleIcon className="h-3 w-3" />
                COA
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted">{card.formLabel}</p>
          {card.category ? (
            <span className="mt-2 flex flex-wrap gap-1">
              {splitCategories(card.category).map((category) => (
                <span
                  key={category}
                  className="rounded-pill bg-brand-tint px-2 py-0.5 text-micro font-bold text-brand-strong"
                >
                  {category}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>

      {/* One button: a single certificate opens directly, several open a list to pick from. */}
      <div className="mt-auto">
        {card.documents.length === 1 ? (
          <a
            href={card.documents[0]!.url}
            target="_blank"
            rel="nofollow noopener"
            aria-label={`View ${card.productName} COA`}
            className={COA_BUTTON_CLASS}
          >
            <DocumentIcon className="h-4 w-4" />
            View COA
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
        ) : card.documents.length > 1 ? (
          <CoaMenu productName={card.productName} documents={card.documents} />
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-pill border border-dashed border-line px-5 py-3 text-sm font-bold text-faint"
          >
            Report pending
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * A product whose sizes each have their own certificate gets one CoA button
 * that opens a short list, one link per document, so no size ever opens a
 * certificate that doesn't cover it.
 */
function CoaMenu({ productName, documents }: { productName: string; documents: ReportDocument[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`${productName} COAs (${documents.length})`}
        onClick={() => setIsOpen((open) => !open)}
        className={COA_BUTTON_CLASS}
      >
        <DocumentIcon className="h-4 w-4" />
        COAs
        <span className="rounded-pill bg-white/20 px-1.5 text-micro font-black">{documents.length}</span>
        <ChevronDownIcon className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {/* Opens upward: the supplier panel clips anything below its last row. */}
      {isOpen ? (
        <ul className="absolute inset-x-0 bottom-full z-20 mb-2 rounded-card border border-line bg-surface-raised p-1.5 shadow-lift">
          {documents.map((document) => (
            <li key={document.url}>
              <a
                href={document.url}
                target="_blank"
                rel="nofollow noopener"
                className="flex items-center justify-between gap-2 rounded-chip px-3 py-2 text-sm font-bold text-content transition-colors hover:bg-surface-sunken hover:text-brand"
              >
                {document.sizesLabel} COA
                <ExternalIcon className="h-3.5 w-3.5 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

interface FormSelectOption {
  value: string;
  label: string;
  /** Tests in this form, shown beside the label. */
  count: number;
}

/**
 * The form filter beside a supplier's report search. A custom listbox rather
 * than a native <select>, because the browser draws a native option list with
 * OS colours the theme can't reach; styled like the supplier catalogue's
 * filters, with the same keyboard support.
 */
function FormSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly FormSelectOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const open = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const choose = (index: number) => {
    setIsOpen(false);
    triggerRef.current?.focus();
    const next = options[index];
    if (next) onChange(next.value);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        return;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        return;
      case 'Tab':
        setIsOpen(false);
    }
  };

  return (
    // Hover opens it, like the supplier catalogue's filters; click and keyboard
    // still do, for touch screens and keyboard users.
    <div
      ref={containerRef}
      className="relative w-full shrink-0 sm:w-auto"
      onMouseEnter={() => !isOpen && open()}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
        onClick={() => !isOpen && open()}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex h-full w-full items-center justify-between gap-2 rounded-card border bg-surface py-3 pl-4 pr-3.5 text-sm font-bold transition-colors focus-visible:ring-0 sm:w-auto sm:justify-start',
          value ? 'border-accent/40 text-accent-strong' : 'border-line text-content hover:border-accent/40',
        )}
      >
        {options[selectedIndex]?.label}
        <ChevronDownIcon className={cn('h-4 w-4 text-muted transition-transform', isOpen && 'rotate-180')} />
      </button>

      <div hidden={!isOpen} className="absolute right-0 top-full z-30 min-w-full pt-2">
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="min-w-44 rounded-card border border-line bg-surface-raised p-1.5 shadow-lift"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                // Keep focus on the trigger so the click isn't lost to a blur.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-4 whitespace-nowrap rounded-chip px-3 py-2 text-sm font-bold transition-colors',
                  index === activeIndex ? 'bg-accent-tint text-accent-strong' : 'text-content',
                )}
              >
                {option.label}
                <span className="ml-auto flex items-center gap-2">
                  <span className="min-w-6 rounded-pill bg-accent px-2 py-0.5 text-center text-xs font-black text-surface-raised">
                    {option.count}
                  </span>
                  <CheckIcon className={cn('h-4 w-4 text-accent-strong', !isSelected && 'invisible')} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
