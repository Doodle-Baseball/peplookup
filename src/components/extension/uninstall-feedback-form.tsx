'use client';

import { useActionState } from 'react';
import { submitUninstallFeedback, type UninstallFeedbackState } from '@/app/(marketing)/extension/uninstalled/actions';
import { HONEYPOT_FIELD, UNINSTALL_DETAILS_MAX_LENGTH, UNINSTALL_REASONS } from '@/lib/extension/schema';
import { CheckIcon } from '@/components/icons/icons';

const INITIAL_STATE: UninstallFeedbackState = { status: 'idle', message: null };

export function UninstallFeedbackForm() {
  const [rawState, formAction, pending] = useActionState(submitUninstallFeedback, INITIAL_STATE);
  // An action that can't be resolved (a page open across a deploy) yields undefined.
  const state = rawState ?? INITIAL_STATE;

  if (state.status === 'sent') {
    return (
      <p role="status" className="flex items-center justify-center gap-2 rounded-card border border-ok/30 bg-ok/10 p-5 text-sm font-bold text-content">
        <CheckIcon className="h-4 w-4 text-ok" />
        Thanks, your answer was sent.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <fieldset>
        <legend className="text-sm font-black text-content">Why did you remove it?</legend>
        <p className="mt-1 text-xs text-muted">Optional. Pick one, add a note, or both.</p>
        <div className="mt-3 space-y-2">
          {UNINSTALL_REASONS.map((reason) => (
            <label
              key={reason.value}
              className="flex cursor-pointer items-center gap-3 rounded-chip border border-line bg-surface px-4 py-3 text-sm text-content transition-colors hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input type="radio" name="reason" value={reason.value} className="h-4 w-4 accent-brand" />
              {reason.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="uninstall-details" className="block text-sm font-semibold text-content">
          Anything else? <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="uninstall-details"
          name="details"
          rows={4}
          maxLength={UNINSTALL_DETAILS_MAX_LENGTH}
          className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
        />
      </div>

      {/* Off-screen and skipped by keyboard and screen readers; only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-full h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this empty</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' && state.message ? (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-3d inline-flex w-full items-center justify-center rounded-chip bg-brand px-7 py-3.5 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
      >
        {pending ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
