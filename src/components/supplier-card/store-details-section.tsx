import type { ReactNode } from 'react';
import { shippingSteps } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Supplier } from '@/lib/schema';
import { Popover } from '@/components/ui/popover';
import { ShippingModalContent } from '@/components/supplier-card/shipping-modal-content';
import { PaymentModalContent } from '@/components/supplier-card/payment-modal-content';
import { ChevronRightIcon, DocumentIcon, ExternalIcon, TruckIcon, WalletIcon } from '@/components/icons/icons';

/** Store-detail cards lift and pick up the accent on hover, the same motion as the directory cards. */
const STORE_CARD_CLASS =
  'group flex h-full min-w-0 items-start gap-3 rounded-card border border-line bg-surface-raised p-5 text-left shadow-card transition-all duration-150 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift';

const POLICY_LINK_CLASS =
  'inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-bold uppercase text-content transition-colors hover:border-accent hover:text-accent-strong';

function StoreDetail({
  icon,
  label,
  children,
  action,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  action?: string;
}) {
  return (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong transition-transform duration-150 group-hover:scale-110">
        {icon}
      </span>
      <span className="block min-w-0 flex-1">
        <span className="eyebrow block">{label}</span>
        <span className="mt-1.5 block text-sm font-bold leading-6 text-content">{children}</span>
        {action ? (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent">
            {action}
            <ChevronRightIcon className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </span>
        ) : null}
      </span>
    </>
  );
}

/** Steps shown on the card before "View details"; the popup lists them all. */
const SHIPPING_CARD_STEPS = 1;

/** The shipping card's body: just the first step of the supplier's shipping note, then how many more the popup has. */
function ShippingSummary({ steps }: { steps: string[] }) {
  const shown = steps.slice(0, SHIPPING_CARD_STEPS);
  const more = steps.length - shown.length;
  return (
    <span className="block space-y-1">
      {shown.map((step) => (
        <span key={step} className="flex items-start gap-2 font-semibold">
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          {step}
        </span>
      ))}
      {more > 0 ? <span className="block text-xs font-semibold text-muted">+{more} more</span> : null}
    </span>
  );
}

/**
 * "Shipping, payment & policies" for a vendor: the cards a supplier's page and
 * its coupon page both show before the catalogue. Renders nothing when we
 * hold none of the three facts, so a vendor with no data gets no empty box.
 */
export function StoreDetailsSection({ supplier, className }: { supplier: Supplier; className?: string }) {
  const hasShippingInfo = supplier.shippingCost.kind !== 'unknown' || supplier.shippingSpeed !== null;
  const hasPaymentInfo = supplier.paymentMethods.length > 0;
  const hasPolicies = Boolean(supplier.policyUrls.shipping || supplier.policyUrls.returns);
  const storeCardCount = [hasShippingInfo, hasPaymentInfo, hasPolicies].filter(Boolean).length;
  if (storeCardCount === 0) return null;

  return (
    <section aria-labelledby="store-details-heading" className={cn('reveal', className)}>
      <p className="eyebrow">Before you order</p>
      <h2 id="store-details-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
        Shipping, payment <span className="text-accent">&amp; policies.</span>
      </h2>

      <div
        className={cn(
          'mt-5 grid grid-cols-1 gap-4',
          storeCardCount === 3 && 'md:grid-cols-3',
          storeCardCount === 2 && 'md:grid-cols-2',
        )}
      >
        {hasShippingInfo ? (
          <Popover
            title="Shipping Information"
            triggerClassName={STORE_CARD_CLASS}
            trigger={
              <StoreDetail icon={<TruckIcon className="h-5 w-5" />} label="Shipping" action="View details">
                <ShippingSummary steps={shippingSteps(supplier.shippingSpeed)} />
              </StoreDetail>
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

        {hasPaymentInfo ? (
          <Popover
            title="Payment Methods"
            triggerClassName={STORE_CARD_CLASS}
            trigger={
              <StoreDetail icon={<WalletIcon className="h-5 w-5" />} label="Payment methods" action="View details">
                {supplier.paymentMethods.join(', ')}
              </StoreDetail>
            }
          >
            <PaymentModalContent
              supplierName={supplier.name}
              affiliateUrl={supplier.affiliateUrl}
              paymentMethods={supplier.paymentMethods}
            />
          </Popover>
        ) : null}

        {hasPolicies ? (
          <div className={STORE_CARD_CLASS}>
            <StoreDetail icon={<DocumentIcon className="h-5 w-5" />} label="Store policies">
              <span className="mt-1 flex flex-wrap gap-2">
                {supplier.policyUrls.shipping ? (
                  <a
                    href={supplier.policyUrls.shipping}
                    target="_blank"
                    rel="nofollow noopener"
                    className={POLICY_LINK_CLASS}
                  >
                    Shipping
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                ) : null}
                {supplier.policyUrls.returns ? (
                  <a
                    href={supplier.policyUrls.returns}
                    target="_blank"
                    rel="nofollow noopener"
                    className={POLICY_LINK_CLASS}
                  >
                    Returns
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                ) : null}
              </span>
            </StoreDetail>
          </div>
        ) : null}
      </div>
    </section>
  );
}
