import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatRating, formatReviewCount, formatShipping, formatDateTime } from '@/lib/format';
import type { Supplier } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { CopyCode } from '@/components/ui/copy-code';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import {
  ArrowRightIcon,
  BoxIcon,
  CalendarIcon,
  ChevronRightIcon,
  ExternalIcon,
  FlaskIcon,
  StarIcon,
  TagIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/icons/icons';

/** How many payment chips fit before collapsing into a "+n" counter. */
const VISIBLE_PAYMENT_METHODS = 4;

function MetaPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-content">
      <span className="text-muted">{icon}</span>
      {children}
    </span>
  );
}

export function SupplierCard({ supplier, productCount }: { supplier: Supplier; productCount: number }) {
  const reviewCount = formatReviewCount(supplier.reviewCount);
  const visiblePayments = supplier.paymentMethods.slice(0, VISIBLE_PAYMENT_METHODS);
  const hiddenPaymentCount = supplier.paymentMethods.length - visiblePayments.length;
  const labReportsHref = `/lab-reports?supplier=${encodeURIComponent(supplier.name)}`;

  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface-raised p-5 shadow-card transition hover:shadow-lift">
      <header className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface">
          {supplier.logoUrl ? (
            <Image
              src={supplier.logoUrl}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          ) : (
            // No logo on file yet. Initial keeps the grid aligned instead of
            // shifting layout, and is decorative since the name is adjacent.
            <span aria-hidden="true" className="text-lg font-bold text-faint">
              {supplier.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold leading-tight text-content">
            <Link href={`/suppliers/${supplier.slug}`} className="hover:text-brand">
              {supplier.name}
            </Link>
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {supplier.tier ? <Badge tone="tier">{supplier.tier}</Badge> : null}
            {supplier.trustRating !== null ? (
              <Badge tone="trust" icon={<StarIcon className="h-3 w-3 text-rating" />}>
                Trust {formatRating(supplier.trustRating)} / 5
              </Badge>
            ) : null}
            {supplier.labScore !== null ? (
              <Badge tone="lab" icon={<FlaskIcon className="h-3 w-3" />}>
                Lab score {supplier.labScore.toFixed(1)}/10
              </Badge>
            ) : null}
          </div>
        </div>

        <FavoriteButton slug={supplier.slug} name={supplier.name} />
      </header>

      <div className="flex flex-wrap gap-2">
        {supplier.foundedYear !== null ? (
          <MetaPill icon={<CalendarIcon className="h-3.5 w-3.5" />}>Est. {supplier.foundedYear}</MetaPill>
        ) : null}
        <MetaPill icon={<BoxIcon className="h-3.5 w-3.5" />}>
          {productCount === 0 ? 'No prices yet' : `${productCount} Products`}
        </MetaPill>
        {supplier.reviewRating !== null ? (
          <MetaPill icon={<StarIcon className="h-3.5 w-3.5 text-rating" />}>
            {formatRating(supplier.reviewRating)}
            {reviewCount ? ` (${reviewCount})` : ''}
          </MetaPill>
        ) : null}
      </div>

      <dl className="space-y-2">
        <div className="flex items-center gap-3 rounded-chip bg-surface-sunken px-3 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip bg-surface text-info">
            <TruckIcon className="h-4 w-4" />
          </span>
          <dt className="sr-only">Shipping</dt>
          <dd className="min-w-0 flex-1 truncate text-sm">
            <span className="font-bold text-content">{formatShipping(supplier.shippingCost)}</span>
            {supplier.shippingSpeed ? (
              <span className="text-muted"> · {supplier.shippingSpeed}</span>
            ) : null}
          </dd>
        </div>

        <div className="flex items-center gap-3 rounded-chip bg-surface-sunken px-3 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip bg-surface text-brand">
            <WalletIcon className="h-4 w-4" />
          </span>
          <dt className="sr-only">Payment methods</dt>
          <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {visiblePayments.length === 0 ? (
              <span className="text-sm text-muted">Not listed</span>
            ) : (
              visiblePayments.map((method) => (
                <span
                  key={method}
                  className="rounded-chip bg-surface px-1.5 py-0.5 text-micro font-bold uppercase text-muted"
                >
                  {method}
                </span>
              ))
            )}
            {hiddenPaymentCount > 0 ? (
              <span className="text-micro font-bold text-faint">+{hiddenPaymentCount}</span>
            ) : null}
          </dd>
        </div>
      </dl>

      {supplier.labVerified ? (
        <div className="flex items-center gap-3 rounded-chip border border-brand/30 bg-brand-tint px-3 py-2.5">
          <FlaskIcon className="h-5 w-5 shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            <p className="text-micro font-bold uppercase text-brand-strong">Laboratory verified</p>
            <p className="text-micro uppercase text-muted">Check COA certificate</p>
          </div>
          <Link
            href={labReportsHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-chip bg-brand px-2.5 py-1.5 text-micro font-bold uppercase text-white hover:bg-brand-strong"
          >
            View reports
            <ChevronRightIcon className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      {supplier.coupon ? (
        <div className="flex items-center gap-2.5 rounded-chip border border-promo/25 bg-promo-tint px-3 py-2.5">
          <TagIcon className="h-4 w-4 shrink-0 text-promo" />
          <p className="min-w-0 flex-1 truncate text-xs font-bold uppercase text-promo">
            {supplier.coupon.percentOff}% off with coupon
          </p>
          <CopyCode code={supplier.coupon.code} />
        </div>
      ) : null}

      <div className="mt-auto space-y-2 border-t border-line pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="inline-flex items-center justify-center gap-1 rounded-chip bg-brand-soft px-3 py-2.5 text-sm font-bold text-brand-strong hover:bg-brand/20"
          >
            View Profile
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
          <a
            href={`/go?to=${encodeURIComponent(supplier.affiliateUrl)}`}
            target="_blank"
            rel="sponsored noopener"
            className="inline-flex items-center justify-center gap-1.5 rounded-chip border border-line bg-surface px-3 py-2.5 text-sm font-bold text-content hover:bg-surface-sunken"
          >
            Visit Site
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
        </div>
        <Link
          href={`/?supplier=${encodeURIComponent(supplier.name)}`}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-3 py-3',
            'text-sm font-bold text-white hover:bg-brand-strong',
          )}
        >
          View Prices
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <footer className="flex items-center justify-center gap-1.5 text-micro uppercase text-faint">
        <CalendarIcon className="h-3 w-3" />
        {supplier.inventoryRefreshedAt ? (
          <>
            Inventory refresh:{' '}
            <time dateTime={supplier.inventoryRefreshedAt}>
              {formatDateTime(supplier.inventoryRefreshedAt)}
            </time>
          </>
        ) : (
          'Awaiting first inventory crawl'
        )}
      </footer>
    </article>
  );
}
