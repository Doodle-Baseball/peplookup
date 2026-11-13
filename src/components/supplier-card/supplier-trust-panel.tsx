'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SupplierReview } from '@/lib/schema';
import { cn } from '@/lib/cn';
import { formatRating, formatReviewDate } from '@/lib/format';
import { ratingAttribution, ratingSourceLabel } from '@/lib/review-pages';
import type { ReviewCount } from '@/lib/schema';
import { COMPACT_REVIEW_CHARACTERS, wholeSentenceExcerpt } from '@/lib/featured-reviews';
import { StarTiles } from '@/components/ui/star-tiles';
import { StarRating } from '@/components/ui/star-rating';
import { StarIcon, ExternalIcon, FlaskIcon, SearchIcon, DocumentIcon } from '@/components/icons/icons';

/** Reviews visible before the list scrolls. */
const VISIBLE_REVIEWS = 3;

/** COA rows visible before the list scrolls when it isn't sized by the reviews card beside it. */
const STACKED_COA_ROWS = 2;

/** COA rows a compact panel's window always shows (6 cards in two columns). */
const COMPACT_COA_ROWS = 3;

/**
 * Size chips a COA card shows before a "+N" chip, capped by count and by total
 * label length so they always fit on one line. Every card in the grid takes
 * the tallest card's height, so one report covering many sizes would otherwise
 * leave blank space in all the others.
 */
const MAX_VISIBLE_COA_SIZES = 3;
const COA_SIZE_LINE_CHARACTERS = 18;

function visibleCoaSizeCount(sizes: readonly string[]): number {
  let characters = 0;
  let count = 0;
  for (const size of sizes.slice(0, MAX_VISIBLE_COA_SIZES)) {
    characters += size.length;
    // The first chip always shows, however long.
    if (count > 0 && characters > COA_SIZE_LINE_CHARACTERS) break;
    count += 1;
  }
  return count;
}

/** One COA document this vendor publishes, with every size it covers. */
export interface SupplierCoaReport {
  key: string;
  productName: string;
  /** Display labels, smallest first. */
  sizes: readonly string[];
  url: string;
}

