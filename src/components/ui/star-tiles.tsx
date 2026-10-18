import { StarIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

const TILES = [0, 1, 2, 3, 4];

/**
 * Trustpilot-style rating: five square tiles, each a white star on a filled
 * square. Partial ratings fill the last tile partway, so a 4.5 shows four and
 * a half tiles rather than rounding to a number the reviewer never gave.
 */
export function StarTiles({ rating, className }: { rating: number; className?: string }) {
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <span role="img" aria-label={`${clamped} out of 5 stars`} className={cn('inline-flex shrink-0 gap-0.5', className)}>
      {TILES.map((index) => {
        const fill = Math.min(1, Math.max(0, clamped - index));
        return (
          <span
            key={index}
            aria-hidden="true"
            className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm bg-line"
          >
            <span className="absolute inset-y-0 left-0 bg-rating" style={{ width: `${fill * 100}%` }} />
            <StarIcon className="relative h-3.5 w-3.5 fill-current text-surface" />
          </span>
        );
      })}
    </span>
  );
}
