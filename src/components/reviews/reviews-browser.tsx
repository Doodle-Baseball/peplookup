'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { StarRating } from '@/components/ui/star-rating';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { ArrowRightIcon, ChevronDownIcon, ExternalIcon, SearchIcon, StarIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';
import { reviewsPagePath } from '@/lib/review-pages';

/** What a vendor card needs; plain data so the server page can pass it across. */
export interface ReviewVendor {
  slug: string;
  name: string;
  logo: string | null;
  /** Out of 5; null when no rating is on record. */
  rating: number | null;
  /** "1,200+" style text, or null when no count is on record. */
  reviewCountText: string | null;
  /** Numeric review count for sorting; 0 when unknown. */
  reviewCountValue: number;
  /** Already resolved to the site's outbound redirect. */
  shopHref: string;
}

type SortKey = 'rating' | 'reviews' | 'name';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Top rated' },
  { key: 'reviews', label: 'Most reviews' },
  { key: 'name', label: 'A–Z' },
];

const PAGE_SIZE = 24;

function compareVendors(sort: SortKey) {
  return (a: ReviewVendor, b: ReviewVendor): number => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    // Unrated vendors sort last under either numeric order, never as a zero.
    const aRated = a.rating !== null;
    const bRated = b.rating !== null;
    if (aRated !== bRated) return aRated ? -1 : 1;
    if (sort === 'reviews') {
      return b.reviewCountValue - a.reviewCountValue || (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name);
    }
    return (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCountValue - a.reviewCountValue || a.name.localeCompare(b.name);
  };
}

export function ReviewsBrowser({ vendors }: { vendors: ReviewVendor[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('rating');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle ? vendors.filter((vendor) => vendor.name.toLowerCase().includes(needle)) : vendors;
    return [...matched].sort(compareVendors(sort));
  }, [vendors, query, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-pill border border-line bg-surface-raised px-5 py-3.5 shadow-card">
          <SearchIcon className="h-5 w-5 shrink-0 text-faint" />
          <label htmlFor="review-search" className="sr-only">
            Search suppliers
          </label>
          <input
            id="review-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search a supplier…"
            className="min-w-0 flex-1 bg-transparent text-base text-content outline-none placeholder:text-faint focus-visible:ring-0"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="shrink-0 rounded-pill px-2 py-1 text-xs font-bold uppercase text-muted transition-colors hover:text-content"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div role="group" aria-label="Sort suppliers" className="flex shrink-0 gap-1 overflow-x-auto rounded-pill border border-line bg-surface p-1">
          {SORTS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              aria-pressed={sort === option.key}
              className={cn(
                'shrink-0 rounded-pill px-3 py-2 text-xs font-bold transition-colors',
                sort === option.key ? 'bg-brand text-surface' : 'text-muted hover:text-content',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        <span className="font-bold text-content">{filtered.length}</span> {filtered.length === 1 ? 'supplier' : 'suppliers'}
        {query ? ` matching “${query}”` : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
          No supplier matches “{query}”.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((vendor, index) => (
            <li
              key={vendor.slug}
              className="animate-fade-up flex flex-col rounded-card border border-line bg-surface-raised p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift sm:p-6"
              // Staggered entrance, capped so a long list doesn't make the last cards wait seconds.
              style={{ animationDelay: `${Math.min(index % PAGE_SIZE, 8) * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <SupplierLogo
                  src={vendor.logo}
                  name={vendor.name}
                  alt={`${vendor.name} logo`}
                  size={56}
                  className="h-14 w-14 shrink-0 rounded-chip bg-surface shadow-sm"
                  initialClassName="text-lg"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black leading-tight text-content">
                    <Link href={reviewsPagePath(vendor.slug)} className="transition-colors hover:text-accent">
                      {vendor.name}
                    </Link>
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-muted">Overall rating</p>
                </div>
              </div>

              <div className="mt-5 rounded-chip border border-line bg-surface px-4 py-3">
                {vendor.rating !== null ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black leading-none text-content">{vendor.rating.toFixed(1)}</span>
                      <span className="text-xs font-bold text-muted">/ 5</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StarRating rating={vendor.rating} starClassName="h-4 w-4" />
                      <span className="text-xs text-muted">
                        {vendor.reviewCountText ? `${vendor.reviewCountText} reviews` : 'Review count not listed'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <StarIcon className="h-4 w-4 text-line" />
                    Not rated yet
                  </p>
                )}
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                <a
                  href={vendor.shopHref}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white"
                >
                  Shop Now
                  <ExternalIcon className="h-4 w-4" />
                </a>
                <Link
                  href={reviewsPagePath(vendor.slug)}
                  className="group/details inline-flex items-center gap-1 text-sm font-bold text-accent-strong transition-colors hover:text-accent"
                >
                  Full details
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/details:translate-x-0.5" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > shown.length ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-6 py-3 text-sm font-bold text-content shadow-card transition-colors hover:border-accent hover:text-accent-strong"
          >
            Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more suppliers
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}
