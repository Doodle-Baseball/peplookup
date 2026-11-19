'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  approveRequest,
  deleteVendorRequest,
  markRequestsSeen,
  rejectRequest,
  verifyRequestPayment,
  type RequestActionState,
} from '@/app/admin/(dashboard)/vendor-listing/actions';
import { PAYMENT_METHOD_LABEL, vendorListingPlan, type VendorPaymentMethod } from '@/config/vendor-listing';
import {
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  DocumentIcon,
  ExternalIcon,
  GlobeIcon,
  StoreIcon,
  TrashIcon,
} from '@/components/icons/icons';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/format';

/** Serializable mirror of VendorListingRequest (the server type pulls in server-only code). */
export interface BoardRequest {
  requestId: string;
  plan: 'basic' | 'pro';
  amountCents: number;
  organizationName: string;
  email: string;
  contactNumber: string | null;
  websiteUrl: string;
  affiliateSignupUrl: string | null;
  coaPageUrl: string | null;
  commissionPercent: number;
  customerDiscountPercent: number;
  message: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  paymentMethod: VendorPaymentMethod | null;
  paymentVerifiedAt: string | null;
  reviewedAt: string | null;
  paidAt: string | null;
  seenAt: string | null;
  createdAt: string;
}

type Filter = 'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING_REVIEW', label: 'Awaiting review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
];

const MARK_SEEN_DELAY_MS = 3000;

type PaymentState = 'verified' | 'awaiting';

function paymentState(request: BoardRequest): PaymentState {
  return request.paymentVerifiedAt ? 'verified' : 'awaiting';
}

/**
 * "2m ago" depends on the moment it is rendered, so the server's text and the
 * browser's first render differ by seconds or minutes and React reports a
 * hydration mismatch. The mismatch is expected here, hence the suppression,
 * and the text is refreshed on a timer so it never goes stale on screen.
 */
