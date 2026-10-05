'use client';

import { startTransition, useActionState, useMemo, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import {
  resetReviewPageContentAction,
  saveReviewPageContentAction,
  type ReviewPageFormState,
} from '@/app/admin/(dashboard)/reviews/page-actions';
import {
  REVIEW_TEXT_LABELS,
  REVIEW_TEXT_MAX,
  type ReviewPageContent,
  type ReviewPageTextKey,
} from '@/lib/review-page-content';
import { cn } from '@/lib/cn';
import { CheckCircleIcon, DocumentIcon, StarIcon, WarningIcon } from '@/components/icons/icons';

const INITIAL_STATE: ReviewPageFormState = { error: null, savedAt: null };

const INPUT_CLASS =
  'w-full resize-y rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm leading-6 text-content outline-none transition-all duration-150 placeholder:text-faint hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/20';

type Values = Record<ReviewPageTextKey, string>;

function toValues(content: ReviewPageContent): Values {
  return { intro: content.intro ?? '', ratingNote: content.ratingNote, reviewsNote: content.reviewsNote };
}

const FIELDS: readonly {
  key: ReviewPageTextKey;
  step: number;
  icon: ReactNode;
  title: string;
  description: string;
  rows: number;
}[] = [
  {
    key: 'intro',
    step: 1,
    icon: <DocumentIcon className="h-5 w-5" />,
    title: 'Intro',
    description: "The paragraph under the page heading. Leave it as is to use the supplier's own description.",
    rows: 3,
  },
  {
    key: 'ratingNote',
    step: 2,
    icon: <StarIcon className="h-5 w-5" />,
    title: 'Rating box note',
    description: 'The small print under the rating box at the top of the page.',
    rows: 2,
  },
  {
    key: 'reviewsNote',
    step: 3,
    icon: <DocumentIcon className="h-5 w-5" />,
    title: 'Reviews note',
    description: 'The note beneath the customer review cards.',
    rows: 3,
  },
];

/**
 * Edits the text of one vendor's reviews page. Fields start with what the page
 * is showing now (saved text, else generated), and anything left unchanged or
 * cleared is stored as "use the generated text", so the page keeps following the
 * vendor's live record instead of freezing today's wording.
 */
export function ReviewPageForm({
  slug,
  current,
  defaults,
  customized,
  disabled,
}: {
  slug: string;
  current: ReviewPageContent;
  /** The generated text, so each field can show whether it has been edited and be restored. */
  defaults: ReviewPageContent;
  customized: boolean;
  /** True when the text table isn't set up, so saving would fail. */
  disabled: boolean;
}) {
  const action = saveReviewPageContentAction.bind(null, slug);
  const [rawState, formAction, saving] = useActionState(action, INITIAL_STATE);
  // A submit whose Server Action can't be resolved (a tab left open across a
  // deploy) resolves to undefined; falling back keeps the form usable.
  const state = rawState ?? INITIAL_STATE;
  const [resetting, startReset] = useTransition();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const saved = useMemo(() => toValues(current), [current]);
  const generated = useMemo(() => toValues(defaults), [defaults]);
  const [values, setValues] = useState<Values>(saved);
  const dirty = FIELDS.some((field) => values[field.key] !== saved[field.key]);

  // Dispatched manually rather than via <form action>: React resets uncontrolled
  // fields after a form action, which would wipe the form on a validation error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetMessage(null);
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function resetToGenerated() {
    if (!window.confirm('Put every section of this page back on the generated text? Your edits will be lost.')) return;
    setResetMessage(null);
    startReset(async () => {
      const result = await resetReviewPageContentAction(slug);
      if (result.error) {
        setResetMessage(result.error);
        return;
      }
      setValues(generated);
      setFormKey((key) => key + 1);
      setResetMessage('Reset. The page is showing generated text again.');
    });
  }

  const busy = saving || resetting;
  const tooLong = FIELDS.some((field) => values[field.key].length > REVIEW_TEXT_MAX);

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
      {FIELDS.map((field) => {
        const edited = values[field.key].trim() !== generated[field.key].trim();
        const length = values[field.key].length;
        return (
          <section
            key={field.key}
            className="animate-fade-up rounded-panel border border-line bg-surface-raised shadow-card"
            style={{ animationDelay: `${field.step * 60}ms` }}
          >
            <header className="flex items-start gap-4 border-b border-line px-5 py-4 sm:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                {field.icon}
              </span>
              <div className="min-w-0">
                <p className="text-micro font-bold uppercase tracking-wide text-faint">Section {field.step}</p>
                <h2 className="text-base font-black text-content sm:text-lg">{field.title}</h2>
                <p className="mt-0.5 text-xs leading-5 text-muted sm:text-sm">{field.description}</p>
              </div>
            </header>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex items-center gap-2">
                  <label htmlFor={field.key} className="text-sm font-bold text-content">
                    {REVIEW_TEXT_LABELS[field.key]}
                  </label>
                  <span
                    className={cn(
                      'rounded-pill px-2 py-0.5 text-micro font-bold uppercase',
                      edited ? 'bg-accent-soft text-accent-strong' : 'bg-surface-sunken text-faint',
                    )}
                  >
                    {edited ? 'Edited' : 'Generated'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {edited ? (
                    <button
                      type="button"
                      onClick={() => setValues((previous) => ({ ...previous, [field.key]: generated[field.key] }))}
                      className="font-semibold text-accent transition-colors hover:text-accent-strong hover:underline"
                    >
                      Restore generated
                    </button>
                  ) : null}
                  <span className={cn('font-mono tabular-nums', length > REVIEW_TEXT_MAX ? 'font-bold text-danger' : 'text-faint')}>
                    {length}/{REVIEW_TEXT_MAX}
                  </span>
                </div>
              </div>
              <textarea
                id={field.key}
                name={field.key}
                rows={field.rows}
                value={values[field.key]}
                onChange={(event) => setValues((previous) => ({ ...previous, [field.key]: event.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
          </section>
        );
      })}

      {/* Stays in view while scrolling a long form, so saving never means hunting for the button. */}
      <div className="sticky bottom-4 z-10 rounded-card border border-line bg-surface-raised/95 px-4 py-3 shadow-lift backdrop-blur sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-sm" aria-live="polite">
            {state.error ? (
              <p role="alert" className="flex items-center gap-2 font-semibold text-danger">
                <WarningIcon className="h-4 w-4 shrink-0" />
                {state.error}
              </p>
            ) : resetMessage ? (
              <p role="status" className="font-semibold text-content">
                {resetMessage}
              </p>
            ) : dirty ? (
              <p className="flex items-center gap-2 font-semibold text-warn">
                <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-warn" />
                Unsaved changes
              </p>
            ) : state.savedAt ? (
              <p role="status" className="flex items-center gap-2 font-semibold text-ok">
                <CheckCircleIcon className="h-4 w-4" />
                Saved. The page now shows these changes.
              </p>
            ) : (
              <p className="text-muted">No changes yet.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {customized ? (
              <button
                type="button"
                onClick={resetToGenerated}
                disabled={busy || disabled}
                className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
              >
                {resetting ? 'Resetting…' : 'Reset all'}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy || disabled || !dirty || tooLong}
              className="btn-3d rounded-chip bg-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
