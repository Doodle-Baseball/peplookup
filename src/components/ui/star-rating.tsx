import { StarIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

const STARS = [0, 1, 2, 3, 4];

/**
 * Five stars filled to `rating`, including partial fills, a 4.5 shows as four
 * and a half rather than rounding to a number the vendor never claimed. The
 * fill is a clipped overlay of the same row, so half a star is a real half
 * rather than a separate glyph.
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
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <span
      role="img"
      aria-label={`${clamped} out of 5 stars`}
      className={cn('relative inline-flex shrink-0 items-center', className)}
    >
      <span aria-hidden="true" className="flex items-center gap-0.5 text-line">
        {STARS.map((index) => (
          <StarIcon key={index} className={cn(starClassName, 'fill-current')} />
        ))}
      </span>

      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${(clamped / 5) * 100}%` }}
      >
        <span className="flex w-max items-center gap-0.5 text-rating">
          {STARS.map((index) => (
            <StarIcon key={index} className={cn(starClassName, 'fill-current')} />
          ))}
        </span>
      </span>
    </span>
  );
}
