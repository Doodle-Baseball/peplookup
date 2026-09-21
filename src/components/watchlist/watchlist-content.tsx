'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/lib/use-watchlist';
import { SupplierCard } from '@/components/supplier-card/supplier-card';
import { ProductPreviewCard } from '@/components/product-card/product-preview-card';
import type { Product, Supplier } from '@/lib/schema';
import { HeartIcon, ArrowRightIcon, FlaskIcon, StoreIcon } from '@/components/icons/icons';

interface SupplierRow {
  supplier: Supplier;
  productCount: number;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; supplierRows: SupplierRow[]; products: Product[] };

/**
 * Renders the four required states explicitly: loading, error, empty (no
 * saved suppliers or compounds) and loaded. Empty is the state most
 * watchlists actually land in on a fresh browser, so it gets real copy
 * rather than a blank grid.
 */
export function WatchlistContent() {
  const { items, ready } = useWatchlist();

  // Only the slugs actually saved, so the requests below ask for a handful of
  // records instead of the whole supplier directory and product catalogue -
  // the previous version fetched everything on every visit and filtered
  // client-side, which meant a watchlist of two items still downloaded the
  // entire site's worth of suppliers and products first.
  const supplierSlugs = useMemo(
    () => items.filter((i) => i.kind === 'supplier').map((i) => i.slug),
    [items],
  );
  const productSlugs = useMemo(() => items.filter((i) => i.kind === 'product').map((i) => i.slug), [items]);
  // Joined to a stable string so the effect below only re-runs when the actual
  // saved set changes, not on every new (but equal) array from useWatchlist.
  const supplierKey = supplierSlugs.join(',');
  const productKey = productSlugs.join(',');

  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!ready) return;

    // Nothing saved: skip the network entirely rather than firing two
    // requests just to learn that the empty state should render.
    if (!supplierKey && !productKey) {
      setState({ status: 'loaded', supplierRows: [], products: [] });
      return;
    }

    let cancelled = false;

    // A stale, browser-cached list is the classic way a just-favorited item
    // seems to vanish, so both requests explicitly bypass the HTTP cache.
    const fetchJson = <T,>(url: string) =>
      fetch(url, { cache: 'no-store' }).then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<T>;
      });

    // Settled independently: one endpoint erroring shouldn't hide saved items
    // that the other endpoint returned successfully. Skipped altogether when
    // that kind has nothing saved, rather than asking the API for an empty set.
    Promise.allSettled([
      supplierKey
        ? fetchJson<SupplierRow[]>(`/api/suppliers?slugs=${encodeURIComponent(supplierKey)}`)
        : Promise.resolve([]),
      productKey
        ? fetchJson<Product[]>(`/api/products?slugs=${encodeURIComponent(productKey)}`)
        : Promise.resolve([]),
    ]).then(([supplierResult, productResult]) => {
      if (cancelled) return;
      if (supplierResult.status === 'rejected' && productResult.status === 'rejected') {
        setState({ status: 'error' });
        return;
      }
      setState({
        status: 'loaded',
        supplierRows: supplierResult.status === 'fulfilled' ? supplierResult.value : [],
        products: productResult.status === 'fulfilled' ? productResult.value : [],
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, supplierKey, productKey]);

  if (!ready || state.status === 'loading') {
    return (
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
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

  // Already exactly the saved set: both endpoints were asked for these slugs
  // specifically, so no further client-side filtering is needed here.
  const savedSuppliers = state.supplierRows;
  const savedProducts = state.products;

  if (items.length === 0 || (savedSuppliers.length === 0 && savedProducts.length === 0)) {
    return (
      <div className="rounded-card border border-dashed border-line bg-surface-raised p-12 text-center">
        <HeartIcon className="mx-auto h-8 w-8 text-faint" />
        <p className="mt-3 font-semibold text-content">Your watchlist is empty</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Tap the heart icon on any supplier or compound card to save it here. Saved items stay on
          this device only.
        </p>
        <Link
          href="/suppliers"
          className="btn-3d mt-5 inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-white"
        >
          Browse suppliers
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Total counts, each jumping straight to its own section below. */}
      <div className="flex flex-wrap items-center gap-2.5">
        {savedSuppliers.length > 0 ? (
          <a
            href="#watchlist-suppliers"
            className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand hover:text-surface"
          >
            <StoreIcon className="h-4 w-4" />
            {savedSuppliers.length} {savedSuppliers.length === 1 ? 'supplier' : 'suppliers'}
          </a>
        ) : null}
        {savedProducts.length > 0 ? (
          <a
            href="#watchlist-compounds"
            className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand hover:text-surface"
          >
            <FlaskIcon className="h-4 w-4" />
            {savedProducts.length} {savedProducts.length === 1 ? 'compound' : 'compounds'}
          </a>
        ) : null}
      </div>

      <div className="mt-8 space-y-10">
        {savedProducts.length > 0 ? (
          <section id="watchlist-compounds" className="scroll-mt-24">
            <h2 className="text-micro font-bold uppercase text-faint">Compounds</h2>
            <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {savedProducts.map((product) => (
                <li key={product.slug}>
                  <ProductPreviewCard product={product} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {savedSuppliers.length > 0 ? (
          <section id="watchlist-suppliers" className="scroll-mt-24">
            <h2 className="text-micro font-bold uppercase text-faint">Suppliers</h2>
            <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {savedSuppliers.map((row) => (
                <li key={row.supplier.slug}>
                  {/* The heart button on the card itself already removes it from here. */}
                  <SupplierCard supplier={row.supplier} productCount={row.productCount} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
