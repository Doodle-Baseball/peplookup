import type { SupplierReview } from '@/lib/schema';
import { formatRating, formatReviewDate } from '@/lib/format';
import { StarRating } from '@/components/ui/star-rating';
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
              <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-sm font-black uppercase text-accent-strong"
                    >
                      {review.author.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-content">{review.author}</p>
                      {review.reviewedAt ? (
                        <p className="text-xs text-faint">{formatReviewDate(review.reviewedAt)}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-bold text-muted">{formatRating(review.rating)}</span>
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">&ldquo;{review.body}&rdquo;</p>
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
