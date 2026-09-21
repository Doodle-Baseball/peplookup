import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatRating, formatReviewCount, formatShipping, shippingSteps } from '@/lib/format';
import { site } from '@/config/site';
import type { Supplier } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { MetaPill } from '@/components/ui/meta-pill';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { ShareButton } from '@/components/ui/share-button';
import { Popover } from '@/components/ui/popover';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { StarRating } from '@/components/ui/star-rating';
import { ShippingModalContent } from '@/components/supplier-card/shipping-modal-content';
import { PaymentModalContent } from '@/components/supplier-card/payment-modal-content';
import { CouponCopyRow } from '@/components/supplier-card/coupon-copy-row';
import {
  ArrowRightIcon,
  BoxIcon,
  CalendarIcon,
  ChevronRightIcon,
  ExternalIcon,
  FlaskIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/icons/icons';

/** How many payment chips fit before collapsing into a "+n" counter. */
const VISIBLE_PAYMENT_METHODS = 4;

/** Shipping and payment rows: a quiet surface that picks up the accent on hover. */
const DETAIL_ROW_CLASS =
  'flex w-full items-center gap-3 rounded-chip border border-line bg-surface px-3 py-2.5 text-left transition-colors duration-200 hover:border-accent/40 hover:bg-accent-tint';

const DETAIL_ICON_CLASS =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong transition-transform duration-200';

export function SupplierCard({ supplier, productCount }: { supplier: Supplier; productCount: number }) {
  const reviewCount = formatReviewCount(supplier.reviewCount);
  const visiblePayments = supplier.paymentMethods.slice(0, VISIBLE_PAYMENT_METHODS);
  const hiddenPaymentCount = supplier.paymentMethods.length - visiblePayments.length;
  const hasPaymentInfo = supplier.paymentMethods.length > 0;
  const hasShippingInfo = supplier.shippingCost.kind !== 'unknown' || supplier.shippingSpeed !== null;
  const labReportsHref = `/lab-reports?supplier=${encodeURIComponent(supplier.name)}`;

  return (
    <article
      className={cn(
        'card-3d group/card relative flex h-full flex-col gap-4 overflow-hidden rounded-card border',
        'bg-surface-raised p-5 transition-[colors,box-shadow] duration-150',
        supplier.isFeatured
          ? // #2D6A4F is this theme's `--accent`, so the featured border and
            // glow reuse that token rather than a raw hex duplicating it.
            'border-accent/50 shadow-[0_0_36px_-12px_rgb(var(--accent)/0.55)] hover:border-accent'
          : 'border-line hover:border-accent/40',
      )}
    >
      {/* Featured-only soft wash behind the card's own content, giving it a
          persistent glow rather than one that only appears on hover. */}
      {supplier.isFeatured ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(var(--accent)/0.12),_transparent_70%)]"
        />
      ) : null}

      {/* Decorative top accent, revealed on hover. A fade rather than a
          transform, so it never competes with the card's own hover lift,
          purely cosmetic, so it stays out of the a11y tree. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent-strong to-accent opacity-0 transition-opacity duration-150 group-hover/card:opacity-100"
      />

      <header className="flex items-start gap-3">
        <SupplierLogo
          src={supplier.logoUrl ?? supplier.faviconUrl}
          name={supplier.name}
          size={56}
          className="h-14 w-14 rounded-chip bg-surface shadow-sm transition-transform duration-150 group-hover/card:scale-105"
          initialClassName="text-lg"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold leading-tight text-content">
            <Link href={`/suppliers/${supplier.slug}`} className="transition-colors hover:text-accent">
              {supplier.name}
            </Link>
          </h3>

          {/* Overall vendor score sits directly under the name, the first
              thing a buyer scans for when comparing cards. */}
          {supplier.reviewRating !== null ? (
            <p className="mt-1 flex items-center gap-1.5">
              <StarRating rating={supplier.reviewRating} starClassName="h-3.5 w-3.5" />
              <span className="text-sm font-bold text-content">{formatRating(supplier.reviewRating)}</span>
              <span className="text-xs text-muted">
                / 5{reviewCount ? ` · ${reviewCount} reviews` : ''}
              </span>
            </p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {/* The "Featured" and "Trust" badges were dropped here: the featured
                border/glow on the card itself already signals it, and the star
                rating just above already covers the trust score. */}
            {supplier.tier ? <Badge tone="tier">{supplier.tier}</Badge> : null}
            {supplier.labScore !== null ? (
              <Badge tone="lab" icon={<FlaskIcon className="h-3 w-3" />}>
                Lab score {supplier.labScore.toFixed(1)}/10
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <ShareButton
            title={supplier.name}
            url={`https://${site.domain}/suppliers/${supplier.slug}`}
            className="h-8 w-8 border-0 bg-transparent text-muted hover:text-accent"
          />
          <FavoriteButton slug={supplier.slug} name={supplier.name} className="h-8 w-8" />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {supplier.foundedYear !== null ? (
          <MetaPill icon={<CalendarIcon className="h-3.5 w-3.5" />}>Est. {supplier.foundedYear}</MetaPill>
        ) : null}
        <MetaPill icon={<BoxIcon className="h-3.5 w-3.5" />}>
          {productCount === 0 ? 'No products yet' : `${productCount} Products`}
        </MetaPill>
      </div>

      <div className="space-y-2">
        {/* Shipping is optional too: omitted entirely rather than shown as
            an empty "Not listed" row when no vendor shipping data exists. */}
        {hasShippingInfo ? (
          <Popover
            title="Shipping Information"
            triggerClassName={cn('group/ship', DETAIL_ROW_CLASS)}
            trigger={
              <>
                <span className={cn(DETAIL_ICON_CLASS, 'group-hover/ship:scale-110')}>
                  <TruckIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {/* One line only here: the cost when known, then the first step of the
                      shipping note; the popup lists every step in order. */}
                  {[formatShipping(supplier.shippingCost), shippingSteps(supplier.shippingSpeed)[0]]
                    .filter(Boolean)
                    .map((part, index) => (
                      <span key={part} className={index === 0 ? 'font-bold text-content' : 'font-semibold text-muted'}>
                        {index > 0 ? ' · ' : ''}
                        {part}
                      </span>
                    ))}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint transition-transform group-hover/ship:translate-x-0.5 group-hover/ship:text-accent" />
              </>
            }
          >
            <ShippingModalContent
              supplierName={supplier.name}
              affiliateUrl={supplier.affiliateUrl}
              shippingCost={supplier.shippingCost}
              shippingSpeed={supplier.shippingSpeed}
            />
          </Popover>
        ) : null}

        {/* Payment methods are optional: the row is omitted entirely rather
            than shown empty when no vendor payment data has been confirmed. */}
        {hasPaymentInfo ? (
          <Popover
            title="Payment Methods"
            triggerClassName={cn('group/pay', DETAIL_ROW_CLASS)}
            trigger={
              <>
                <span className={cn(DETAIL_ICON_CLASS, 'group-hover/pay:scale-110')}>
                  <WalletIcon className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  {visiblePayments.map((method) => (
                    <span
                      key={method}
                      className="rounded-chip border border-line bg-surface-raised px-2 py-1 text-micro font-bold uppercase text-content"
                    >
                      {method}
                    </span>
                  ))}
                  {hiddenPaymentCount > 0 ? (
                    <span className="text-micro font-bold text-faint">+{hiddenPaymentCount}</span>
                  ) : null}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint transition-transform group-hover/pay:translate-x-0.5 group-hover/pay:text-accent" />
              </>
            }
          >
            <PaymentModalContent
              supplierName={supplier.name}
              affiliateUrl={supplier.affiliateUrl}
              paymentMethods={supplier.paymentMethods}
            />
          </Popover>
        ) : null}
      </div>

      {supplier.labVerified ? (
        <div className="flex items-center gap-3 rounded-chip border border-accent/30 bg-accent-tint px-3 py-2.5">
          <FlaskIcon className="h-5 w-5 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="text-micro font-bold uppercase text-accent-strong">Laboratory verified</p>
            <p className="text-micro uppercase text-muted">Check COA certificate</p>
          </div>
          <Link
            href={labReportsHref}
            className="group/reports inline-flex shrink-0 items-center gap-1 rounded-chip bg-accent px-2.5 py-1.5 text-micro font-bold uppercase text-surface transition-colors hover:bg-accent-strong"
          >
            View reports
            <ChevronRightIcon className="h-3 w-3 transition-transform group-hover/reports:translate-x-0.5" />
          </Link>
        </div>
      ) : null}

      {supplier.coupon ? (
        <CouponCopyRow percentOff={supplier.coupon.percentOff} code={supplier.coupon.code} />
      ) : null}

      <div className="mt-auto space-y-2 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="group/profile inline-flex items-center justify-center gap-1 rounded-chip border border-line bg-surface px-3 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            View Profile
            <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover/profile:translate-x-0.5" />
          </Link>
          <Link
            href={supplier.affiliateUrl || supplier.homepageUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 rounded-chip border border-line bg-surface px-3 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            Visit Site
            <ExternalIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Link
          href={`/?supplier=${encodeURIComponent(supplier.name)}`}
          className={cn(
            'btn-3d group/prices inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-3 py-3',
            'text-sm font-bold text-surface transition-colors duration-200 hover:bg-brand-strong',
          )}
        >
          View Prices
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/prices:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