export function SupplierTrustPanel({
  supplierName,
  supplierSlug,
  reviews,
  reviewsUrl,
  reviewRating,
  reviewCount,
  labName,
  coaReports,
  showReviews = true,
  showCoaSizes = true,
  compact = false,
}: {
  supplierName: string;
  supplierSlug: string;
  reviews: readonly SupplierReview[];
  reviewsUrl: string | null;
  reviewRating: number | null;
  reviewCount: ReviewCount | null;
  labName: string | null;
  coaReports: readonly SupplierCoaReport[];
  /** False leaves out the reviews card (and the word in the heading), so only the COAs show. */
  showReviews?: boolean;
  /** False hides the size chips on each COA card. */
  showCoaSizes?: boolean;
  /**
   * Shorter panel: each review cut to its whole sentences within 150 characters, tighter spacing, no scroll box, and
   * every COA in a scrolling list that fills the space beside the reviews.
   */
  compact?: boolean;
}) {
  // Named from the reviews link, so reviews from PepReviewPro (or any other
  // platform) aren't labelled Trustpilot. Without a link it stays Trustpilot,
  // where the shipped review set comes from.
  const reviewSource = reviewsUrl ? ratingSourceLabel(reviewsUrl) : 'Trustpilot';
  const ratingLabel = ratingAttribution({ reviewRating, reviewCount, reviewsUrl });
  const [coaQuery, setCoaQuery] = useState('');
  const normalizedCoaQuery = coaQuery.trim().toLowerCase();
  const matchingCoaReports = useMemo(
    () =>
      normalizedCoaQuery
        ? coaReports.filter((report) => report.productName.toLowerCase().includes(normalizedCoaQuery))
        : coaReports,
    [coaReports, normalizedCoaQuery],
  );
  const coaWrapperRef = useRef<HTMLDivElement>(null);
  const coaListRef = useRef<HTMLUListElement>(null);

  // Every row gets the same height and the window shows a whole number of
  // rows, so with row-by-row snap scrolling no card is ever left cut in half.
  // Beside the reviews the window must also fill the column exactly, so the
  // rows stretch evenly into whatever space is left over.
  useEffect(() => {
    const wrapper = coaWrapperRef.current;
    const list = coaListRef.current;
    if (!wrapper || !list) return;
    const measure = () => {
      // Styles are set directly (React renders no style prop here) because
      // the natural card heights have to be read with them cleared first.
      list.style.gridAutoRows = '';
      list.style.height = '';
      list.style.maxHeight = '';
      wrapper.style.minHeight = '';
      const cardHeights = Array.from(list.children, (child) => (child as HTMLElement).offsetHeight);
      if (cardHeights.length === 0) return;
      const styles = getComputedStyle(list);
      const gap = parseFloat(styles.rowGap) || 0;
      const columnCount = styles.gridTemplateColumns.split(' ').length;
      const rowCount = Math.ceil(cardHeights.length / columnCount);
      const rowHeight = Math.max(...cardHeights);
      const fillsColumn = styles.position === 'absolute';
      // Vertical padding (the compact list's room for card hover effects) sits outside the rows.
      const padding = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
      const windowRows = compact ? COMPACT_COA_ROWS : STACKED_COA_ROWS;
      // Compact: the column grows if needed so the fixed rows never shrink below their natural height.
      if (compact && fillsColumn) wrapper.style.minHeight = `${windowRows * (rowHeight + gap) - gap + padding}px`;
      const space = fillsColumn ? wrapper.clientHeight - padding : windowRows * (rowHeight + gap) - gap;
      // Compact shows a fixed number of rows, stretched to fill the column; otherwise as many as fit.
      const fittingRows = compact ? windowRows : Math.max(1, Math.floor((space + gap) / (rowHeight + gap)));
      // Fewer rows than the window holds: natural height, nothing to scroll.
      if (rowCount <= fittingRows && !fillsColumn) return;
      const visibleRows = Math.min(rowCount, fittingRows);
      const stretchedRow =
        fillsColumn && rowCount > fittingRows ? (space - (visibleRows - 1) * gap) / visibleRows : rowHeight;
      list.style.gridAutoRows = `${stretchedRow}px`;
      list.style.height = `${visibleRows * (stretchedRow + gap) - gap + padding}px`;
      list.style.maxHeight = 'none';
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [matchingCoaReports, compact]);
  // Each card shows only when there is something to show.
  const listRef = useRef<HTMLUListElement>(null);
  const [listMaxHeight, setListMaxHeight] = useState<number | 'none' | null>(null);
  const hasReviewSection = showReviews && (reviews.length > 0 || reviewsUrl !== null);
  const hasCoaSection = coaReports.length > 0;

  // Cards differ in height, so the cap is measured: the top of the first
  // hidden card marks exactly where the fourth visible one ends.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const items = list.children;
      if (items.length <= VISIBLE_REVIEWS) {
        setListMaxHeight('none');
        return;
      }
      const firstHidden = items[VISIBLE_REVIEWS] as HTMLElement;
      const first = items[0] as HTMLElement;
      setListMaxHeight(firstHidden.offsetTop - first.offsetTop);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [reviews]);

  if (!hasReviewSection && !hasCoaSection) return null;

  return (
    <section aria-labelledby="trust-panel-heading" className="reveal mt-12">
      <h2 id="trust-panel-heading" className="sr-only">
        {showReviews ? `${supplierName} reviews and lab reports` : `${supplierName} lab reports`}
      </h2>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------ Reviews */}
        {hasReviewSection ? (
        <div
          className={cn(
            'flex flex-col rounded-panel border border-line bg-surface-raised shadow-card',
            compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
            // Alone in the row (no COAs to sit beside): spans the full width.
            !hasCoaSection && 'lg:col-span-2',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-rating">
                <StarIcon className="h-5 w-5 fill-current" />
              </span>
              <h3 className="truncate text-xl font-black text-content sm:text-2xl">{reviewSource} Reviews</h3>
            </div>
            {ratingLabel && reviewRating !== null ? (
              <RatingBadge label={ratingLabel} rating={reviewRating} href={reviewsUrl} />
            ) : null}
          </div>

          {reviews.length > 0 ? (
            <ul
              ref={compact ? undefined : listRef}
              // Until measured (first paint) a rem cap stands in for four cards.
              className={cn(
                compact ? 'mt-4 space-y-2.5' : 'mt-5 space-y-3',
                !compact && 'panel-scrollbar max-h-[26rem] snap-y snap-mandatory overflow-y-auto pr-2',
              )}
              style={compact || listMaxHeight === null ? undefined : { maxHeight: listMaxHeight }}
              tabIndex={compact ? undefined : 0}
              aria-label={`${supplierName} reviews`}
            >
              {reviews.map((review, index) => (
                <li key={review.id ?? `${review.author}-${index}`} className="snap-start">
                  <article
                    className={cn(
                      'rounded-card border border-line bg-surface',
                      compact ? 'tilt-card p-4 hover:border-accent/40' : 'p-5 transition-shadow hover:shadow-card',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <StarTiles rating={review.rating} />
                      <span className="text-xs font-bold text-muted">{formatRating(review.rating)}</span>
                    </div>
                    <p className={cn('text-content', compact ? 'mt-2 text-sm leading-6' : 'mt-3 text-base leading-7')}>
                      {compact ? (wholeSentenceExcerpt(review.body, COMPACT_REVIEW_CHARACTERS) ?? review.body) : review.body}
                    </p>
                    <p className={cn('flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm text-muted', compact ? 'mt-2' : 'mt-4')}>
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
            <p className="mt-5 rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
              No reviews recorded for {supplierName} yet.
            </p>
          )}

          <div className={cn('flex flex-wrap items-center gap-2', compact ? 'mt-4' : 'mt-5')}>
            {reviewsUrl ? (
              <a
                href={reviewsUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="group/all inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:bg-accent-tint hover:text-accent-strong"
              >
                View All Reviews on {reviewSource}
                <ExternalIcon className="h-4 w-4 transition-transform group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
              </a>
            ) : null}
          </div>
        </div>
        ) : null}

        {/* --------------------------------------------------- COA reports */}
        {hasCoaSection ? (
        <div
          className={cn(
            'flex h-full w-full flex-col rounded-panel border border-line bg-surface-raised shadow-card',
            compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
            // Alone in the row (no reviews to sit beside): spans the full width.
            !hasReviewSection && 'lg:col-span-2',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                <FlaskIcon className="h-5 w-5" />
              </span>
              <h3 className="truncate text-xl font-black text-content sm:text-2xl">COAs</h3>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-pill border border-accent/30 bg-accent-tint px-3 py-1.5 text-micro font-bold uppercase text-accent-strong">
              {coaReports.length} {coaReports.length === 1 ? 'report' : 'reports'}
            </span>
          </div>

          {labName ? (
            <p className="mt-2 text-sm text-muted">
              Tested by <span className="font-bold text-content">{labName}</span>
            </p>
          ) : null}

          <label className="sr-only" htmlFor={`coa-search-${supplierSlug}`}>
            Search {supplierName} COA reports
          </label>
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-card border border-line bg-surface px-4 transition-colors focus-within:border-accent',
              compact ? 'mt-4 py-2.5' : 'mt-5 py-3',
            )}
          >
            <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
            <input
              id={`coa-search-${supplierSlug}`}
              type="search"
              autoComplete="off"
              value={coaQuery}
              onChange={(event) => setCoaQuery(event.target.value)}
              placeholder="Search products…"
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-content outline-none placeholder:font-normal placeholder:text-faint focus:ring-0 focus-visible:ring-0"
            />
          </div>

          {matchingCoaReports.length > 0 ? (
            // Beside the reviews card the list fills whatever height that
            // card sets, absolutely positioned so its own length doesn't
            // stretch the row and no blank strip is left under it.
            <div
              ref={coaWrapperRef}
              className={cn(
                'relative mt-4',
                hasReviewSection && 'lg:min-h-80 lg:flex-1',
              )}
            >
            <ul
              ref={coaListRef}
              className={cn(
                'grid grid-cols-1 content-start gap-2.5 sm:grid-cols-2',
                compact
                  ? cn(
                      // Room above the top row for a hovered card's 6px lift, kept when a scroll snaps to a row.
                      'panel-scrollbar max-h-96 snap-y snap-mandatory scroll-pt-2.5 overflow-y-auto px-1 pb-1 pt-2.5',
                      hasReviewSection ? 'lg:absolute lg:inset-0 lg:max-h-none' : 'lg:grid-cols-3',
                    )
                  : cn(
                      'panel-scrollbar max-h-96 snap-y snap-mandatory overflow-y-auto pr-1',
                      hasReviewSection ? 'lg:absolute lg:inset-0 lg:max-h-none' : 'lg:grid-cols-3',
                    ),
              )}
              tabIndex={0}
              aria-label={`${supplierName} COA reports`}
            >
              {matchingCoaReports.map((report) => (
                <li
                  key={report.key}
                  className={cn(
                    'flex snap-start flex-col rounded-card border border-line bg-surface',
                    compact ? 'tilt-card gap-2 p-3 hover:border-accent/40' : 'gap-3 p-4 transition-shadow hover:shadow-card',
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                      <DocumentIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-content" title={report.productName}>
                        {report.productName}
                      </p>
                      <p className="text-xs text-muted">Certificate of analysis</p>
                    </div>
                  </div>
                  {showCoaSizes && report.sizes.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5" aria-label={`${report.productName} sizes covered`}>
                      {report.sizes.slice(0, visibleCoaSizeCount(report.sizes)).map((size) => (
                        <li
                          key={size}
                          className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 text-micro font-bold text-muted"
                        >
                          {size}
                        </li>
                      ))}
                      {report.sizes.length > visibleCoaSizeCount(report.sizes) ? (
                        <li
                          title={report.sizes.slice(visibleCoaSizeCount(report.sizes)).join(', ')}
                          className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 text-micro font-bold text-muted"
                        >
                          <span aria-hidden="true">+{report.sizes.length - visibleCoaSizeCount(report.sizes)}</span>
                          <span className="sr-only">{report.sizes.slice(visibleCoaSizeCount(report.sizes)).join(', ')}</span>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                  <a
                    href={report.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`View ${report.productName} COA`}
                    className={cn('mt-auto inline-flex items-center justify-center gap-1.5 rounded-pill bg-accent px-3 text-xs font-bold uppercase tracking-wide text-surface transition-colors hover:bg-accent-strong', compact ? 'py-1.5' : 'py-2')}
                  >
                    View COA
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
            </div>
          ) : (
            <p className="mt-4 rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
              No reports match &ldquo;{coaQuery.trim()}&rdquo;.
            </p>
          )}
        </div>
        ) : null}
      </div>
    </section>
  );
}

/** "Trustpilot 4.3/5 from 120 reviews" with stars that match the score, linked to the rating's source. */
function RatingBadge({ label, rating, href }: { label: string; rating: number; href: string | null }) {
  const className =
    'inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-accent/30 bg-accent-tint px-3 py-1.5 text-xs font-bold text-accent-strong';
  const content = (
    <>
      <StarRating rating={rating} starClassName="h-3 w-3" />
      {label}
    </>
  );
  if (!href) return <span className={className}>{content}</span>;
  return (
    <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={cn(className, 'hover:border-accent hover:underline')}>
      {content}
    </a>
  );
}
