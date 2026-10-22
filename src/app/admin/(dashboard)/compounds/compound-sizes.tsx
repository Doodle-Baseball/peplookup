'use client';

import { useState } from 'react';

/** Sizes listed before the rest fold behind a "+N more" button. */
const VISIBLE_SIZES = 3;

export function CompoundSizes({ name, sizes }: { name: string; sizes: readonly string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCount = sizes.length - VISIBLE_SIZES;
  const shown = isExpanded || hiddenCount <= 0 ? sizes : sizes.slice(0, VISIBLE_SIZES);

  return (
    <span>
      {shown.join(', ')}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Show fewer ${name} sizes` : `Show ${hiddenCount} more ${name} sizes`}
          className="ml-1.5 whitespace-nowrap text-xs font-bold text-brand hover:underline"
        >
          {isExpanded ? 'Show less' : `+${hiddenCount} more`}
        </button>
      ) : null}
    </span>
  );
}
