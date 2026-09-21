'use client';

import { useState } from 'react';
import Link from 'next/link';
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
 * list collapses to `COLLAPSED_COUNT` until expanded. Selecting a chip navigates
 * (filter state is URL-driven); expanding does not.
 */
export function SupplierChipsExpandable({
  suppliers,
  selectedSlug,
  allHref,
}: {
  suppliers: { slug: string; name: string; href: string }[];
  selectedSlug: string | null;
  allHref: string;
}) {
  const [expanded, setExpanded] = useState(false);

  // A selected supplier past the cut would otherwise vanish from its own filter.
  const selectedIndex = suppliers.findIndex((s) => s.slug === selectedSlug);
  const cut = selectedIndex >= COLLAPSED_COUNT ? selectedIndex + 1 : COLLAPSED_COUNT;
  const visible = expanded ? suppliers : suppliers.slice(0, cut);
  const hiddenCount = suppliers.length - visible.length;

  return (
    <div className="scrollbar-hide -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link href={allHref} scroll={false} className={chipClass(!selectedSlug)}>
        All suppliers
      </Link>
      {visible.map((supplier) => (
        <Link
          key={supplier.slug}
          href={supplier.href}
          scroll={false}
          className={chipClass(selectedSlug === supplier.slug)}
        >
          {supplier.name}
        </Link>
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
