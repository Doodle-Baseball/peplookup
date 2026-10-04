import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { site, whatsappUrl } from '@/config/site';
import { REQUEST_COOKIE, VENDOR_LISTING_CONTACT } from '@/config/vendor-listing';
import { AutoRefresh } from '@/components/vendor-listing/auto-refresh';
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  ExternalIcon,
  MailIcon,
  StoreIcon,
} from '@/components/icons/icons';
import { verifyPaymentId, verifyWithWhop } from '@/lib/vendor-listing/payment';
import { getRequest, type VendorListingRequest } from '@/lib/vendor-listing/requests';

export const metadata: Metadata = {
  title: 'Request received | PepLookup',
  robots: { index: false, follow: false },
};

// Payment status changes after the buyer lands here; never serve a snapshot.
export const dynamic = 'force-dynamic';

interface ThanksSearchParams {
  request?: string;
  payment_id?: string;
}

async function loadRequest(
  requestId: string | undefined,
  paymentId: string | undefined,
): Promise<VendorListingRequest | null> {
  if (!requestId) return null;
  try {
    const request = await getRequest(requestId);
    if (!request || request.status === 'PAID') return request;
    // The webhook is the primary signal, but it can arrive after the buyer
    // does. Whop puts the payment id in the redirect, so confirming that one
    // payment is a single quick lookup; scanning the payments list is the
    // slower fallback for a redirect that arrives without it.
    if (paymentId) return await verifyPaymentId(request, paymentId);
    await verifyWithWhop(request);
    return await getRequest(requestId);
  } catch (error) {
    console.error('[vendor-listing] Could not load request for the thanks page:', error);
    return null;
  }
}

/**
 * Everything that needs the database or Whop lives here, behind Suspense, so
 * the page itself paints at once and only this card waits.
 */
async function RequestStatus({ searchParams }: { searchParams: Promise<ThanksSearchParams> }) {
  const { request: requestParam, payment_id: paymentId } = await searchParams;
  // Whop sends the buyer back without our request id, so fall back to the cookie set at submit.
  const requestId = requestParam ?? (await cookies()).get(REQUEST_COOKIE)?.value;
  const request = await loadRequest(requestId?.trim().toUpperCase(), paymentId?.trim());
  if (!request) return null;

  // Paid: nothing to add. The headline already says it; the lookup above is
  // what records the payment.
  if (request.status === 'PAID') return null;

  return (
    <div
      role="status"
      className="animate-fade-up mx-auto mt-8 flex max-w-md items-start gap-3 rounded-card border border-warn/30 bg-warn/10 p-4 text-left"
    >
      <AutoRefresh />
      <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
      <div>
        <p className="text-sm font-bold text-content">Confirming your payment…</p>
        <p className="mt-0.5 text-xs text-muted">This usually takes a few seconds and updates on its own.</p>
      </div>
    </div>
  );
}

function RequestStatusSkeleton() {
  return <div aria-hidden="true" className="mx-auto mt-8 h-16 max-w-md animate-pulse rounded-card bg-surface-sunken" />;
}

const NEXT_STEPS: { title: string; body: string; done: boolean }[] = [
  {
    title: 'Request submitted',
    body: 'We have your application and your payment details.',
    done: true,
  },
  {
    title: `We contact you within ${VENDOR_LISTING_CONTACT.responseWindow}`,
    body: 'Expect an email from us to confirm your details and agree your listing.',
    done: false,
  },
  {
    title: 'Your brand is listed',
    body: `We add your brand to ${site.name}, with your commission and discount details.`,
    done: false,
  },
];

export default function VendorListingThanksPage({
  searchParams,
}: {
  searchParams: Promise<ThanksSearchParams>;
}) {
  const contact = VENDOR_LISTING_CONTACT;

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-drift absolute left-1/2 top-0 h-96 w-full max-w-3xl -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="dot-grid absolute inset-x-0 top-0 h-80 opacity-50" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="text-center">
          <span className="animate-check-pop relative mx-auto flex h-20 w-20 items-center justify-center rounded-pill bg-ok text-white shadow-lift">
            <span aria-hidden="true" className="plan-glow absolute inset-0 rounded-pill" />
            <CheckIcon className="relative h-9 w-9" />
          </span>

          <h1 className="animate-fade-up animate-delay-100 mt-7 text-4xl font-black leading-tight tracking-tight text-content sm:text-6xl">
            Thank you!
          </h1>
          <p className="animate-fade-up animate-delay-200 mt-3 text-balance text-lg font-semibold text-muted sm:text-2xl">
            {contact.name} will contact you within {contact.responseWindow}.
          </p>

          <Suspense fallback={<RequestStatusSkeleton />}>
            <RequestStatus searchParams={searchParams} />
          </Suspense>
        </header>

        <section
          aria-labelledby="next-heading"
          className="animate-fade-up animate-delay-300 mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:mt-12 sm:p-8"
        >
          <h2 id="next-heading" className="text-micro font-bold uppercase tracking-wide text-faint">
            What happens next
          </h2>
          <ol className="mt-5">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                {index < NEXT_STEPS.length - 1 ? (
                  <span aria-hidden="true" className="absolute left-4 top-9 h-full w-px bg-line" />
                ) : null}
                <span
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-sm font-black ${
                    step.done ? 'bg-ok text-white' : 'border border-line bg-surface text-muted'
                  }`}
                >
                  {step.done ? <CheckIcon className="h-4 w-4" /> : index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm font-black text-content">{step.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="contact-heading" className="animate-fade-up animate-delay-400 mt-6">
          <h2 id="contact-heading" className="sr-only">
            Contact {contact.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={`mailto:${contact.email}`}
              className="card-3d group flex items-center gap-4 rounded-card border border-line bg-surface-raised p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                <MailIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-micro font-bold uppercase tracking-wide text-faint">Email</span>
                <span className="block truncate text-sm font-bold text-content group-hover:text-accent">
                  {contact.email}
                </span>
              </span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-3d group flex items-center gap-4 rounded-card border border-line bg-surface-raised p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-accent-soft text-accent-strong">
                <ExternalIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-micro font-bold uppercase tracking-wide text-faint">WhatsApp</span>
                <span className="block truncate text-sm font-bold text-content group-hover:text-accent">
                  {site.whatsapp}
                </span>
              </span>
            </a>
          </div>
        </section>

        <div className="animate-fade-up animate-delay-400 mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="btn-3d inline-flex items-center justify-center gap-2 rounded-chip bg-brand px-7 py-3.5 text-sm font-bold text-white"
          >
            Back to PepLookup
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/suppliers"
            className="inline-flex items-center justify-center gap-2 rounded-chip border border-line bg-surface-raised px-7 py-3.5 text-sm font-bold text-content shadow-card transition-colors hover:border-brand"
          >
            <StoreIcon className="h-4 w-4" />
            Browse suppliers
          </Link>
        </div>
      </div>
    </div>
  );
}
