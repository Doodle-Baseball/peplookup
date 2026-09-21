'use client';

import { useWatchlist } from '@/lib/use-watchlist';
import { cn } from '@/lib/cn';

/** Past this the badge would outgrow the heart it sits on, so it caps. */
const MAX_DISPLAYED = 99;

/** Small pill showing how many items are saved. Renders nothing at zero. */
export function WatchlistCountBadge({ className }: { className?: string }) {
  const { slugs, ready } = useWatchlist();
  if (!ready || slugs.length === 0) return null;

  const count = slugs.length;
  const label = count > MAX_DISPLAYED ? `${MAX_DISPLAYED}+` : String(count);

  return (
    <span
      // A bare digit tells a screen reader nothing, so the accessible name
      // carries the meaning and the glyph itself is hidden from it.
      role="status"
      aria-label={`${count} item${count === 1 ? '' : 's'} saved to your watchlist`}
      style={{ fontFamily: 'SFMono-Regular' }}
      className={cn(
        // The ring cuts a clean edge around the badge wherever it overlaps the heart icon
        // behind it, rather than the two shapes visually fusing into one blob.
        'pointer-events-none inline-flex h-4 min-w-4 shrink-0 items-center justify-center',
        'rounded-pill bg-brand px-1 text-micro font-bold leading-none text-surface',
        'tabular-nums ring-2 ring-surface',
        className,
      )}
    >
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
