'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'peplookup:watchlist';
const CHANGE_EVENT = 'peplookup:watchlist-change';

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    // Private windows and blocked site data both throw here. An empty
    // watchlist is the correct fallback, not a crash.
    return [];
  }
}

function write(slugs: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage full or blocked: the in-memory state still updates for this view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Per-viewer convenience only. This never leaves the browser, so it is the
 * right home for a saved-vendor list and the wrong home for anything that must
 * survive a device change.
 */
export function useWatchlist() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlugs(read());
    setReady(true);

    // Keep every card and the watchlist page in sync within one tab, and
    // across tabs via the native storage event.
    const sync = () => setSlugs(read());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const next = read();
    const index = next.indexOf(slug);
    if (index === -1) next.push(slug);
    else next.splice(index, 1);
    write(next);
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, has, toggle, ready };
}
