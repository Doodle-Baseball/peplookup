import Link from 'next/link';
import { formatShipping, shippingSteps } from '@/lib/format';
import { formatMoney } from '@/lib/money';
import { cents } from '@/lib/money';
import type { ShippingCost } from '@/lib/schema';
import { ExternalIcon, TruckIcon } from '@/components/icons/icons';

export function ShippingModalContent({
  supplierName,
  affiliateUrl,
  shippingCost,
  shippingSpeed,
}: {
  supplierName: string;
  affiliateUrl: string;
  shippingCost: ShippingCost;
  shippingSpeed: string | null;
}) {
  const steps = shippingSteps(shippingSpeed);
  // "unknown" formats to an empty string; the cost row is left out rather than
  // rendering a bare "shipping" heading.
  const cost = formatShipping(shippingCost);

  return (
    <div className="space-y-4">
      {cost ? (
        <div className="flex items-center gap-3 rounded-chip bg-surface-sunken p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-surface text-brand">
            <TruckIcon className="h-5 w-5" />
          </span>
          <p className="min-w-0 flex-1 font-bold text-content">{cost} shipping</p>
          {shippingCost.kind === 'freeUpTo' ? (
            <span className="shrink-0 text-sm font-bold text-content">
              Free over {formatMoney(cents(shippingCost.max))}
            </span>
          ) : null}
        </div>
      ) : null}

      {steps.length > 0 ? (
        <ol className="relative space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="relative flex items-start gap-3">
              {/* Connector between numbered steps, so they read as one sequence. */}
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="absolute left-[13px] top-7 h-[calc(100%-0.25rem)] w-px bg-line" />
              ) : null}
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-xs font-black text-accent-strong">
                {index + 1}
              </span>
              <p className="pt-1 text-sm font-semibold leading-5 text-content">{step}</p>
            </li>
          ))}
        </ol>
      ) : null}

      <Link
        href={`/go?to=${encodeURIComponent(affiliateUrl || 'https://')}`}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
      >
        Continue
        <span className="font-semibold">{supplierName}</span>
        <ExternalIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
