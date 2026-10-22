'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SupplierReview } from '@/lib/schema';
import { cn } from '@/lib/cn';
import { formatRating, formatReviewDate } from '@/lib/format';
import { StarTiles } from '@/components/ui/star-tiles';
import { StarIcon, ExternalIcon, FlaskIcon, SearchIcon, DocumentIcon } from '@/components/icons/icons';

/** Reviews visible before the list scrolls. */
const VISIBLE_REVIEWS = 3;

/** COA rows visible before the list scrolls when it isn't sized by the reviews card beside it. */
const STACKED_COA_ROWS = 2;

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
  labName,
  coaReports,
}: {
  supplierName: string;
  supplierSlug: string;
  reviews: readonly SupplierReview[];
  reviewsUrl: string | null;
  reviewRating: number | null;
  labName: string | null;
  coaReports: readonly SupplierCoaReport[];
}) {
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
      const cardHeights = Array.from(list.children, (child) => (child as HTMLElement).offsetHeight);
      if (cardHeights.length === 0) return;
      const styles = getComputedStyle(list);
      const gap = parseFloat(styles.rowGap) || 0;
      const columnCount = styles.gridTemplateColumns.split(' ').length;
      const rowCount = Math.ceil(cardHeights.length / columnCount);
      const rowHeight = Math.max(...cardHeights);
      const fillsColumn = styles.position === 'absolute';
      const space = fillsColumn ? wrapper.clientHeight : STACKED_COA_ROWS * (rowHeight + gap) - gap;
      const fittingRows = Math.max(1, Math.floor((space + gap) / (rowHeight + gap)));
      // Fewer rows than the window holds: natural height, nothing to scroll.
      if (rowCount <= fittingRows && !fillsColumn) return;
      const visibleRows = Math.min(rowCount, fittingRows);
      const stretchedRow =
        fillsColumn && rowCount > fittingRows ? (space - (visibleRows - 1) * gap) / visibleRows : rowHeight;
      list.style.gridAutoRows = `${stretchedRow}px`;
      list.style.height = `${visibleRows * (stretchedRow + gap) - gap}px`;
      list.style.maxHeight = 'none';
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [matchingCoaReports]);
  // Each card shows only when there is something to show.
  const listRef = useRef<HTMLUListElement>(null);
  const [listMaxHeight, setListMaxHeight] = useState<number | 'none' | null>(null);
  const hasReviewSection = reviews.length > 0 || reviewsUrl !== null;
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
        {supplierName} reviews and lab reports
      </h2>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------ Reviews */}
        {hasReviewSection ? (
        <div
          className={cn(
            'flex flex-col rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6',
            // Alone in the row (no COAs to sit beside): spans the full width.
            !hasCoaSection && 'lg:col-span-2',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-rating">
                <StarIcon className="h-5 w-5 fill-current" />
              </span>
              <h3 className="truncate text-xl font-black text-content sm:text-2xl">Trustpilot Reviews</h3>
            </div>
            {reviewRating !== null ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-accent/30 bg-accent-tint px-3 py-1.5 text-micro font-bold uppercase text-accent-strong">
                <StarIcon className="h-3 w-3 fill-current text-rating" />
                Trust factor {formatRating(reviewRating)}
              </span>
            ) : null}
          </div>

          {reviews.length > 0 ? (
            <ul
              ref={listRef}
              // Until measured (first paint) a rem cap stands in for four cards.
              className="panel-scrollbar mt-5 max-h-[26rem] snap-y snap-mandatory space-y-3 overflow-y-auto pr-2"
              style={listMaxHeight === null ? undefined : { maxHeight: listMaxHeight }}
              tabIndex={0}
              aria-label={`${supplierName} reviews`}
            >
              {reviews.map((review, index) => (
                <li key={review.id ?? `${review.author}-${index}`} className="snap-start">
                  <article className="rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-card">
                    <div className="flex items-center justify-between gap-3">
                      <StarTiles rating={review.rating} />
                      <span className="text-xs font-bold text-muted">{formatRating(review.rating)}</span>
                    </div>
                    <p className="mt-3 text-base leading-7 text-content">{review.body}</p>
                    <p className="mt-4 flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm text-muted">
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

          {reviewsUrl ? (
            <a
              href={reviewsUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="group/all mt-5 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:bg-accent-tint hover:text-accent-strong"
            >
              View All Reviews on Trustpilot
              <ExternalIcon className="h-4 w-4 transition-transform group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
            </a>
          ) : null}
        </div>
        ) : null}

        {/* --------------------------------------------------- COA reports */}
        {hasCoaSection ? (
        <div
          className={cn(
            'flex h-full w-full flex-col rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6',
            // Alone in the row (no reviews to sit beside): spans the full width.
            !hasReviewSection && 'lg:col-span-2',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                <FlaskIcon className="h-5 w-5" />
              </span>
              <h3 className="truncate text-xl font-black text-content sm:text-2xl">Lab Reports &amp; COAs</h3>
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
          <div className="mt-5 flex items-center gap-2.5 rounded-card border border-line bg-surface px-4 py-3 transition-colors focus-within:border-accent">
            <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
            <input
              id={`coa-search-${supplierSlug}`}
              type="search"
              autoComplete="off"
              value={coaQuery}
              onChange={(event) => setCoaQuery(event.target.value)}
              placeholder="Search products…"
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-content outline-none placeholder:font-normal placeholder:text-faint"
            />
          </div>

          {matchingCoaReports.length > 0 ? (
            // Beside the reviews card the list fills whatever height that
            // card sets, absolutely positioned so its own length doesn't
            // stretch the row and no blank strip is left under it.
            <div
              ref={coaWrapperRef}
              className={cn('relative mt-4', hasReviewSection && 'lg:min-h-80 lg:flex-1')}
            >
            <ul
              ref={coaListRef}
              className={cn(
                'panel-scrollbar grid max-h-96 snap-y snap-mandatory grid-cols-1 content-start gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2',
                hasReviewSection ? 'lg:absolute lg:inset-0 lg:max-h-none' : 'lg:grid-cols-3',
              )}
              tabIndex={0}
              aria-label={`${supplierName} COA reports`}
            >
              {matchingCoaReports.map((report) => (
                <li
                  key={report.key}
                  className="flex snap-start flex-col gap-3 rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-card"
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
                  {report.sizes.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5" aria-label={`${report.productName} sizes covered`}>
                      {report.sizes.map((size) => (
                        <li
                          key={size}
                          className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 text-micro font-bold text-muted"
                        >
                          {size}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <a
                    href={report.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`View ${report.productName} COA`}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-pill bg-accent px-3 py-2 text-xs font-bold uppercase tracking-wide text-surface transition-colors hover:bg-accent-strong"
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
