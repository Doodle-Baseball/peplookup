'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'peplookup:watchlist';
const CHANGE_EVENT = 'peplookup:watchlist-change';

export type WatchlistKind = 'supplier' | 'product';

export interface WatchlistItem {
  kind: WatchlistKind;
  slug: string;
}

function isWatchlistItem(v: unknown): v is WatchlistItem {
  return (
    typeof v === 'object' &&
    v !== null &&
    'kind' in v &&
    'slug' in v &&
    (v.kind === 'supplier' || v.kind === 'product') &&
    typeof v.slug === 'string'
  );
}

function read(): WatchlistItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Back-compat: earlier versions stored a flat string[] of supplier slugs.
    return parsed.flatMap((v): WatchlistItem[] => {
      if (typeof v === 'string') return [{ kind: 'supplier', slug: v }];
      if (isWatchlistItem(v)) return [v];
      return [];
    });
  } catch {
    // Private windows and blocked site data both throw here. An empty
    // watchlist is the correct fallback, not a crash.
    return [];
  }
}

function write(items: WatchlistItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the in-memory state still updates for this view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Per-viewer convenience only. This never leaves the browser, so it is the
 * right home for a saved-item list and the wrong home for anything that must
 * survive a device change. Covers both suppliers and products, distinguished
 * by `kind` so a product and a supplier can never collide on a shared slug.
 */
export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);

    // Keep every card and the watchlist page in sync within one tab, and
    // across tabs via the native storage event.
    const sync = () => setItems(read());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((slug: string, kind: WatchlistKind = 'supplier') => {
    const next = read();
    const index = next.findIndex((i) => i.kind === kind && i.slug === slug);
    if (index === -1) next.push({ kind, slug });
    else next.splice(index, 1);
    write(next);
  }, []);

  const has = useCallback(
    (slug: string, kind: WatchlistKind = 'supplier') =>
      items.some((i) => i.kind === kind && i.slug === slug),
    [items],
  );

  // Every saved slug regardless of kind, right for a total count badge.
  const slugs = items.map((i) => i.slug);

  return { items, slugs, has, toggle, ready };
}
