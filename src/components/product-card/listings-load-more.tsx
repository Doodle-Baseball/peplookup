'use client';

import { Children, useState } from 'react';

/**
 * Price rows for the product page, capped until the reader asks for the rest.
 * A compound carried by sixty-plus vendors otherwise renders as one endless
 * list. The rows themselves are rendered on the server and passed through as
 * children, so "Load more" only reveals what is already there, no refetch.
 */
export function ListingsLoadMore({
  children,
  initialCount,
}: {
  children: React.ReactNode;
  initialCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = Children.toArray(children);
  const hiddenCount = rows.length - initialCount;

  return (
    <>
      <ul className="mt-4 space-y-2.5">{expanded ? rows : rows.slice(0, initialCount)}</ul>
      {hiddenCount > 0 && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 w-full rounded-pill border border-line bg-surface px-5 py-3 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand hover:text-surface"
        >
          Load more ({hiddenCount} more {hiddenCount === 1 ? 'listing' : 'listings'})
        </button>
      ) : null}
    </>
  );
}
