'use client';

import { startTransition, useActionState, useMemo, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import {
  resetCouponPageContentAction,
  saveCouponPageContentAction,
  type CouponPageFormState,
} from '@/app/admin/(dashboard)/coupon-pages/actions';
import {
  COUPON_DETAIL_KEYS,
  COUPON_DETAIL_LABELS,
  COUPON_STEPS_MAX,
  COUPON_STEP_MAX,
  COUPON_TEXT_MAX,
  type CouponDetailKey,
  type CouponPageContent,
} from '@/lib/coupon-page-content';
import { cn } from '@/lib/cn';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentIcon,
  ListIcon,
  TagIcon,
  TrashIcon,
  WarningIcon,
} from '@/components/icons/icons';

const INITIAL_STATE: CouponPageFormState = { error: null, savedAt: null };

const INPUT_CLASS =
  'w-full resize-y rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm leading-6 text-content outline-none transition-all duration-150 placeholder:text-faint hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/20';

interface Values {
  intro: string;
  details: Record<CouponDetailKey, string>;
  /** One entry per step box; blank boxes are dropped when saving. */
  steps: string[];
  workingNote: string;
}

/** The steps as saved: trimmed, blanks dropped, one line each (steps are single-line on the page). */
function cleanSteps(steps: readonly string[]): string[] {
  return steps.map((step) => step.replace(/\s*\n\s*/g, ' ').trim()).filter((step) => step !== '');
}

function toValues(content: CouponPageContent): Values {
  return {
    intro: content.intro ?? '',
    details: { ...content.details },
    steps: [...content.steps],
    workingNote: content.workingNote,
  };
}

function sameValues(a: Values, b: Values): boolean {
  return (
    a.intro === b.intro &&
    cleanSteps(a.steps).join('\n') === cleanSteps(b.steps).join('\n') &&
    a.workingNote === b.workingNote &&
    COUPON_DETAIL_KEYS.every((key) => a.details[key] === b.details[key])
  );
}

/** One section of the page, as a numbered card with an icon, so the form reads in the same order as the live page. */
function Section({
  step,
  icon,
  title,
  description,
  children,
}: {
  step: number;
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up rounded-panel border border-line bg-surface-raised shadow-card" style={{ animationDelay: `${step * 60}ms` }}>
      <header className="flex items-start gap-4 border-b border-line px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-micro font-bold uppercase tracking-wide text-faint">Section {step}</p>
          <h2 className="text-base font-black text-content sm:text-lg">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted sm:text-sm">{description}</p>
        </div>
      </header>
      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

/**
 * Label row for one field: what it is, whether the page is using the generated
 * text or an edit, a character count, and a one-click way back to generated.
 */
function FieldHeader({
  htmlFor,
  label,
  edited,
  length,
  max,
  onRestore,
}: {
  htmlFor: string;
  label: string;
  edited: boolean;
  length: number;
  max: number;
  onRestore: () => void;
}) {
  return (
    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-bold text-content">
          {label}
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
            onClick={onRestore}
            className="font-semibold text-accent transition-colors hover:text-accent-strong hover:underline"
          >
            Restore generated
          </button>
        ) : null}
        <span className={cn('font-mono tabular-nums', length > max ? 'font-bold text-danger' : 'text-faint')}>
          {length}/{max}
        </span>
      </div>
    </div>
  );
}

/**
 * Edits the text of one vendor's coupon page. Fields start with what the page
 * is showing now (saved text, else generated), and anything left unchanged or
 * cleared is stored as "use the generated text", so the page keeps following
 * the vendor's live coupon instead of freezing today's wording.
 */
