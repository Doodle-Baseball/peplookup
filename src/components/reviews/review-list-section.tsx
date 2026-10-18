import type { SupplierReview } from '@/lib/schema';
import { formatRating, formatReviewDate } from '@/lib/format';
import { StarTiles } from '@/components/ui/star-tiles';
import { ExternalIcon, StarIcon } from '@/components/icons/icons';

/**
 * What customers wrote about one vendor, as individual cards. Shows only
 * reviews we hold, in the order the admin arranged them, and says plainly when
 * there are none, rather than padding the section with placeholders.
 */
export function ReviewListSection({
  supplierName,
  reviews,
  rating,
  reviewCountText,
  sourceLabel,
  reviewsUrl,
  note,
  className,
}: {
  supplierName: string;
  reviews: readonly SupplierReview[];
  rating: number | null;
  reviewCountText: string | null;
  sourceLabel: string;
  reviewsUrl: string | null;
  /** The small print under the cards. */
  note: string;
  className?: string;
}) {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className={`reveal scroll-mt-24 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8 ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Customer reviews</p>
          <h2 id="reviews-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
            What customers say about <span className="text-accent">{supplierName}.</span>
          </h2>
        </div>
        {rating !== null ? (
          <span className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent-tint px-3.5 py-2 text-sm font-bold text-accent-strong">
            <StarIcon className="h-4 w-4 fill-current text-rating" />
            {formatRating(rating)} / 5{reviewCountText ? ` · ${reviewCountText} reviews` : ''}
          </span>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review, index) => (
            <li key={review.id ?? `${review.author}-${index}`} className="min-w-0">
              <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-card sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <StarTiles rating={review.rating} />
                  <span className="text-xs font-bold text-muted">{formatRating(review.rating)}</span>
                </div>
                <p className="mt-3 text-base leading-7 text-content">{review.body}</p>
                {/* Pinned to the bottom so the names line up across a row of cards. */}
                <p className="mt-auto flex min-w-0 flex-wrap items-center gap-x-1.5 pt-4 text-sm text-muted">
                  <span className="truncate font-bold text-content">{review.author}</span>
                  {review.reviewedAt ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <time dateTime={review.reviewedAt}>{formatReviewDate(review.reviewedAt)}</time>
                    </>
                  ) : null}
                </p>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          No individual reviews are recorded for {supplierName} yet.
          {reviewsUrl ? ' Read them at the source below.' : ''}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-5 text-muted">{note}</p>
        {reviewsUrl ? (
          <a
            href={reviewsUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="group/all inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:bg-accent-tint hover:text-accent-strong"
          >
            View all reviews on {sourceLabel}
            <ExternalIcon className="h-4 w-4 transition-transform group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
