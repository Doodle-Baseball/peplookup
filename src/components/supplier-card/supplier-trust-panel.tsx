'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupplierReview } from '@/lib/schema';
import { formatRating, formatReviewDate } from '@/lib/format';
import { StarRating } from '@/components/ui/star-rating';
import {
  LockIcon,
  ArrowRightIcon,
  StarIcon,
  MailIcon,
  CheckCircleIcon,
  ExternalIcon,
} from '@/components/icons/icons';

/**
 * Same Web3Forms endpoint the newsletter uses. It has to run in the browser:
 * Web3Forms sits behind Cloudflare, which answers server-side requests with a
 * 403 challenge page.
 */
const WEB3FORMS_ACCESS_KEY = 'ee118fde-8201-4c9f-8174-f0895772887d';

const UNLOCK_REDIRECT = '/lab-reports';

export interface SupplierLabSummary {
  testCount: number;
  labName: string | null;
  productNames: string[];
}

export function SupplierTrustPanel({
  supplierName,
  supplierSlug,
  reviews,
  reviewsUrl,
  reviewRating,
  labSummary,
}: {
  supplierName: string;
  supplierSlug: string;
  reviews: readonly SupplierReview[];
  reviewsUrl: string | null;
  reviewRating: number | null;
  labSummary: SupplierLabSummary;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  // Lands on /lab-reports already filtered to this vendor.
  const labReportsHref = `${UNLOCK_REDIRECT}?supplier=${encodeURIComponent(supplierName)}`;
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setState('error');
      return;
    }

    setState('sending');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Lab report unlock request: ${supplierName}`,
          from_name: 'PepLookup Website',
          email: trimmed,
          message: `${trimmed} requested the analytics & test history for ${supplierName} (/suppliers/${supplierSlug}).`,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      const succeeded =
        response.ok &&
        typeof result === 'object' &&
        result !== null &&
        'success' in result &&
        result.success === true;
      if (!succeeded) throw new Error(`Web3Forms rejected the request (HTTP ${response.status})`);

      setState('done');
      router.push(labReportsHref);
    } catch (error) {
      console.error(error);
      setState('error');
    }
  }

  return (
    <section aria-labelledby="trust-panel-heading" className="reveal mt-12">
      <h2 id="trust-panel-heading" className="sr-only">
        {supplierName} reviews and lab report access
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------ Reviews */}
        <div className="flex flex-col rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6">
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
            <ul className="mt-5 space-y-3">
              {reviews.map((review, index) => (
                <li key={review.id ?? `${review.author}-${index}`}>
                  <article className="rounded-card border border-line bg-surface p-4 transition-colors hover:border-accent/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-sm font-black uppercase text-accent-strong">
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
                    <p className="mt-3 text-sm leading-6 text-muted">&ldquo;{review.body}&rdquo;</p>
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
              rel="noopener noreferrer"
              className="group/all mt-5 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:bg-accent-tint hover:text-accent-strong"
            >
              View All Reviews on Trustpilot
              <ExternalIcon className="h-4 w-4 transition-transform group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
            </a>
          ) : null}

          <p className="mt-5 border-t border-line pt-4 text-xs text-faint">
            Reviews are reproduced from the vendor&rsquo;s public Trustpilot profile and are not verified by
            PepLookup.
          </p>
        </div>

        {/* ------------------------------------------------------- Unlock */}
        <div className="rounded-panel border border-accent/25 bg-accent-tint p-5 shadow-card sm:p-6">
          <div className="mx-auto flex h-full max-w-md flex-col items-center text-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-pill border border-accent/30 bg-surface-raised text-accent-strong shadow-card sm:h-20 sm:w-20">
              <LockIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>

            <h3 className="mt-5 text-balance text-2xl font-black leading-tight text-content sm:text-3xl">
              Unlock {supplierName} peptides
              <span className="mt-1 block text-accent-strong">Analytics &amp; test history</span>
            </h3>

            {/* What this vendor actually has on file, straight from /lab-reports. */}
            {labSummary.labName ? (
              <dl className="mt-6 w-full text-left">
                <div className="rounded-card border border-accent/20 bg-surface-raised px-3 py-2.5">
                  <dt className="text-micro font-bold uppercase text-faint">COA Lab / Provider</dt>
                  <dd className="mt-0.5 text-sm font-bold text-content">{labSummary.labName}</dd>
                </div>
              </dl>
            ) : null}

            {labSummary.productNames.length > 0 ? (
              <ul className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                {labSummary.productNames.slice(0, 4).map((name) => (
                  <li
                    key={name}
                    className="rounded-pill border border-accent/20 bg-surface-raised px-2.5 py-1 text-micro font-bold text-accent-strong"
                  >
                    {name}
                  </li>
                ))}
                {labSummary.productNames.length > 4 ? (
                  <li className="rounded-pill border border-accent/20 bg-surface-raised px-2.5 py-1 text-micro font-bold text-muted">
                    +{labSummary.productNames.length - 4} more
                  </li>
                ) : null}
              </ul>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
              <label className="sr-only" htmlFor={`supplier-email-${supplierSlug}`}>
                Email address
              </label>
              <div className="flex items-center gap-2.5 rounded-card border border-line bg-surface-raised px-4 py-3 shadow-sm transition-shadow focus-within:shadow-lift">
                <MailIcon className="h-5 w-5 shrink-0 text-accent" />
                <input
                  id={`supplier-email-${supplierSlug}`}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full min-w-0 bg-transparent text-sm font-semibold text-content outline-none placeholder:font-normal placeholder:text-faint"
                />
              </div>

              <button
                type="submit"
                disabled={state === 'sending'}
                className="btn-3d flex w-full items-center justify-center gap-2 rounded-card bg-accent px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-surface transition-colors hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-60 sm:text-base"
              >
                {state === 'sending' ? 'Unlocking…' : 'Unlock'}
                {state === 'sending' ? null : <ArrowRightIcon className="h-4 w-4" />}
              </button>

              <p className="flex items-center justify-center gap-2 rounded-card border border-accent/20 bg-surface-raised/60 px-4 py-2.5 text-xs font-semibold text-muted">
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-accent" />
                {labSummary.testCount > 0
                  ? `Includes ${labSummary.testCount} lab run${labSummary.testCount === 1 ? '' : 's'} for ${supplierName}`
                  : `No lab runs on file for ${supplierName} yet`}
              </p>

              <p aria-live="polite" className="min-h-5 text-xs">
                {state === 'error' ? (
                  <span className="font-semibold text-danger">
                    Could not send that just now. Check the address and try again.
                  </span>
                ) : state === 'done' ? (
                  <span className="font-semibold text-ok">Unlocked. Opening the lab reports.</span>
                ) : (
                  <span className="text-faint">We respect your privacy. No spam.</span>
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
