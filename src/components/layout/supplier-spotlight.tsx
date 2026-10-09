'use client';

import { useEffect, useState } from 'react';
import { CopyCode } from '@/components/ui/copy-code';
import { StarRating } from '@/components/ui/star-rating';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { CloseIcon, ExternalIcon, StarIcon } from '@/components/icons/icons';

/** Wait before sliding in, so it never competes with the page's first paint. */
const SHOW_AFTER_MS = 3000;
/** A visitor who closes it is left alone for a week. */
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

export interface SpotlightSupplier {
  slug: string;
  name: string;
  logoUrl: string | null;
  shopUrl: string;
  coupon: { code: string; percentOff: number } | null;
  /** Public review score; the whole rating row is omitted without one. */
  rating: { value: number; reviewCountText: string | null; sourceName: string | null; url: string | null } | null;
}

/** Versioned so a redesign can reset earlier dismissals; bump it when the card changes substantially. */
function storageKey(slug: string): string {
  return `peplookup:supplier-spotlight-dismissed:v2:${slug}`;
}

function wasDismissedRecently(slug: string): boolean {
  try {
    const dismissedAt = Number(window.localStorage.getItem(storageKey(slug)));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    // Storage can be blocked (private windows, strict settings); then the
    // card just shows again next visit, which is harmless.
    return false;
  }
}

function rememberDismissal(slug: string): void {
  try {
    window.localStorage.setItem(storageKey(slug), String(Date.now()));
  } catch {
    // Same as above: without storage the dismissal lasts for this page view only.
  }
}

/**
 * Floating card for the supplier marked Featured in the admin, showing only
 * data held for the supplier (coupon and public rating with its source) and a
 * sponsored link to shop.
 */
export function SupplierSpotlight({ supplier }: { supplier: SpotlightSupplier }) {
  const [isVisible, setIsVisible] = useState(false);

  // Decided after mount, not during render: the dismissal lives in this
  // browser's storage, which the server can't read.
  useEffect(() => {
    if (wasDismissedRecently(supplier.slug)) return;
    const timer = window.setTimeout(() => setIsVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [supplier.slug]);

  if (!isVisible) return null;

  const dismiss = () => {
    rememberDismissal(supplier.slug);
    setIsVisible(false);
  };

  const { rating, coupon } = supplier;

  return (
    <aside
      aria-label={`Featured supplier: ${supplier.name}`}
      // Tablets and up only: on a phone a floating card covers too much of the page.
      className="animate-fade-up fixed bottom-5 left-5 z-50 hidden w-72 md:block"
    >
      <div className="tilt-card relative max-h-screen overflow-y-auto rounded-card border border-line bg-gradient-to-b from-surface-raised to-accent-tint p-4 shadow-panel ring-1 ring-accent/10">
        {/* Top edge highlight that gives the card its lifted, 3D lip. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent-strong to-accent"
        />

        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-pill bg-accent-strong px-2.5 py-1 text-micro font-black uppercase tracking-wide text-surface-raised shadow-sm">
            <StarIcon className="h-3 w-3 fill-current text-rating" />
            Recommended Supplier
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close featured supplier"
            className="-mr-1 -mt-1 rounded-pill p-1 text-faint transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <SupplierLogo
            src={supplier.logoUrl}
            name={supplier.name}
            size={48}
            className="h-12 w-12 shrink-0 rounded-chip border border-line bg-surface-raised object-contain p-1 shadow-card"
            initialClassName="text-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-black leading-tight text-content">{supplier.name}</p>
            {rating ? (
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-micro text-muted">
                <StarRating rating={rating.value} starClassName="h-3.5 w-3.5" />
                {rating.url ? (
                  <a
                    href={rating.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="font-semibold text-content underline-offset-2 hover:text-accent-strong hover:underline"
                  >
                    {rating.sourceName ? `${rating.sourceName} ` : ''}
                    {rating.value.toFixed(1)}
                    {rating.reviewCountText ? ` · ${rating.reviewCountText} reviews` : ''}
                  </a>
                ) : (
                  <span className="font-semibold text-content">
                    {rating.sourceName ? `${rating.sourceName} ` : ''}
                    {rating.value.toFixed(1)}
                    {rating.reviewCountText ? ` · ${rating.reviewCountText} reviews` : ''}
                  </span>
                )}
              </p>
            ) : null}
          </div>
        </div>

        {coupon ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-chip border border-dashed border-accent/40 bg-surface-raised px-3 py-2 shadow-sm">
            <p className="leading-none">
              <span className="block text-xl font-black text-accent-strong">{coupon.percentOff}% OFF</span>
              <span className="mt-1 block text-micro font-semibold uppercase tracking-wide text-muted">with code</span>
            </p>
            <CopyCode
              code={coupon.code}
              className="gap-1 border-accent bg-accent-tint px-2.5 py-1 text-xs text-accent-strong hover:bg-accent-soft"
            />
          </div>
        ) : null}

        <a
          href={supplier.shopUrl}
          target="_blank"
          rel="nofollow noopener noreferrer sponsored"
          className="btn-3d mt-3 flex w-full items-center justify-center gap-1.5 rounded-pill bg-brand px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-surface-raised"
        >
          Shop peptides now
          <ExternalIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  );
}
