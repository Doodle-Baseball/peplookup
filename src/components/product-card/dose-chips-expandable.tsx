'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/** Sizes shown before the "+N more" chip. */
const VISIBLE_DOSES = 8;

/**
 * Dosage-chip row for the product page's price comparison. Selecting a chip
 * filters the listings in place without touching the URL, and "+N more"
 * expands the full list, matching the homepage product card's dose expansion.
 */
export function DoseChipsExpandable({
  doses,
  selectedKey,
  onSelect,
}: {
  doses: { key: string; label: string }[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  // A selected size past the cut-off would be hidden, so the row opens expanded.
  const selectedIndex = doses.findIndex((dose) => dose.key === selectedKey);
  const [isExpanded, setIsExpanded] = useState(selectedIndex >= VISIBLE_DOSES);
  const visibleDoses = isExpanded ? doses : doses.slice(0, VISIBLE_DOSES);
  const hiddenCount = doses.length - visibleDoses.length;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {visibleDoses.map((dose) => (
        <button
          key={dose.key}
          type="button"
          aria-pressed={selectedKey === dose.key}
          onClick={() => onSelect(dose.key)}
          className={cn(
            'h-fit rounded-full border px-3.5 py-2 text-sm font-bold transition-all',
            selectedKey === dose.key
              ? 'border-content bg-content text-surface shadow-sm'
              : 'border-line bg-surface text-content hover:border-brand hover:bg-brand hover:text-surface',
          )}
        >
          {dose.label}
        </button>
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label={`Show ${hiddenCount} more sizes`}
          className="h-fit rounded-full border border-dashed border-brand bg-surface px-3.5 py-2 text-sm font-bold text-brand transition-all hover:border-solid hover:bg-brand hover:text-surface"
        >
          +{hiddenCount} more
        </button>
      ) : null}
    </div>
  );
}
