'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Supplier } from '@/lib/schema';
import { ArrowRightIcon, CheckIcon, CopyIcon, ExternalIcon, SearchIcon } from '@/components/icons/icons';

/** Every supplier shown here is guaranteed by the page to carry a coupon. */
export type CouponVendor = Supplier & {
  coupon: NonNullable<Supplier['coupon']>;
  /** Live listings this vendor has in the offers table, used as a catalogue-size signal. */
  listingCount: number;
};

type SortKey = 'discount' | 'listings' | 'name';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'discount', label: 'Biggest discount' },
  { key: 'listings', label: 'Largest catalogue' },
  { key: 'name', label: 'A–Z' },
];

/**
 * Code row for a coupon card: the code reads first, the copy affordance sits
 * on the right. Separate from the shared `CopyCode` chip, which is sized for
 * a dense supplier card rather than a full-width block.
 */
function CouponCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard is unavailable over plain HTTP and in some embedded views.
      // The code stays visible as text, so it can still be selected by hand.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Copied coupon code ${code}` : `Copy coupon code ${code}`}
      className="flex w-full items-center justify-between gap-3 rounded-chip border border-dashed border-coupon/60 bg-surface px-3.5 py-3 text-left transition-colors hover:border-coupon hover:bg-coupon-tint"
    >
      <span className="min-w-0 truncate font-mono text-sm font-bold text-content">{code}</span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-coupon-ink" aria-live="polite">
        {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}

export function CouponBrowser({ vendors }: { vendors: CouponVendor[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('discount');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? vendors.filter(
          (vendor) =>
            vendor.name.toLowerCase().includes(q) ||
            vendor.coupon.code.toLowerCase().includes(q) ||
            (vendor.description ?? '').toLowerCase().includes(q),
        )
      : vendors;

    return [...matched].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'listings') return b.listingCount - a.listingCount || a.name.localeCompare(b.name);
      return b.coupon.percentOff - a.coupon.percentOff || b.listingCount - a.listingCount;
    });
  }, [vendors, query, sort]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* No focus-within:border-brand here, and the input below clears the
            global input focus ring: the bar is asked to look identical focused
            and unfocused. */}
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-pill border border-line bg-surface-raised px-5 py-3.5 shadow-card">
          <SearchIcon className="h-5 w-5 shrink-0 text-faint" />
          <label htmlFor="coupon-search" className="sr-only">
            Search vendors and coupon codes
          </label>
          <input
            id="coupon-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a vendor or code…"
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

        <div className="flex shrink-0 gap-1 rounded-pill border border-line bg-surface p-1">
          {SORTS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              aria-pressed={sort === option.key}
              className={`rounded-pill px-3 py-2 text-xs font-bold transition-colors ${
                sort === option.key ? 'bg-brand text-surface' : 'text-muted hover:text-content'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        <span className="font-bold text-content">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'vendor' : 'vendors'} with an active code
        {query ? ` matching “${query}”` : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
          No vendor or code matches “{query}”.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor) => (
            <li
              key={vendor.slug}
              className="flex flex-col rounded-card border border-line bg-surface-raised p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-black leading-tight text-content">{vendor.name}</h2>
                <span className="shrink-0 rounded-pill bg-coupon-tint px-3 py-1 text-xs font-bold text-coupon-ink">
                  {vendor.coupon.percentOff}% Off Sitewide
                </span>
              </div>

              {vendor.description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{vendor.description}</p>
              ) : null}

              <div className="mt-5">
                <CouponCodeBlock code={vendor.coupon.code} />
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <a
                  href={vendor.affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white"
                >
                  Shop Now
                  <ExternalIcon className="h-4 w-4" />
                </a>
                <Link
                  href={`/suppliers/${vendor.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand-strong transition-colors hover:text-brand"
                >
                  Full details
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
