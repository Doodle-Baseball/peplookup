'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/lib/use-watchlist';
import { SupplierCard } from '@/components/supplier-card/supplier-card';
import type { Supplier } from '@/lib/schema';
import { HeartIcon, ArrowRightIcon } from '@/components/icons/icons';

interface SupplierRow {
  supplier: Supplier;
  productCount: number;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; rows: SupplierRow[] };

/**
 * Renders the four required states explicitly: loading, error, empty (no
 * saved suppliers) and loaded. Empty is the state most watchlists actually
 * land in on a fresh browser, so it gets real copy rather than a blank grid.
 */
export function WatchlistContent() {
  const { slugs, has, ready } = useWatchlist();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/suppliers')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<SupplierRow[]>;
      })
      .then((rows) => {
        if (!cancelled) setState({ status: 'loaded', rows });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || state.status === 'loading') {
    return (
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            aria-hidden="true"
            className="h-72 animate-pulse rounded-card border border-line bg-surface-sunken"
          />
        ))}
      </ul>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-card border border-dashed border-danger/40 bg-danger/5 p-12 text-center">
        <p className="font-semibold text-danger">Could not load your watchlist right now.</p>
        <p className="mt-1 text-sm text-muted">Refresh the page to try again.</p>
      </div>
    );
  }

  const saved = state.rows.filter((row) => has(row.supplier.slug));

  if (slugs.length === 0 || saved.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-surface-raised p-12 text-center">
        <HeartIcon className="mx-auto h-8 w-8 text-faint" />
        <p className="mt-3 font-semibold text-content">Your watchlist is empty</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Tap the heart icon on any supplier card to save it here. Saved suppliers stay on this
          device only.
        </p>
        <Link
          href="/suppliers"
          className="mt-5 inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-strong"
        >
          Browse suppliers
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {saved.map((row) => (
        <li key={row.supplier.slug}>
          {/* The heart button on the card itself already removes it from here. */}
          <SupplierCard supplier={row.supplier} productCount={row.productCount} />
        </li>
      ))}
    </ul>
  );
}
