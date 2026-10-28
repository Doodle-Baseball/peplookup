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
  visibleCount = VISIBLE_DOSES,
  compact = false,
  label,
}: {
  /** `fullLabel` is the spelled-out size when `label` is a short form; it becomes the hover text and accessible name. */
  doses: { key: string; label: string; fullLabel?: string }[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  /** Sizes shown before the "+N more" chip. */
  visibleCount?: number;
  /** Smaller chips, for a size row inside a listing card. */
  compact?: boolean;
  /** Names the row for screen readers, e.g. "Nura Peptide sizes". */
  label?: string;
}) {
  // A selected size past the cut-off would be hidden, so the row opens expanded.
  const selectedIndex = doses.findIndex((dose) => dose.key === selectedKey);
  const [isExpanded, setIsExpanded] = useState(selectedIndex >= visibleCount);
  const visibleDoses = isExpanded ? doses : doses.slice(0, visibleCount);
  const hiddenCount = doses.length - visibleDoses.length;
  const chipSizeClass = compact ? 'px-2 py-1 text-xs' : 'px-3.5 py-2 text-sm';

  return (
    <div role={label ? 'group' : undefined} aria-label={label} className={cn('mt-2 flex flex-wrap', compact ? 'gap-1.5' : 'gap-2')}>
      {visibleDoses.map((dose) => (
        <button
          key={dose.key}
          type="button"
          aria-pressed={selectedKey === dose.key}
          aria-label={dose.fullLabel}
          title={dose.fullLabel}
          onClick={() => onSelect(dose.key)}
          className={cn(
            'h-fit rounded-full border font-bold transition-all',
            chipSizeClass,
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
          className={cn(
            'h-fit rounded-full border border-dashed border-brand bg-surface font-bold text-brand transition-all hover:border-solid hover:bg-brand hover:text-surface',
            chipSizeClass,
          )}
        >
          +{hiddenCount} more
        </button>
      ) : null}
    </div>
  );
}
