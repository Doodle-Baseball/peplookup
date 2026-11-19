'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { submitVendorApplication } from '@/app/(marketing)/supplier-listing/actions';
import {
  LISTED_PLAN_ID,
  PAYMENT_METHOD_LABEL,
  SCREENSHOT_TYPES,
  VENDOR_LISTING_CONTACT,
  formatPlanPrice,
  vendorListingPlan,
  type VendorPaymentDetails,
  type VendorPaymentMethod,
} from '@/config/vendor-listing';
import {
  fieldErrorsFrom,
  screenshotProblem,
  vendorApplicationSchema,
  type SubmitFieldErrors,
} from '@/lib/vendor-listing/application';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DocumentIcon,
  LockIcon,
  MailIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { site } from '@/config/site';
import { cn } from '@/lib/cn';

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = { 1: 'Brand Details', 2: 'Payment', 3: 'Confirmation' };

interface BrandValues {
  organizationName: string;
  email: string;
  contactNumber: string;
  websiteUrl: string;
  affiliateSignupUrl: string;
  coaPageUrl: string;
  commissionPercent: string;
  customerDiscountPercent: string;
  message: string;
}

type BrandField = keyof BrandValues;

const INITIAL_VALUES: BrandValues = {
  organizationName: '',
  email: '',
  contactNumber: '',
  websiteUrl: '',
  affiliateSignupUrl: '',
  coaPageUrl: '',
  commissionPercent: '10',
  customerDiscountPercent: '15',
  message: '',
};

const PAYMENT_METHODS: readonly VendorPaymentMethod[] = ['btc', 'paypal'];

const INPUT_CLASS =
  'mt-1.5 w-full rounded-chip border bg-surface-raised px-4 py-3 text-base text-content sm:text-sm outline-none transition-colors placeholder:text-faint hover:border-faint focus:border-accent focus-visible:ring-4 focus-visible:ring-accent/15';

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-danger">
        {error}
      </p>
    );
  }
  return hint ? (
    <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
      {hint}
    </p>
  ) : null;
}

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
  suffix,
  wide = false,
}: {
  label: string;
  name: BrandField;
  value: string;
  onChange: (name: BrandField, value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: 'text' | 'decimal' | 'tel' | 'email' | 'url';
  autoComplete?: string;
  suffix?: string;
  /** Spans both columns of the form grid. */
  wide?: boolean;
}) {
  const id = useId();
  const input = (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete={autoComplete}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      onChange={(event) => onChange(name, event.target.value)}
      className={cn(INPUT_CLASS, suffix && 'pr-9', error ? 'border-danger' : 'border-line')}
    />
  );
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <label htmlFor={id} className="block text-sm font-bold text-content">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-semibold text-faint">Optional</span>
        )}
      </label>
      {suffix ? (
        <div className="relative">
          {input}
          <span aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 mt-0.5 -translate-y-1/2 text-sm font-bold text-muted">
            {suffix}
          </span>
        </div>
      ) : (
        input
      )}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

