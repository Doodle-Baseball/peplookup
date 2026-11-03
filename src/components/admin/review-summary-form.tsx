'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { saveReviewSummaryAction, type ReviewSummaryFormState } from '@/app/admin/(dashboard)/reviews/page-actions';
import { QUALITY_THRESHOLDS } from '@/config/seo-quality';
import { wordCountOf } from '@/lib/seo/text';
import { cn } from '@/lib/cn';
import { CheckCircleIcon, DocumentIcon, WarningIcon } from '@/components/icons/icons';

const INITIAL_STATE: ReviewSummaryFormState = { error: null, warning: null, savedAt: null };

const INPUT_CLASS =
  'w-full resize-y rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm leading-6 text-content outline-none transition-all duration-150 placeholder:text-faint hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/20';

/**
 * "Our summary of <name> reviews": 3-6 sentences in the site owner's own
 * words, shown on the public reviews page. The page passes its quality check
 * once this is at least 60 words and not a near-copy of another supplier's.
 */
export function ReviewSummaryForm({
  slug,
  supplierName,
  initialSummary,
}: {
  slug: string;
  supplierName: string;
  initialSummary: string | null;
}) {
  const action = saveReviewSummaryAction.bind(null, slug);
  const [rawState, formAction, saving] = useActionState(action, INITIAL_STATE);
  // A submit whose Server Action can't be resolved (a tab left open across a deploy) resolves to undefined.
  const state = rawState ?? INITIAL_STATE;
  const [savedValue, setSavedValue] = useState(initialSummary ?? '');
  const [value, setValue] = useState(initialSummary ?? '');
  const words = wordCountOf(value);
  const enoughWords = words >= QUALITY_THRESHOLDS.reviewSummaryMinWords;
  const dirty = value.trim() !== savedValue.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSavedValue(value);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up rounded-panel border border-line bg-surface-raised shadow-card">
      <header className="flex items-start gap-4 border-b border-line px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
          <DocumentIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-micro font-bold uppercase tracking-wide text-faint">Your summary</p>
          <h2 className="text-base font-black text-content sm:text-lg">Our summary of {supplierName} reviews</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted sm:text-sm">
            3–6 sentences in your own words about what customers say. Shown on the reviews page under this heading; leave
            it empty to hide the section.
          </p>
        </div>
      </header>
      <div className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="reviewSummary" className="text-sm font-bold text-content">
            Summary
          </label>
          <span className={cn('text-xs font-semibold', enoughWords ? 'text-ok' : 'text-warn')}>
            {words} / {QUALITY_THRESHOLDS.reviewSummaryMinWords}+ words
          </span>
        </div>
        <textarea
          id="reviewSummary"
          name="reviewSummary"
          rows={6}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={INPUT_CLASS}
        />
        <div className="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
          <div className="min-w-0 text-sm">
            {state.error ? (
              <p role="alert" className="flex items-center gap-2 font-semibold text-danger">
                <WarningIcon className="h-4 w-4 shrink-0" />
                {state.error}
              </p>
            ) : state.warning && !dirty ? (
              <p role="status" className="flex items-center gap-2 font-semibold text-warn">
                <WarningIcon className="h-4 w-4 shrink-0" />
                {state.warning}
              </p>
            ) : state.savedAt && !dirty ? (
              <p role="status" className="flex items-center gap-2 font-semibold text-ok">
                <CheckCircleIcon className="h-4 w-4" />
                Saved. The reviews page now shows this summary.
              </p>
            ) : dirty ? (
              <p className="font-semibold text-warn">Unsaved changes</p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={saving || !dirty}
            className="btn-3d rounded-chip bg-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save summary'}
          </button>
        </div>
      </div>
    </form>
  );
}
