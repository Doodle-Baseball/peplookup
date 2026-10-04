'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  deleteVendorRequest,
  markRequestPaidManually,
  markRequestsSeen,
  verifyRequestPayment,
  type VerifyPaymentState,
} from '@/app/admin/(dashboard)/vendor-listing/actions';
import { vendorListingPlan } from '@/config/vendor-listing';
import {
  CheckCircleIcon,
  ClockIcon,
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
  commissionPercent: number;
  customerDiscountPercent: number;
  message: string | null;
  status: 'PENDING_PAYMENT' | 'PAID';
  whopPaymentId: string | null;
  paidAt: string | null;
  seenAt: string | null;
  createdAt: string;
}

type Filter = 'ALL' | 'PAID' | 'PENDING_PAYMENT';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PAID', label: 'Paid' },
  { id: 'PENDING_PAYMENT', label: 'Pending payment' },
];

const MARK_SEEN_DELAY_MS = 3000;

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

function StatusBadge({ status }: { status: BoardRequest['status'] }) {
  return status === 'PAID' ? (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-ok/15 px-3 py-1 text-xs font-bold text-ok">
      <CheckCircleIcon className="h-3.5 w-3.5" />
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-warn/15 px-3 py-1 text-xs font-bold text-warn">
      <ClockIcon className="h-3.5 w-3.5" />
      Pending payment
    </span>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-micro font-bold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-content">{children}</dd>
    </div>
  );
}

function RequestCard({
  request,
  isNew,
  index,
}: {
  request: BoardRequest;
  isNew: boolean;
  index: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<VerifyPaymentState | null>(null);
  const plan = vendorListingPlan(request.plan);

  const verify = () => {
    startTransition(async () => {
      setFeedback(await verifyRequestPayment(request.requestId));
    });
  };

  const remove = () => {
    const warning =
      request.status === 'PAID'
        ? 'This request is PAID. Deleting it removes the record here, but does not refund the payment in Whop.'
        : 'This cannot be undone.';
    if (!window.confirm(`Delete the request from ${request.organizationName} (${request.requestId})? ${warning}`)) return;
    startTransition(async () => {
      const result = await deleteVendorRequest(request.requestId);
      // On success the card disappears with the refreshed list; only a failure needs showing.
      if (result.tone === 'error') setFeedback(result);
    });
  };

  const markPaid = () => {
    const confirmed = window.confirm(
      `Mark ${request.organizationName} as paid? Only do this after seeing the payment in Whop. It emails the applicant.`,
    );
    if (!confirmed) return;
    startTransition(async () => {
      setFeedback(await markRequestPaidManually(request.requestId));
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
            <TimeAgo iso={request.createdAt} />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-pill px-3 py-1 text-xs font-bold',
              request.plan === 'pro' ? 'bg-brand text-white' : 'bg-brand-soft text-brand-strong',
            )}
          >
            {plan.name} · {formatUsd(request.amountCents)}/{plan.interval === 'month' ? 'mo' : 'yr'}
          </span>
          <StatusBadge status={request.status} />
        </div>
      </header>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Email">
          <a href={`mailto:${request.email}`} className="text-accent hover:underline">
            {request.email}
          </a>
        </Detail>
        <Detail label="Contact number">{request.contactNumber ?? '—'}</Detail>
        <Detail label="Website">
          <a
            href={request.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            {request.websiteUrl.replace(/^https?:\/\//, '')}
            <ExternalIcon className="h-3 w-3 shrink-0" />
          </a>
        </Detail>
        <Detail label="Commission">{formatPercent(request.commissionPercent)}</Detail>
        <Detail label="Customer discount">{formatPercent(request.customerDiscountPercent)}</Detail>
        <Detail label={request.status === 'PAID' ? 'Paid' : 'Whop payment'}>
          {request.status === 'PAID' ? (
            request.paidAt ? <TimeAgo iso={request.paidAt} /> : 'Yes'
          ) : (
            'Not confirmed yet'
          )}
        </Detail>
      </dl>

      {request.message ? (
        <div className="mt-4 rounded-card border border-line bg-surface p-4">
          <p className="text-micro font-bold uppercase tracking-wide text-faint">Message</p>
          <p className="mt-1 whitespace-pre-line break-words text-sm text-content">{request.message}</p>
        </div>
      ) : null}

      <footer className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {request.status === 'PENDING_PAYMENT' ? (
          <>
            <button
              type="button"
              onClick={verify}
              disabled={isPending}
              className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {isPending ? 'Checking Whop…' : 'Verify payment with Whop'}
            </button>
            <button
              type="button"
              onClick={markPaid}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-chip border border-line bg-surface px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand disabled:opacity-70"
            >
              Mark as paid
            </button>
          </>
        ) : (
          <>
            <Link
              href="/admin/vendors/new"
              className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-4 py-2 text-sm font-bold text-white"
            >
              <GlobeIcon className="h-4 w-4" />
              Add this vendor
            </Link>
            <button
              type="button"
              onClick={verify}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-chip border border-line bg-surface px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand disabled:opacity-70"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {isPending ? 'Checking Whop…' : 'Verify payment'}
            </button>
          </>
        )}
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
              'text-sm font-semibold',
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

export function VendorListingBoard({ requests }: { requests: BoardRequest[] }) {
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

  const paid = requests.filter((request) => request.status === 'PAID');
  const pending = requests.length - paid.length;
  const revenueCents = paid.reduce((sum, request) => sum + request.amountCents, 0);
  const visible = filter === 'ALL' ? requests : requests.filter((request) => request.status === filter);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total requests" value={String(requests.length)} delayClass="animate-delay-100" />
        <Stat label="Paid" value={String(paid.length)} delayClass="animate-delay-200" />
        <Stat label="Pending payment" value={String(pending)} delayClass="animate-delay-300" />
        <Stat label="Confirmed revenue" value={formatUsd(revenueCents)} delayClass="animate-delay-400" />
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
            {requests.length === 0 ? 'No vendor requests yet' : 'Nothing matches this filter'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {requests.length === 0
              ? 'Applications from the Vendor Listing page will appear here as soon as they are submitted.'
              : 'Try another filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {visible.map((request, index) => (
            <RequestCard
              key={request.requestId}
              request={request}
              isNew={newIds.has(request.requestId)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