export function CouponPageForm({
  slug,
  current,
  defaults,
  customized,
  disabled,
}: {
  slug: string;
  current: CouponPageContent;
  /** The generated text, so each field can show whether it has been edited and be restored. */
  defaults: CouponPageContent;
  customized: boolean;
  /** True when the text table isn't set up, so saving would fail. */
  disabled: boolean;
}) {
  const action = saveCouponPageContentAction.bind(null, slug);
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
  const dirty = !sameValues(values, saved);

  const steps = cleanSteps(values.steps);
  const stepsEdited = steps.join('\n') !== cleanSteps(generated.steps).join('\n');
  const stepsTooLong = values.steps.some((step) => step.length > COUPON_STEP_MAX);

  const setSteps = (next: string[]) => setValues((previous) => ({ ...previous, steps: next }));
  const updateStep = (index: number, text: string) =>
    setSteps(values.steps.map((step, i) => (i === index ? text : step)));
  const removeStep = (index: number) => setSteps(values.steps.filter((_, i) => i !== index));
  const moveStep = (index: number, by: -1 | 1) => {
    const target = index + by;
    if (target < 0 || target >= values.steps.length) return;
    const next = [...values.steps];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setSteps(next);
  };

  const setDetail = (key: CouponDetailKey, value: string) =>
    setValues((previous) => ({ ...previous, details: { ...previous.details, [key]: value } }));

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
      const result = await resetCouponPageContentAction(slug);
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
  const invalid = stepsTooLong;

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
      <Section
        step={1}
        icon={<DocumentIcon className="h-5 w-5" />}
        title="Intro"
        description="The paragraph under the page heading. Leave it as is to use the supplier's own description."
      >
        <div>
          <FieldHeader
            htmlFor="intro"
            label="Intro text"
            edited={values.intro.trim() !== generated.intro.trim()}
            length={values.intro.length}
            max={COUPON_TEXT_MAX}
            onRestore={() => setValues((previous) => ({ ...previous, intro: generated.intro }))}
          />
          <textarea
            id="intro"
            name="intro"
            rows={3}
            value={values.intro}
            onChange={(event) => setValues((previous) => ({ ...previous, intro: event.target.value }))}
            className={INPUT_CLASS}
          />
        </div>
      </Section>

      <Section
        step={2}
        icon={<TagIcon className="h-5 w-5" />}
        title="Coupon details"
        description="The rows of the Coupon Details table. Write the coupon code wherever it should appear and it is highlighted on the page."
      >
        {COUPON_DETAIL_KEYS.map((key) => (
          <div key={key}>
            <FieldHeader
              htmlFor={`detail_${key}`}
              label={COUPON_DETAIL_LABELS[key]}
              edited={values.details[key].trim() !== generated.details[key].trim()}
              length={values.details[key].length}
              max={COUPON_TEXT_MAX}
              onRestore={() => setDetail(key, generated.details[key])}
            />
            <textarea
              id={`detail_${key}`}
              name={`detail_${key}`}
              rows={2}
              value={values.details[key]}
              onChange={(event) => setDetail(key, event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        ))}
      </Section>

      <Section
        step={3}
        icon={<ListIcon className="h-5 w-5" />}
        title="How to use"
        description={`Add each step in its own box, up to ${COUPON_STEPS_MAX}. Steps are numbered automatically on the page.`}
      >
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-content">Steps</p>
              <span
                className={cn(
                  'rounded-pill px-2 py-0.5 text-micro font-bold uppercase',
                  stepsEdited ? 'bg-accent-soft text-accent-strong' : 'bg-surface-sunken text-faint',
                )}
              >
                {stepsEdited ? 'Edited' : 'Generated'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {stepsEdited ? (
                <button
                  type="button"
                  onClick={() => setSteps([...generated.steps])}
                  className="font-semibold text-accent transition-colors hover:text-accent-strong hover:underline"
                >
                  Restore generated
                </button>
              ) : null}
              <span className="font-mono tabular-nums text-faint">
                {values.steps.length}/{COUPON_STEPS_MAX} steps
              </span>
            </div>
          </div>

          {/* The page numbers them automatically; sent to the server as one step per line. */}
          <input type="hidden" name="steps" value={steps.join('\n')} />

          <ol className="space-y-3">
            {values.steps.map((step, index) => {
              const stepEdited = step.trim() !== (generated.steps[index]?.trim() ?? '');
              const tooLong = step.length > COUPON_STEP_MAX;
              return (
                <li
                  key={index}
                  className="rounded-card border border-line bg-surface p-3 transition-colors focus-within:border-accent/50 sm:p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-brand text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <label htmlFor={`step_${index}`} className="text-sm font-bold text-content">
                        Step {index + 1}
                      </label>
                      <span
                        className={cn(
                          'rounded-pill px-2 py-0.5 text-micro font-bold uppercase',
                          stepEdited ? 'bg-accent-soft text-accent-strong' : 'bg-surface-sunken text-faint',
                        )}
                      >
                        {stepEdited ? 'Edited' : 'Generated'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStep(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move step ${index + 1} up`}
                        className="rounded-chip p-1.5 text-muted transition-colors hover:bg-accent-tint hover:text-accent-strong disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowRightIcon className="h-4 w-4 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(index, 1)}
                        disabled={index === values.steps.length - 1}
                        aria-label={`Move step ${index + 1} down`}
                        className="rounded-chip p-1.5 text-muted transition-colors hover:bg-accent-tint hover:text-accent-strong disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowRightIcon className="h-4 w-4 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        aria-label={`Remove step ${index + 1}`}
                        className="rounded-chip p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    id={`step_${index}`}
                    rows={2}
                    value={step}
                    onChange={(event) => updateStep(index, event.target.value)}
                    aria-invalid={tooLong}
                    className={cn(INPUT_CLASS, 'mt-2.5', tooLong && 'border-danger')}
                  />
                  <p
                    className={cn(
                      'mt-1 text-right font-mono text-xs tabular-nums',
                      tooLong ? 'font-bold text-danger' : 'text-faint',
                    )}
                  >
                    {step.length}/{COUPON_STEP_MAX}
                  </p>
                </li>
              );
            })}
          </ol>

          {values.steps.length === 0 ? (
            <p className="rounded-card border border-dashed border-line p-5 text-center text-sm text-muted">
              No steps. The page will show the generated steps until you add one.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setSteps([...values.steps, ''])}
            disabled={values.steps.length >= COUPON_STEPS_MAX}
            className="mt-3 inline-flex items-center gap-2 rounded-chip border border-dashed border-accent/50 bg-accent-tint px-4 py-2.5 text-sm font-bold text-accent-strong transition-colors hover:border-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Add step
          </button>
          {values.steps.length >= COUPON_STEPS_MAX ? (
            <p className="mt-1.5 text-xs text-muted">You&rsquo;ve reached the {COUPON_STEPS_MAX}-step limit.</p>
          ) : null}
        </div>

        <div>
          <FieldHeader
            htmlFor="workingNote"
            label="Working note"
            edited={values.workingNote.trim() !== generated.workingNote.trim()}
            length={values.workingNote.length}
            max={COUPON_TEXT_MAX}
            onRestore={() => setValues((previous) => ({ ...previous, workingNote: generated.workingNote }))}
          />
          <textarea
            id="workingNote"
            name="workingNote"
            rows={3}
            value={values.workingNote}
            onChange={(event) => setValues((previous) => ({ ...previous, workingNote: event.target.value }))}
            className={INPUT_CLASS}
          />
        </div>
      </Section>

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
              disabled={busy || disabled || !dirty || invalid}
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
