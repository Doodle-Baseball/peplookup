import { StarIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';
import { starFills } from '@/components/ui/star-fill';

/**
 * Trustpilot-style rating: five square tiles, each a white star on a filled
 * square. Partial ratings fill the last tile partway, so a 4.5 shows four and
 * a half tiles rather than rounding to a number the reviewer never gave.
 */
export function StarTiles({ rating, className }: { rating: number; className?: string }) {
  const fills = starFills(rating);
  const clamped = fills.reduce((total, fill) => total + fill, 0);

  return (
    <span
      role="img"
      aria-label={`${Math.round(clamped * 10) / 10} out of 5 stars`}
      className={cn('inline-flex shrink-0 gap-0.5', className)}
    >
      {fills.map((fill, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm bg-line"
        >
          <span className="absolute inset-y-0 left-0 bg-rating" style={{ width: `${fill * 100}%` }} />
          <StarIcon className="relative h-3.5 w-3.5 fill-current text-surface" />
        </span>
      ))}
    </span>
  );
}
