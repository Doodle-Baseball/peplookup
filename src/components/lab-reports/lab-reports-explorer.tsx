'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDownIcon, ExternalIcon, FlaskIcon, SearchIcon } from '@/components/icons/icons';
import { splitCategories } from '@/lib/categories';

export interface LabTestRow {
  key: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  category: string | null;
  formLabel: string;
  doseLabel: string;
  reportUrl: string | null;
}

export interface LabVendorGroup {
  slug: string;
  name: string;
  logo: string | null;
  labName: string | null;
  rows: LabTestRow[];
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
  quickSearchTerms: string[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
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
      <div className="rounded-card border border-line bg-surface-raised p-6 shadow-card">
        <div className="search-field flex items-center gap-3 border px-4 py-3.5">
          <SearchIcon className="h-5 w-5 shrink-0 text-brand" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search substance or vendor…"
            className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
          />
        </div>

        {quickSearchTerms.length > 0 ? (
          <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted">Quick Search:</span>
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
              {quickSearchTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className={`shrink-0 rounded-pill border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                    query.toLowerCase() === term.toLowerCase()
                      ? 'border-brand bg-brand-soft text-brand-strong'
                      : 'border-line bg-surface text-content hover:border-brand hover:bg-brand hover:text-white'
                  }`}
                >
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
            No vendors or substances match &ldquo;{query}&rdquo;.
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
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-tint"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface shadow-sm">
                    {vendor.logo ? (
                      <Image src={vendor.logo} alt="" width={48} height={48} className="h-full w-full object-contain" unoptimized />
                    ) : (
                      <span aria-hidden="true" className="text-base font-bold text-faint">
                        {vendor.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black text-content">{vendor.name}</span>
                    {vendor.labName ? (
                      <span className="block text-micro font-bold uppercase tracking-wide text-faint">{vendor.labName}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded-chip bg-brand-soft px-3 py-1.5 text-center">
                    <span className="block text-lg font-black leading-none text-brand-strong">{vendor.rows.length}</span>
                    <span className="block text-micro font-bold uppercase tracking-wide text-brand-strong/70">Tests</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-surface-sunken text-muted transition-colors group-hover:text-brand">
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-line bg-surface-sunken/40 px-5 pb-5 pt-4">
                    <div className="hidden gap-3 rounded-chip border border-line bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-faint sm:grid sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_9rem]">
                      <span>Product name</span>
                      <span>Category</span>
                      <span>Type</span>
                      <span>Size</span>
                      <span className="text-right">Report</span>
                    </div>
                    <ul className="mt-2.5 space-y-2.5">
                      {vendor.rows.map((row) => (
                        <li
                          key={row.key}
                          className="flex flex-col gap-3 rounded-card border border-line bg-surface-raised px-4 py-3.5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card sm:grid sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_9rem] sm:items-center"
                        >
                          <Link href={`/products/${row.productSlug}`} className="group/product flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface shadow-sm">
                              {row.productImage ? (
                                <Image
                                  src={row.productImage}
                                  alt=""
                                  width={44}
                                  height={44}
                                  className="h-full w-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <FlaskIcon className="h-4 w-4 text-faint" />
                              )}
                            </span>
                            <span className="min-w-0 truncate font-bold text-content group-hover/product:text-brand">
                              {row.productName}
                            </span>
                          </Link>

                          {/* Below sm the row is a stack, so category/type/size share one wrapped line.
                              From sm up each is its own grid cell, sitting directly under its header. */}
                          <div className="flex flex-wrap items-center gap-2 sm:hidden">
                            {splitCategories(row.category).map((category) => (
                              <span
                                key={category}
                                className="w-fit rounded-pill bg-brand-tint px-2.5 py-1 text-xs font-bold text-brand-strong"
                              >
                                {category}
                              </span>
                            ))}
                            <span className="inline-flex w-fit items-center gap-1 rounded-chip border border-line bg-surface px-2 py-1 text-xs font-bold uppercase tracking-wide text-muted">
                              {row.formLabel}
                            </span>
                            <span className="text-sm font-black text-content">{row.doseLabel}</span>
                          </div>

                          <span className="hidden min-w-0 flex-wrap gap-1.5 sm:flex">
                            {splitCategories(row.category).map((category) => (
                              <span
                                key={category}
                                className="w-fit rounded-pill bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand-strong"
                              >
                                {category}
                              </span>
                            ))}
                          </span>
                          <span className="hidden min-w-0 truncate text-sm font-semibold text-content sm:block">
                            {row.formLabel}
                          </span>
                          <span className="hidden min-w-0 truncate text-sm font-black text-content sm:block">
                            {row.doseLabel}
                          </span>

                          {row.reportUrl ? (
                            <a
                              href={row.reportUrl}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex w-fit items-center gap-1.5 justify-self-start rounded-pill border border-brand/40 bg-brand-soft px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-brand-strong shadow-sm transition-colors hover:bg-brand hover:text-white sm:justify-self-end"
                            >
                              View Report
                              <ExternalIcon className="h-3 w-3" />
                            </a>
                          ) : (
                            <span
                              aria-disabled="true"
                              className="inline-flex w-fit cursor-not-allowed items-center gap-1.5 rounded-pill border border-dashed border-line px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-faint sm:justify-self-end"
                            >
                              Report Pending
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
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
            Load more vendors
          </button>
        </div>
      ) : null}
    </div>
  );
}
