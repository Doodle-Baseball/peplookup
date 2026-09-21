'use client';

import { useWatchlist, type WatchlistKind } from '@/lib/use-watchlist';
import { HeartIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

export function FavoriteButton({
  slug,
  name,
  kind = 'supplier',
  className,
}: {
  slug: string;
  name: string;
  kind?: WatchlistKind;
  className?: string;
}) {
  const { has, toggle, ready } = useWatchlist();
  const saved = has(slug, kind);

  return (
    <button
      type="button"
      onClick={() => toggle(slug, kind)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
      className={cn(
        'group/fav inline-flex shrink-0 items-center justify-center rounded-chip p-1.5 transition-colors',
        saved ? 'text-danger' : 'text-faint hover:text-brand',
        // Avoid a flash of the wrong state before storage is read.
        !ready && 'opacity-0',
        className,
      )}
    >
      <HeartIcon
        className={cn(
          'h-5 w-5 transition-colors',
          saved ? 'fill-current' : 'fill-none group-hover/fav:fill-current',
        )}
      />
    </button>
  );
}
