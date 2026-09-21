'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, CloseIcon, SlidersIcon } from '@/components/icons/icons';

export interface FilterState {
  inStockOnly: boolean;
  blendsOnly: boolean;
  likesOnly: boolean;
  usOnly: boolean;
  hasCoupon: boolean;
  categories: string[];
  suppliers: string[];
  doses: string[];
  priceMin: string;
  priceMax: string;
}

export interface SortState {
  view: 'total' | 'permg';
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  groupBy: 'none' | 'category';
}

export const DEFAULT_FILTER: FilterState = {
  inStockOnly: false,
  blendsOnly: false,
  likesOnly: false,
  usOnly: false,
  hasCoupon: false,
  categories: [],
  suppliers: [],
  doses: [],
  priceMin: '',
  priceMax: '',
};

export const DEFAULT_SORT: SortState = {
  view: 'total',
  sortBy: 'featured',
  groupBy: 'none',
};

interface Facet {
  value: string;
  label: string;
  count: number;
}

const QUICK_TOGGLES: { key: keyof FilterState; label: string }[] = [
  { key: 'inStockOnly', label: 'In Stock Only' },
  { key: 'blendsOnly', label: 'Blends Only' },
  { key: 'likesOnly', label: 'Likes Only' },
  { key: 'usOnly', label: 'US Manufacturer Only' },
  { key: 'hasCoupon', label: 'Has Coupon' },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-faint">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function FilterSortPopup({
  open,
  onClose,
  filter,
  sort,
  onApply,
  categoryFacets,
  supplierFacets,
  doseFacets,
}: {
  open: boolean;
  onClose: () => void;
  filter: FilterState;
  sort: SortState;
  onApply: (filter: FilterState, sort: SortState) => void;
  categoryFacets: Facet[];
  supplierFacets: Facet[];
  doseFacets: Facet[];
}) {
  const [tab, setTab] = useState<'filter' | 'sort'>('filter');
  const [draftFilter, setDraftFilter] = useState<FilterState>(filter);
  const [draftSort, setDraftSort] = useState<SortState>(sort);

  // Re-seed the draft from the applied state every time the popup opens, so
  // Cancel truly discards in-progress edits instead of leaking them.
  useEffect(() => {
    if (open) {
      setDraftFilter(filter);
      setDraftSort(sort);
    }
  }, [open, filter, sort]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  function clearAll() {
    setDraftFilter(DEFAULT_FILTER);
    setDraftSort(DEFAULT_SORT);
  }

  function apply() {
    onApply(draftFilter, draftSort);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort"
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-surface-raised shadow-lift"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-raised p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
              <SlidersIcon className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-lg font-black text-content">Filter &amp; Sort</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-pill border border-line px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-chip p-1.5 text-muted transition-colors hover:bg-surface-sunken hover:text-content"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-line bg-surface-raised px-5 pb-3 pt-4">
          <div className="inline-flex rounded-chip border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => setTab('filter')}
              className={`rounded-chip px-4 py-1.5 text-sm font-bold transition-colors ${
                tab === 'filter' ? 'bg-brand text-white' : 'text-muted hover:text-content'
              }`}
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => setTab('sort')}
              className={`rounded-chip px-4 py-1.5 text-sm font-bold transition-colors ${
                tab === 'sort' ? 'bg-brand text-white' : 'text-muted hover:text-content'
              }`}
            >
              Sort
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface-sunken/40 p-5">
          {tab === 'filter' ? (
            <div className="space-y-4">
              <Card title="Quick filters">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_TOGGLES.map(({ key, label }) => {
                    const checked = draftFilter[key] as boolean;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDraftFilter({ ...draftFilter, [key]: !checked })}
                        aria-pressed={checked}
                        className={`flex items-center gap-2.5 rounded-chip border px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                          checked
                            ? 'border-brand bg-brand text-white'
                            : 'border-line bg-surface text-content hover:border-brand/50'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked ? 'border-white/60 bg-white/15' : 'border-line'
                          }`}
                        >
                          {checked ? <CheckIcon className="h-3 w-3" /> : null}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Card>

              <FacetCard
                title="Categories"
                facets={categoryFacets}
                selected={draftFilter.categories}
                onChange={(next) => setDraftFilter({ ...draftFilter, categories: next })}
              />
              <FacetCard
                title="Suppliers"
                facets={supplierFacets}
                selected={draftFilter.suppliers}
                onChange={(next) => setDraftFilter({ ...draftFilter, suppliers: next })}
              />
              <FacetCard
                title="Dosages"
                facets={doseFacets}
                selected={draftFilter.doses}
                onChange={(next) => setDraftFilter({ ...draftFilter, doses: next })}
              />

              <Card title="Price range">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-muted">Min</label>
                    <div className="mt-1 flex items-center gap-1.5 rounded-chip border border-line bg-surface px-3.5 py-2.5 shadow-sm transition-shadow focus-within:shadow-lift">
                      <span className="text-sm font-bold text-faint">$</span>
                      <input
                        type="number"
                        min={0}
                        value={draftFilter.priceMin}
                        onChange={(e) => setDraftFilter({ ...draftFilter, priceMin: e.target.value })}
                        className="w-full bg-transparent text-sm font-bold text-content outline-none"
                      />
                    </div>
                  </div>
                  <span aria-hidden="true" className="mt-5 h-px w-3 shrink-0 bg-line" />
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-muted">Max</label>
                    <div className="mt-1 flex items-center gap-1.5 rounded-chip border border-line bg-surface px-3.5 py-2.5 shadow-sm transition-shadow focus-within:shadow-lift">
                      <span className="text-sm font-bold text-faint">$</span>
                      <input
                        type="number"
                        min={0}
                        value={draftFilter.priceMax}
                        onChange={(e) => setDraftFilter({ ...draftFilter, priceMax: e.target.value })}
                        className="w-full bg-transparent text-sm font-bold text-content outline-none"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <Card title="Show prices by">
                <div className="flex rounded-chip border border-line bg-surface p-1 text-sm">
                  {(['total', 'permg'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDraftSort({ ...draftSort, view: v })}
                      className={`flex-1 rounded-chip px-3 py-1.5 font-bold transition-colors ${
                        draftSort.view === v ? 'bg-brand text-white' : 'text-muted hover:text-content'
                      }`}
                    >
                      {v === 'total' ? 'Total' : 'Per mg'}
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Sort cards by">
                <select
                  id="sortBy"
                  value={draftSort.sortBy}
                  onChange={(e) => setDraftSort({ ...draftSort, sortBy: e.target.value as SortState['sortBy'] })}
                  className="w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-content outline-none transition-colors focus:border-brand"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </Card>

              <Card title="Group by">
                <select
                  id="groupBy"
                  value={draftSort.groupBy}
                  onChange={(e) => setDraftSort({ ...draftSort, groupBy: e.target.value as SortState['groupBy'] })}
                  className="w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-content outline-none transition-colors focus:border-brand"
                >
                  <option value="none">None</option>
                  <option value="category">By Category</option>
                </select>
              </Card>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-surface-raised p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-chip border border-line px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={apply}
            className="btn-3d flex-1 rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
          >
            Apply Filter &amp; Sort
          </button>
        </div>
      </div>
    </div>
  );
}

function FacetCard({
  title,
  facets,
  selected,
  onChange,
}: {
  title: string;
  facets: Facet[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  if (facets.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-faint">{title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(facets.map((f) => f.value))}
            className="rounded-pill px-2 py-0.5 text-micro font-bold uppercase text-brand transition-colors hover:bg-brand-soft"
          >
            Select All
          </button>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-pill px-2 py-0.5 text-micro font-bold uppercase text-muted transition-colors hover:bg-surface-sunken"
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="mt-3 max-h-40 space-y-1 overflow-y-auto pr-1">
        {facets.map((facet) => {
          const checked = selected.includes(facet.value);
          return (
            <label
              key={facet.value}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-chip px-2.5 py-2 text-sm font-semibold transition-colors ${
                checked ? 'bg-brand-soft text-brand-strong' : 'text-content hover:bg-surface-sunken'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(toggle(selected, facet.value))}
                  className="h-3.5 w-3.5 shrink-0 rounded border-line text-brand focus:ring-brand"
                />
                <span className="truncate">{facet.label}</span>
              </span>
              <span
                className={`shrink-0 rounded-pill px-1.5 py-0.5 text-micro font-bold ${
                  checked ? 'bg-brand text-white' : 'bg-surface-sunken text-faint'
                }`}
              >
                {facet.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