function TimeAgo({ iso }: { iso: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((tick) => tick + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString()} suppressHydrationWarning>
      {timeAgo(iso)}
    </time>
  );
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(2)}%`;
}

function Stat({ label, value, delayClass }: { label: string; value: string; delayClass: string }) {
  return (
    <div className={cn('card-3d animate-fade-up rounded-card border border-line bg-surface-raised p-5', delayClass)}>
      <p className="text-micro font-bold uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-content">{value}</p>
    </div>
  );
}

function Badge({ tone, icon, children }: { tone: 'ok' | 'warn' | 'danger' | 'muted'; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-bold',
        tone === 'ok' && 'bg-ok/15 text-ok',
        tone === 'warn' && 'bg-warn/15 text-warn',
        tone === 'danger' && 'bg-danger/15 text-danger',
        tone === 'muted' && 'bg-surface-sunken text-muted',
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function PaymentBadge({ request }: { request: BoardRequest }) {
  const state = paymentState(request);
  if (state === 'verified') return <Badge tone="ok" icon={<CheckCircleIcon className="h-3.5 w-3.5" />}>Payment verified</Badge>;
  return <Badge tone="warn" icon={<ClockIcon className="h-3.5 w-3.5" />}>Payment to verify</Badge>;
}

function ListingBadge({ status }: { status: BoardRequest['status'] }) {
  if (status === 'APPROVED') return <Badge tone="ok" icon={<CheckCircleIcon className="h-3.5 w-3.5" />}>Approved</Badge>;
  if (status === 'REJECTED') return <Badge tone="danger" icon={<CloseIcon className="h-3.5 w-3.5" />}>Rejected</Badge>;
  return <Badge tone="warn" icon={<ClockIcon className="h-3.5 w-3.5" />}>Awaiting review</Badge>;
}

function Detail({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-2 lg:col-span-3')}>
      <dt className="text-micro font-bold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-content">{children}</dd>
    </div>
  );
}

function OutboundLink({ href }: { href: string | null }) {
  if (!href) return <>—</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
      <span className="break-all">{href.replace(/^https?:\/\//, '')}</span>
      <ExternalIcon className="h-3 w-3 shrink-0" />
    </a>
  );
}

const SECONDARY_BUTTON =
  'inline-flex items-center gap-2 rounded-chip border border-line bg-surface px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand disabled:opacity-70';

function RequestCard({
  request,
  screenshotUrl,
  isNew,
  index,
}: {
  request: BoardRequest;
  screenshotUrl: string | null;
  isNew: boolean;
  index: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<RequestActionState | null>(null);
  const plan = vendorListingPlan(request.plan);
  const payment = paymentState(request);
  const underReview = request.status === 'PENDING_REVIEW';

  const run = (action: (requestId: string) => Promise<RequestActionState>) => {
    startTransition(async () => {
      setFeedback(await action(request.requestId));
    });
  };

  const verify = () => {
    if (!window.confirm(`Mark the payment from ${request.organizationName} as verified? Only do this after seeing it in the wallet or PayPal account.`)) return;
    run(verifyRequestPayment);
  };

  const approve = () => {
    if (!window.confirm(`Approve the listing for ${request.organizationName}? You still add the supplier to publish it.`)) return;
    run(approveRequest);
  };

  const reject = () => {
    if (!window.confirm(`Reject the listing for ${request.organizationName}?`)) return;
    run(rejectRequest);
  };

  const remove = () => {
    const warning =
      payment === 'verified'
        ? 'This payment was verified. Deleting removes the record and screenshot here, but does not refund anything.'
        : 'This cannot be undone.';
    if (!window.confirm(`Delete the request from ${request.organizationName} (${request.requestId})? ${warning}`)) return;
    startTransition(async () => {
      const result = await deleteVendorRequest(request.requestId);
      // On success the card disappears with the refreshed list; only a failure needs showing.
      if (result.tone === 'error') setFeedback(result);
    });
  };

  return (
    <article
      className={cn(
        'card-3d animate-fade-up relative rounded-panel border bg-surface-raised p-6',
        isNew ? 'border-brand' : 'border-line',
      )}
      // Staggered entrance, capped so a long list doesn't make the last cards wait seconds.
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {isNew ? (
        <span className="absolute -top-2.5 left-6 rounded-pill bg-danger px-2.5 py-0.5 text-micro font-black uppercase tracking-wide text-white shadow-lift">
          New
        </span>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-black text-content">
            <StoreIcon className="h-5 w-5 shrink-0 text-brand" />
            <span className="truncate">{request.organizationName}</span>
          </h2>
          <p className="mt-1 font-mono text-xs font-bold tracking-wider text-muted">
            {request.requestId} · <time dateTime={request.createdAt}>{new Date(request.createdAt).toLocaleString()}</time> (
            <TimeAgo iso={request.createdAt} />)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-pill bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong">
            {plan.name} · {formatUsd(request.amountCents)}/{plan.interval === 'month' ? 'mo' : 'yr'}
          </span>
          <PaymentBadge request={request} />
          <ListingBadge status={request.status} />
        </div>
      </header>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Contact email">
          <a href={`mailto:${request.email}`} className="text-accent hover:underline">
            {request.email}
          </a>
        </Detail>
        <Detail label="Contact number">{request.contactNumber ?? '—'}</Detail>
        <Detail label="Website">
          <OutboundLink href={request.websiteUrl} />
        </Detail>
        <Detail label="Affiliate sign-up">
          <OutboundLink href={request.affiliateSignupUrl} />
        </Detail>
        <Detail label="COA page">
          <OutboundLink href={request.coaPageUrl} />
        </Detail>
        <Detail label="Payment method">{request.paymentMethod ? PAYMENT_METHOD_LABEL[request.paymentMethod] : '—'}</Detail>
        <Detail label="Commission">{formatPercent(request.commissionPercent)}</Detail>
        <Detail label="Customer discount">{formatPercent(request.customerDiscountPercent)}</Detail>
        <Detail label="Payment screenshot">
          {screenshotUrl ? (
            <a href={screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:underline">
              <DocumentIcon className="h-4 w-4 shrink-0" />
              View screenshot
              <ExternalIcon className="h-3 w-3 shrink-0" />
            </a>
          ) : (
            '—'
          )}
        </Detail>
      </dl>

      {screenshotUrl ? (
        <a
          href={screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the payment screenshot from ${request.organizationName} in a new tab`}
          className="group mt-4 block overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-brand"
        >
          <span className="block px-4 pt-3 text-micro font-bold uppercase tracking-wide text-faint">Payment screenshot</span>
          <span className="relative block h-72 w-full">
            {/* Signed, short-lived private URL: never sent through the image optimiser or its 30-day cache. */}
            <Image
              src={screenshotUrl}
              alt={`Payment screenshot from ${request.organizationName}`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-contain p-3 transition-opacity group-hover:opacity-90"
            />
          </span>
        </a>
      ) : null}

      {request.message ? (
        <div className="mt-4 rounded-card border border-line bg-surface p-4">
          <p className="text-micro font-bold uppercase tracking-wide text-faint">Anything else</p>
          <p className="mt-1 whitespace-pre-line break-words text-sm text-content">{request.message}</p>
        </div>
      ) : null}

      <footer className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {underReview && payment === 'awaiting' ? (
          <button type="button" onClick={verify} disabled={isPending} className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-70">
            <CheckCircleIcon className="h-4 w-4" />
            Verify payment
          </button>
        ) : null}
        {underReview && payment === 'verified' ? (
          <button type="button" onClick={approve} disabled={isPending} className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-70">
            <CheckCircleIcon className="h-4 w-4" />
            Approve listing
          </button>
        ) : null}
        {underReview ? (
          <button type="button" onClick={reject} disabled={isPending} className={SECONDARY_BUTTON}>
            <CloseIcon className="h-4 w-4" />
            Reject
          </button>
        ) : null}
        {request.status === 'APPROVED' ? (
          <Link href="/admin/vendors/new" className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-4 py-2 text-sm font-bold text-white">
            <GlobeIcon className="h-4 w-4" />
            Add this supplier
          </Link>
        ) : null}
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className="ml-auto inline-flex items-center gap-2 rounded-chip border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-bold text-danger transition-colors hover:bg-danger hover:text-white disabled:opacity-70"
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </button>
        {feedback ? (
          <p
            role="status"
            className={cn(
              'w-full text-sm font-semibold',
              feedback.tone === 'ok' && 'text-ok',
              feedback.tone === 'info' && 'text-muted',
              feedback.tone === 'error' && 'text-danger',
            )}
          >
            {feedback.message}
          </p>
        ) : null}
      </footer>
    </article>
  );
}

