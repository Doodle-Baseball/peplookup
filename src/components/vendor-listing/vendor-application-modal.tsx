'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { submitVendorApplication } from '@/app/(marketing)/vendor-listing/actions';
import type { VendorListingPlan } from '@/config/vendor-listing';
import {
  fieldErrorsFrom,
  vendorApplicationSchema,
  type VendorApplicationFieldErrors,
} from '@/lib/vendor-listing/application';
import { ArrowRightIcon, CloseIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

interface FormValues {
  organizationName: string;
  email: string;
  contactNumber: string;
  websiteUrl: string;
  commissionPercent: string;
  customerDiscountPercent: string;
  message: string;
}

const EMPTY_VALUES: FormValues = {
  organizationName: '',
  email: '',
  contactNumber: '',
  websiteUrl: '',
  commissionPercent: '',
  customerDiscountPercent: '',
  message: '',
};

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  required = true,
  placeholder,
  inputMode,
  autoComplete,
  inputRef,
}: {
  label: string;
  name: keyof FormValues;
  value: string;
  onChange: (name: keyof FormValues, value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: 'text' | 'decimal' | 'tel' | 'email' | 'url';
  autoComplete?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-content">
        {label}
        {required ? null : <span className="ml-1.5 text-xs font-semibold text-faint">Optional</span>}
      </label>
      <input
        id={id}
        ref={inputRef}
        name={name}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(name, event.target.value)}
        className={cn(
          'mt-1.5 w-full rounded-chip border bg-surface px-3.5 py-2.5 text-sm text-content shadow-card outline-none transition-shadow placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand',
          error ? 'border-danger' : 'border-line',
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function MessageField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (name: keyof FormValues, value: string) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-content">
        Message
        <span className="ml-1.5 text-xs font-semibold text-faint">Optional</span>
      </label>
      <textarea
        id={id}
        name="message"
        value={value}
        rows={3}
        maxLength={1000}
        placeholder="Anything else you would like us to know?"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange('message', event.target.value)}
        className={cn(
          'mt-1.5 w-full resize-y rounded-chip border bg-surface px-3.5 py-2.5 text-sm text-content shadow-card outline-none transition-shadow placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand',
          error ? 'border-danger' : 'border-line',
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function VendorApplicationModal({
  plan,
  onClose,
}: {
  plan: VendorListingPlan;
  onClose: () => void;
}) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<VendorApplicationFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Stays true after a successful submit: the browser is leaving for Whop and
  // re-enabling the button in that gap would invite a second application.
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isRedirecting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, isRedirecting]);

  const updateField = (name: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const input = { ...values, plan: plan.id };
    const parsed = vendorApplicationSchema.safeParse(input);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    startTransition(async () => {
      const result = await submitVendorApplication(input);
      if (result.ok) {
        setIsRedirecting(true);
        window.location.assign(result.checkoutUrl);
        return;
      }
      setFieldErrors(result.fieldErrors);
      setFormError(result.error);
    });
  };

  const isBusy = isPending || isRedirecting;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close application form"
        disabled={isRedirecting}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 h-full w-full bg-black/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-modal-pop relative flex max-h-dvh w-full max-w-lg flex-col overflow-hidden rounded-t-panel border border-line bg-surface-raised shadow-panel sm:max-h-menu sm:rounded-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-brand-tint px-6 py-5">
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-brand-strong">
              Step 1 of 2 · Application
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-black text-content">
              List your brand
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRedirecting}
            aria-label="Close application form"
            className="rounded-chip p-2 text-muted transition-colors hover:bg-surface-sunken hover:text-content"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <TextField
              label="Organisation name"
              name="organizationName"
              value={values.organizationName}
              onChange={updateField}
              error={fieldErrors.organizationName}
              autoComplete="organization"
              inputRef={firstFieldRef}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={updateField}
              error={fieldErrors.email}
              hint="Use this same email at checkout so we can match your payment."
            />
            <TextField
              label="Contact number"
              name="contactNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required={false}
              value={values.contactNumber}
              onChange={updateField}
              error={fieldErrors.contactNumber}
            />
            <TextField
              label="Website link"
              name="websiteUrl"
              type="url"
              inputMode="url"
              placeholder="https://your-store.com"
              value={values.websiteUrl}
              onChange={updateField}
              error={fieldErrors.websiteUrl}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Commission %"
                name="commissionPercent"
                inputMode="decimal"
                placeholder="10"
                value={values.commissionPercent}
                onChange={updateField}
                error={fieldErrors.commissionPercent}
                hint="What you pay PepLookup per sale."
              />
              <TextField
                label="Customer discount %"
                name="customerDiscountPercent"
                inputMode="decimal"
                placeholder="15"
                value={values.customerDiscountPercent}
                onChange={updateField}
                error={fieldErrors.customerDiscountPercent}
                hint="Discount shoppers get with our code."
              />
            </div>

            <MessageField value={values.message} onChange={updateField} error={fieldErrors.message} />

            {formError ? (
              <p role="alert" className="rounded-chip border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                {formError}
              </p>
            ) : null}
          </div>

          <div className="border-t border-line bg-surface-raised px-6 py-4">
            <button
              type="submit"
              disabled={isBusy}
              className="btn-3d inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy ? 'Taking you to secure checkout…' : 'Next: continue to payment'}
              {isBusy ? null : <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
