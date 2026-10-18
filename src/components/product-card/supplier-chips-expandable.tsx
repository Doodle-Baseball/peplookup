'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/** Chips shown before the "+N more" toggle. Roughly two rows on a desktop width. */
const COLLAPSED_COUNT = 11;

function chipClass(isSelected: boolean) {
  return cn(
    'shrink-0 rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors',
    isSelected ? 'border-brand bg-brand text-surface' : 'border-line bg-surface text-content hover:border-brand',
  );
}

/**
 * Supplier filter for the product page's price table. A popular compound is carried
 * by sixty-plus vendors, which buries the first price under a wall of chips, so the
 * list collapses to `COLLAPSED_COUNT` until expanded. Selecting a chip filters the
 * listings in place without touching the URL.
 */
export function SupplierChipsExpandable({
  suppliers,
  selectedSlug,
  onSelect,
}: {
  suppliers: { slug: string; name: string }[];
  selectedSlug: string | null;
  /** Null selects "All suppliers". */
  onSelect: (slug: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // A selected supplier past the cut would otherwise vanish from its own filter.
  const selectedIndex = suppliers.findIndex((s) => s.slug === selectedSlug);
  const cut = selectedIndex >= COLLAPSED_COUNT ? selectedIndex + 1 : COLLAPSED_COUNT;
  const visible = expanded ? suppliers : suppliers.slice(0, cut);
  const hiddenCount = suppliers.length - visible.length;

  return (
    <div className="scrollbar-hide -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        type="button"
        aria-pressed={!selectedSlug}
        onClick={() => onSelect(null)}
        className={chipClass(!selectedSlug)}
      >
        All suppliers
      </button>
      {visible.map((supplier) => (
        <button
          key={supplier.slug}
          type="button"
          aria-pressed={selectedSlug === supplier.slug}
          onClick={() => onSelect(supplier.slug)}
          className={chipClass(selectedSlug === supplier.slug)}
        >
          {supplier.name}
        </button>
      ))}
      {hiddenCount > 0 ? (
        <button type="button" onClick={() => setExpanded(true)} className={cn(chipClass(false), 'border-dashed')}>
          +{hiddenCount} more
        </button>
      ) : null}
      {expanded && suppliers.length > COLLAPSED_COUNT ? (
        <button type="button" onClick={() => setExpanded(false)} className={cn(chipClass(false), 'border-dashed')}>
          Show less
        </button>
      ) : null}
    </div>
  );
}