export function VendorListingBoard({
  requests,
  screenshotUrls,
}: {
  requests: BoardRequest[];
  /** Signed links, keyed by request id. */
  screenshotUrls: Record<string, string>;
}) {
  const [filter, setFilter] = useState<Filter>('ALL');
  // Captured once on first render. Marking everything seen refreshes the page
  // data a moment later, and without this the "New" tags would vanish while
  // the admin is still reading them.
  const [newIds] = useState(
    () => new Set(requests.filter((request) => request.seenAt === null).map((request) => request.requestId)),
  );

  useEffect(() => {
    if (newIds.size === 0) return;
    const timer = window.setTimeout(() => {
      void markRequestsSeen();
    }, MARK_SEEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [newIds]);

  const awaitingReview = requests.filter((request) => request.status === 'PENDING_REVIEW').length;
  const approved = requests.filter((request) => request.status === 'APPROVED').length;
  const verifiedRevenueCents = requests
    .filter((request) => paymentState(request) === 'verified')
    .reduce((sum, request) => sum + request.amountCents, 0);
  const visible = filter === 'ALL' ? requests : requests.filter((request) => request.status === filter);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total requests" value={String(requests.length)} delayClass="animate-delay-100" />
        <Stat label="Awaiting review" value={String(awaitingReview)} delayClass="animate-delay-200" />
        <Stat label="Approved" value={String(approved)} delayClass="animate-delay-300" />
        <Stat label="Verified revenue" value={formatUsd(verifiedRevenueCents)} delayClass="animate-delay-400" />
      </div>

      <div role="tablist" aria-label="Filter requests" className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={filter === option.id}
            onClick={() => setFilter(option.id)}
            className={cn(
              'rounded-pill px-4 py-2 text-sm font-bold transition-colors',
              filter === option.id
                ? 'bg-brand text-white'
                : 'border border-line bg-surface text-muted hover:border-brand hover:text-content',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-panel border border-dashed border-line bg-surface-raised px-6 py-14 text-center">
          <p className="text-base font-black text-content">
            {requests.length === 0 ? 'No supplier requests yet' : 'Nothing matches this filter'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {requests.length === 0
              ? 'Applications from the Supplier Listing page will appear here as soon as they are submitted.'
              : 'Try another filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {visible.map((request, index) => (
            <RequestCard
              key={request.requestId}
              request={request}
              screenshotUrl={screenshotUrls[request.requestId] ?? null}
              isNew={newIds.has(request.requestId)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