/** A bar per step that fills as the applicant moves through the form. */
function Stepper({ step }: { step: Step }) {
  return (
    <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Application progress">
      {([1, 2, 3] as const).map((number) => {
        const reached = number <= step;
        const current = number === step;
        return (
          <li key={number} aria-current={current ? 'step' : undefined}>
            <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-pill bg-line">
              <span
                className={cn(
                  'block h-full origin-left rounded-pill bg-accent transition-transform duration-500 ease-out',
                  reached ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </span>
            <span className={cn('mt-2 flex items-center gap-1 text-xs font-bold sm:text-sm', reached ? 'text-content' : 'text-muted')}>
              <span className="sr-only">Step </span>
              {number}. {STEP_LABELS[number]}
              {number < step ? (
                <>
                  <CheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-accent" />
                  <span className="sr-only"> (completed)</span>
                </>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          (error: unknown) => console.error('[vendor-listing] Copy failed:', error),
        );
      }}
      aria-label={`Copy ${label}`}
      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-chip border border-line bg-surface-raised px-3.5 py-2.5 text-xs font-bold text-content transition-colors hover:border-brand"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-ok" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/** Step 1 → 2 → 3, on the page itself. Nothing reaches the server until the payment screenshot is attached. */
export function VendorListingForm({ paymentDetails }: { paymentDetails: VendorPaymentDetails }) {
  const plan = vendorListingPlan(LISTED_PLAN_ID);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileId = useId();
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<BrandValues>(INITIAL_VALUES);
  const [method, setMethod] = useState<VendorPaymentMethod | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SubmitFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isFirstRender = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Blocks a second submit fired before the pending state has re-rendered the button as disabled.
  const isSubmittingRef = useRef(false);

  // Each step change moves focus to the step's heading, so keyboard and screen
  // reader users land on the new content rather than a button that vanished.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  // A local URL for the chosen image, released whenever it changes or the form
  // unmounts. The file stays in the browser until the application is submitted.
  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const chooseScreenshot = (file: File | null) => {
    // Cleared so picking the same file again after removing it still fires a change.
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    const problem = screenshotProblem(file);
    if (problem) {
      setFieldErrors((current) => ({ ...current, paymentScreenshot: problem }));
      return;
    }
    setScreenshot(file);
    setFieldErrors((current) => ({ ...current, paymentScreenshot: undefined }));
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setFieldErrors((current) => ({ ...current, paymentScreenshot: undefined }));
    fileInputRef.current?.focus();
  };


  const updateField = (name: BrandField, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const goToPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = vendorApplicationSchema.safeParse({ ...values, plan: LISTED_PLAN_ID });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const errors: SubmitFieldErrors = {};
    if (!method) errors.paymentMethod = 'Choose how you paid';
    const problem = screenshotProblem(screenshot);
    if (problem) errors.paymentScreenshot = problem;
    if (!method || !screenshot || problem) {
      setFieldErrors(errors);
      return;
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const formData = new FormData();
    for (const [name, value] of Object.entries(values)) formData.append(name, value);
    formData.append('paymentMethod', method);
    formData.append('paymentScreenshot', screenshot);

    startTransition(async () => {
      const result = await submitVendorApplication(formData).catch((error: unknown) => {
        console.error('[vendor-listing] Submit failed:', error);
        return null;
      });
      if (result?.ok) {
        setStep(3);
        return;
      }
      isSubmittingRef.current = false;
      if (!result) {
        setFormError('Your application could not be sent. Check your connection and try again.');
        return;
      }
      setFieldErrors(result.fieldErrors);
      setFormError(result.error);
      // A brand-details error found only by the server sends the applicant back to fix it.
      const brandFieldFailed = Object.keys(result.fieldErrors).some((key) => key in INITIAL_VALUES);
      if (brandFieldFailed) setStep(1);
    });
  };

  const availableMethods = PAYMENT_METHODS.filter((option) => paymentDetails[option] !== null);

  const price = formatPlanPrice(plan);
  const brandName = values.organizationName.trim();

  return (
    <div>
      <div className="rounded-panel border border-line bg-surface-raised shadow-panel">
        <div className="px-5 pt-6 sm:px-8 sm:pt-8">
          <Stepper step={step} />
        </div>

        <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
          {step === 1 ? (
            <form onSubmit={goToPayment} noValidate className="animate-fade-up">
              <h3 ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-xl font-black tracking-tight text-content outline-none sm:text-2xl">
                Get your peptide brand listed
              </h3>
              <p className="mt-2 text-sm text-muted">Share your brand details, then pay {price} with Bitcoin or PayPal.</p>

              <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <TextField
                  label="Brand Name"
                  name="organizationName"
                  autoComplete="organization"
                  placeholder="Acme Peptides"
                  value={values.organizationName}
                  onChange={updateField}
                  error={fieldErrors.organizationName}
                />
                <TextField
                  label="Website Link"
                  name="websiteUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://your-store.com"
                  value={values.websiteUrl}
                  onChange={updateField}
                  error={fieldErrors.websiteUrl}
                />
                <TextField
                  label="Contact Email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@your-store.com"
                  value={values.email}
                  onChange={updateField}
                  error={fieldErrors.email}
                />
                <TextField
                  label="Contact Number"
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
                  label="Affiliate Program Sign-Up Link"
                  name="affiliateSignupUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://your-store.com/affiliates"
                  value={values.affiliateSignupUrl}
                  onChange={updateField}
                  error={fieldErrors.affiliateSignupUrl}
                  hint="The page where affiliates register for your program."
                />
                <TextField
                  label="COA Page Link"
                  name="coaPageUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://your-store.com/coa"
                  value={values.coaPageUrl}
                  onChange={updateField}
                  error={fieldErrors.coaPageUrl}
                />
                <TextField
                  label="Commission Percentage"
                  name="commissionPercent"
                  inputMode="decimal"
                  suffix="%"
                  value={values.commissionPercent}
                  onChange={updateField}
                  error={fieldErrors.commissionPercent}
                  hint="What you pay PepLookup per sale."
                />
                <TextField
                  label="Customer Discount Percentage"
                  name="customerDiscountPercent"
                  inputMode="decimal"
                  suffix="%"
                  value={values.customerDiscountPercent}
                  onChange={updateField}
                  error={fieldErrors.customerDiscountPercent}
                  hint="The discount shoppers receive when using our coupon code."
                />
                <MessageField value={values.message} onChange={updateField} error={fieldErrors.message} />
              </div>

              <button
                type="submit"
                className="btn-3d mt-6 inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-6 py-3.5 text-sm font-bold text-white"
              >
                Continue to payment ({price})
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={submit} noValidate className="animate-fade-up">
              <h3 ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-xl font-black tracking-tight text-content outline-none sm:text-2xl">
                Pay {price} for {brandName || 'your brand'}
              </h3>
              <p className="mt-1.5 text-sm text-muted">
                Choose how you want to pay. {plan.name} listing, {price} per {plan.interval === 'month' ? 'month' : 'year'}.
              </p>

              {availableMethods.length === 0 ? (
                <p role="alert" className="mt-6 rounded-card border border-warn/30 bg-warn/5 px-4 py-3 text-sm font-semibold text-content">
                  Online payment details are not available right now. Please email us and we will send them to you.
                </p>
              ) : null}

              <div className="mt-6 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6">
                <fieldset aria-describedby={fieldErrors.paymentMethod ? 'payment-method-error' : undefined}>
                  <legend className="text-sm font-bold text-content">Payment method</legend>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((option) => {
                      const available = paymentDetails[option] !== null;
                      const selected = method === option;
                      return (
                        <label
                          key={option}
                          className={cn(
                            'relative flex flex-col items-center justify-center gap-1 rounded-card border px-4 py-4 text-center text-base font-bold transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2',
                            available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                            selected
                              ? 'border-accent bg-accent text-white shadow-lift'
                              : 'border-line bg-surface text-content hover:-translate-y-0.5 hover:border-brand',
                          )}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={option}
                            checked={selected}
                            disabled={!available}
                            onChange={() => {
                              setMethod(option);
                              setFieldErrors((current) => ({ ...current, paymentMethod: undefined }));
                            }}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-2">
                            <WalletIcon className="h-4 w-4 shrink-0" />
                            {option === 'btc' ? 'Bitcoin' : 'PayPal'}
                          </span>
                          {available ? null : <span className="text-xs font-semibold">Unavailable</span>}
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.paymentMethod ? (
                    <p id="payment-method-error" className="mt-2 text-xs font-semibold text-danger">
                      {fieldErrors.paymentMethod}
                    </p>
                  ) : null}
                </fieldset>

                {method && paymentDetails[method] ? (
                  <div key={method} className="animate-fade-up mt-4 rounded-card border border-accent/25 bg-accent-tint p-4">
                    <p className="font-mono text-micro font-semibold uppercase tracking-widest text-accent-strong">
                      {PAYMENT_METHOD_LABEL[method]} · {method === 'btc' ? 'wallet address' : 'email address'}
                    </p>
                    <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <code className="min-w-0 flex-1 break-all rounded-chip border border-line bg-surface-raised px-4 py-3 font-mono text-sm text-content">
                        {paymentDetails[method]}
                      </code>
                      <CopyButton
                        value={paymentDetails[method] ?? ''}
                        label={method === 'btc' ? 'BTC wallet address' : 'PayPal email address'}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 flex items-center gap-2.5 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-muted">
                    <LockIcon className="h-4 w-4 shrink-0" />
                    Select Bitcoin or PayPal to see the payment details.
                  </p>
                )}

                {method ? (
                  <div className="animate-fade-up mt-5 border-t border-line pt-5">
                    <label htmlFor={fileId} className="block text-sm font-bold text-content">
                      Payment Screenshot
                      <span aria-hidden="true" className="ml-0.5 text-danger">
                        *
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id={fileId}
                      type="file"
                      name="paymentScreenshot"
                      accept={SCREENSHOT_TYPES.join(',')}
                      aria-invalid={Boolean(fieldErrors.paymentScreenshot)}
                      aria-describedby={fieldErrors.paymentScreenshot ? `${fileId}-error` : undefined}
                      onChange={(event) => chooseScreenshot(event.target.files?.[0] ?? null)}
                      className="peer sr-only"
                    />
                    {screenshot && previewUrl ? (
                      <div className="relative mt-2 overflow-hidden rounded-card border border-line bg-surface peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                        <div className="relative h-56 w-full sm:h-64">
                          <Image
                            src={previewUrl}
                            alt={`Preview of your payment screenshot, ${screenshot.name}`}
                            fill
                            unoptimized
                            sizes="(min-width: 640px) 600px, 100vw"
                            className="object-contain p-2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          aria-label="Remove screenshot"
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-surface-raised text-content shadow-lift transition-colors hover:border-danger hover:text-danger"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={fileId}
                        className={cn(
                          'mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed bg-surface px-4 py-8 text-center transition-colors hover:border-brand peer-focus-visible:border-brand',
                          fieldErrors.paymentScreenshot ? 'border-danger' : 'border-line',
                        )}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-accent-tint text-accent">
                          <DocumentIcon className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-bold text-content">Click to upload a screenshot of your completed payment.</span>
                        <span className="text-xs text-muted">PNG, JPG or WebP, up to 4 MB.</span>
                      </label>
                    )}
                    {fieldErrors.paymentScreenshot ? (
                      <p id={`${fileId}-error`} className="mt-2 text-xs font-semibold text-danger">
                        {fieldErrors.paymentScreenshot}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {formError ? (
                <p role="alert" className="mt-6 rounded-chip border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isPending || availableMethods.length === 0}
                className="btn-3d mt-6 inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit application
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setStep(1);
                }}
                disabled={isPending}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-content disabled:opacity-60"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Edit brand details
              </button>
            </form>
          ) : null}

          {step === 3 ? (
            <div role="status" className="animate-fade-up mx-auto max-w-xl py-4 text-center">
              <span className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-pill bg-ok/15 text-ok">
                <CheckCircleIcon className="h-8 w-8" />
              </span>
              <h3 ref={headingRef} tabIndex={-1} className="mt-5 scroll-mt-24 text-2xl font-extrabold tracking-tight text-content outline-none sm:text-3xl">
                Thank You for Your Application!
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Your supplier listing application has been successfully submitted. The {site.name} team will review your
                application and contact you with the next steps.
              </p>
              <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm text-muted">
                <MailIcon className="h-4 w-4 shrink-0 text-accent" />
                Questions? Email us at
                <a href={`mailto:${VENDOR_LISTING_CONTACT.email}`} className="font-semibold text-accent hover:underline">
                  {VENDOR_LISTING_CONTACT.email}
                </a>
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-semibold text-muted">
        <LockIcon className="h-4 w-4 shrink-0" />
        Your listing goes live only after our team confirms your payment.
      </p>
    </div>
  );
}

function MessageField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (name: BrandField, value: string) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-bold text-content">
        Anything Else?
        <span className="ml-1.5 text-xs font-semibold text-faint">Optional</span>
      </label>
      <textarea
        id={id}
        name="message"
        value={value}
        rows={4}
        maxLength={1000}
        placeholder="Anything else you would like us to know?"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange('message', event.target.value)}
        className={cn(INPUT_CLASS, 'resize-y', error ? 'border-danger' : 'border-line')}
      />
      <FieldMessage id={id} error={error} />
    </div>
  );
}
