import { StarIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';
import { starFills } from '@/components/ui/star-fill';

/**
 * Five stars filled to `rating`, including partial fills, a 4.3 shows four
 * full stars and the fifth 30% filled, never five. Each star is filled on its
 * own: clipping the whole row by percentage counted the gaps between stars,
 * so the last star came out emptier (or fuller) than the score.
 */
export function StarRating({
  rating,
  className,
  starClassName = 'h-3.5 w-3.5',
}: {
  rating: number;
  className?: string;
  starClassName?: string;
}) {
  const fills = starFills(rating);
  const clamped = fills.reduce((total, fill) => total + fill, 0);

  return (
    <span
      role="img"
      aria-label={`${Math.round(clamped * 10) / 10} out of 5 stars`}
      className={cn('inline-flex shrink-0 items-center gap-0.5', className)}
    >
      {fills.map((fill, index) => (
        <span key={index} aria-hidden="true" className="relative inline-flex">
          <StarIcon className={cn(starClassName, 'fill-current text-line')} />
          <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <StarIcon className={cn(starClassName, 'fill-current text-rating')} />
          </span>
        </span>
      ))}
    </span>
  );
}
