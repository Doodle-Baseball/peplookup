'use client';

import { createContext, useCallback, useContext, useMemo, useState, type FormEvent, type ReactNode } from 'react';

interface SupplierDirectoryState {
  query: string;
  /** Sets the search and goes back to the first page of results. */
  setQuery: (query: string) => void;
  page: number;
  setPage: (page: number) => void;
}

const SupplierDirectoryContext = createContext<SupplierDirectoryState | null>(null);

/**
 * The /suppliers search text and page number, shared by the search box, the
 * popular-supplier chips and the results below. Kept in state rather than the
 * URL so searching and paging leave the address bar alone; an old `?q=` or
 * `?page=` link still opens on the view it points to.
 */
export function SupplierDirectoryProvider({
  initialQuery,
  initialPage,
  children,
}: {
  initialQuery: string;
  initialPage: number;
  children: ReactNode;
}) {
  const [query, setQueryState] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const setQuery = useCallback((next: string) => {
    setQueryState(next);
    setPage(1);
  }, []);
  const value = useMemo(() => ({ query, setQuery, page, setPage }), [query, setQuery, page]);
  return <SupplierDirectoryContext.Provider value={value}>{children}</SupplierDirectoryContext.Provider>;
}

export function useSupplierDirectory(): SupplierDirectoryState {
  const state = useContext(SupplierDirectoryContext);
  if (!state) throw new Error('useSupplierDirectory must be used inside SupplierDirectoryProvider.');
  return state;
}

/** The directory's search form: results already update as you type, so submitting only keeps the page where it is. */
export function SupplierDirectorySearchForm({ children }: { children: ReactNode }) {
  return (
    <form role="search" onSubmit={(event: FormEvent) => event.preventDefault()}>
      {children}
    </form>
  );
}
