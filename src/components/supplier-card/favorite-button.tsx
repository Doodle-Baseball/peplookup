'use client';

import { useWatchlist } from '@/lib/use-watchlist';
import { HeartIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

export function FavoriteButton({ slug, name }: { slug: string; name: string }) {
  const { has, toggle, ready } = useWatchlist();
  const saved = has(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
      className={cn(
        'shrink-0 rounded-chip p-1.5 transition',
        saved ? 'text-danger' : 'text-faint hover:text-muted',
        // Avoid a flash of the wrong state before storage is read.
        !ready && 'opacity-0',
      )}
    >
      <HeartIcon className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
