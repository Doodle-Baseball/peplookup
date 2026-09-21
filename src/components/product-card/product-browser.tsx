'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { CatalogueFacets, ProductCardData } from '@/lib/product-summary';
import { splitCategories } from '@/lib/categories';
import { useWatchlist } from '@/lib/use-watchlist';
import { matchesFilter, sortProducts, countActiveFilters } from '@/lib/product-filters';
import { ProductCardView } from '@/components/product-card/product-card-view';
import {
  FilterSortPopup,
  DEFAULT_FILTER,
  DEFAULT_SORT,
  type FilterState,
  type SortState,
} from '@/components/product-card/filter-sort-popup';
import { ChevronRightIcon, FlaskIcon, SearchIcon, SlidersIcon } from '@/components/icons/icons';

const UNCATEGORIZED = 'Uncategorized';
/** Suggestions listed when the search box is focused but empty. */
const SUGGESTION_LIMIT = 8;

export function ProductBrowser({ products, facets }: { products: ProductCardData[]; facets: CatalogueFacets }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const { slugs: likedSlugs, ready } = useWatchlist();

  const { categoryFacets, supplierFacets, doseFacets } = facets;
  const activeFilterCount = countActiveFilters(filter);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Focus alone opens the panel, so it has to close on anything that means
  // "I'm done with it": a click elsewhere, or Escape.
  useEffect(() => {
    if (!suggestOpen) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSuggestOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSuggestOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [suggestOpen]);

  // Both states follow the curated running order, so the recommended list and
  // the typed matches agree with the card grid below them.
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
    return pool.slice(0, SUGGESTION_LIMIT);
  }, [products, query]);

  const searched = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : products;
  const filtered = ready ? searched.filter((p) => matchesFilter(p, filter, likedSlugs)) : searched;
  const sorted = sortProducts(filtered, sort.sortBy);

  const groups: { heading: string | null; items: ProductCardData[] }[] =
    sort.groupBy === 'category'
      ? Object.entries(
          sorted.reduce<Record<string, ProductCardData[]>>((acc, p) => {
            const key = p.category ?? UNCATEGORIZED;
            (acc[key] ??= []).push(p);
            return acc;
          }, {}),
        ).map(([heading, items]) => ({ heading, items }))
      : [{ heading: null, items: sorted }];

  return (
    <>
      <div className="relative">
        <div className="mx-auto max-w-shell px-4 pb-10">
      <div className="mx-auto max-w-3xl rounded-card border border-line bg-surface-raised p-4 shadow-card sm:p-6">
        <div className="flex items-center gap-3">
          <label htmlFor="q" className="sr-only">
            Search peptides
          </label>
          <div ref={searchRef} className="relative min-w-0 flex-1">
            <div className="search-field flex min-w-0 items-center gap-3 border px-4 py-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-brand" />
              <input
                id="q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSuggestOpen(true)}
                role="combobox"
                aria-expanded={suggestOpen}
                aria-controls="search-suggestions"
                autoComplete="off"
                placeholder="Search peptides…"
                className="min-w-0 flex-1 bg-transparent text-base text-content outline-none placeholder:text-faint"
              />
            </div>

            {suggestOpen ? (
              <div
                id="search-suggestions"
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-line bg-surface-raised shadow-lift"
              >
                <p className="border-b border-line px-4 py-2.5 text-micro font-bold uppercase tracking-wide text-faint">
                  {query.trim() ? 'Matching peptides' : 'Recommended peptides'}
                </p>
                {suggestions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted">No peptide matches “{query.trim()}”.</p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {suggestions.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setSuggestOpen(false)}
                          className="flex items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-brand-tint"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                            <FlaskIcon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-content">{item.name}</span>
                              {splitCategories(item.category).map((category) => (
                                <span
                                  key={category}
                                  className="rounded-pill bg-surface-sunken px-2 py-0.5 text-micro font-bold text-muted"
                                >
                                  {category}
                                </span>
                              ))}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {item.vendorCount} {item.vendorCount === 1 ? 'supplier' : 'suppliers'}
                              {item.doseLabels[0] ? ` · ${item.doseLabels[0]}` : ''}
                            </span>
                          </span>
                          <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex shrink-0 items-center gap-2 rounded-card border border-line bg-surface px-4 py-3 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
          >
            <SlidersIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Filter &amp; Sort</span>
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-brand px-1.5 text-micro font-bold text-surface">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {products.length > 0 ? (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto px-1 py-1 scrollbar-hide">
            <span className="shrink-0 text-xs font-semibold uppercase text-faint">Popular:</span>
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-content transition-colors hover:border-brand hover:bg-brand hover:text-surface"
              >
                {product.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      </div>
      </div>

      {/* mt-5 (20px) on mobile: 20px less than the mt-10 kept from sm up. */}
      <section className="mx-auto mt-5 max-w-shell px-4 pb-4 sm:mt-10">
        <p className="mb-5 text-sm font-semibold text-muted">
          {sorted.length} compound{sorted.length === 1 ? '' : 's'}
        </p>

        {sorted.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No compounds match these filters.
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.heading ?? 'all'}>
                {group.heading ? (
                  <h2 className="mb-3 text-micro font-bold uppercase text-faint">{group.heading}</h2>
                ) : null}
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((p) => (
                    <li key={p.slug}>
                      <ProductCardView data={p} view={sort.view} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <FilterSortPopup
        open={open}
        onClose={() => setOpen(false)}
        filter={filter}
        sort={sort}
        onApply={(nextFilter, nextSort) => {
          setFilter(nextFilter);
          setSort(nextSort);
        }}
        categoryFacets={categoryFacets}
        supplierFacets={supplierFacets}
        doseFacets={doseFacets}
      />
    </>
  );
}
