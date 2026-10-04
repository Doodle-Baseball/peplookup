'use client';

import { useCallback, useState } from 'react';
import {
  VENDOR_LISTING_PLANS,
  formatPlanPrice,
  type VendorListingPlan,
} from '@/config/vendor-listing';
import { VendorApplicationModal } from '@/components/vendor-listing/vendor-application-modal';
import { ArrowRightIcon, CheckCircleIcon, StarIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

const ANIMATION_DELAY = ['animate-delay-100', 'animate-delay-300'] as const;

function PlanCard({
  plan,
  index,
  onSelect,
}: {
  plan: VendorListingPlan;
  index: number;
  onSelect: (plan: VendorListingPlan) => void;
}) {
  return (
    <article
      className={cn(
        'card-3d animate-fade-up relative flex flex-col rounded-panel border bg-surface-raised p-6 sm:p-7',
        ANIMATION_DELAY[index],
        plan.highlighted ? 'border-brand shadow-panel' : 'border-line',
      )}
    >
      {plan.highlighted ? (
        <>
          <span aria-hidden="true" className="plan-glow pointer-events-none absolute inset-0 rounded-panel" />
          <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-pill bg-brand px-3 py-1 text-micro font-bold uppercase tracking-wide text-white shadow-lift">
            <StarIcon className="h-3 w-3" />
            Best value
          </span>
        </>
      ) : null}

      <h3 className="text-sm font-black uppercase tracking-wide text-brand-strong">{plan.name}</h3>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-black tracking-tight text-content sm:text-5xl">{formatPlanPrice(plan)}</span>
        <span className="text-base font-semibold text-muted">/ {plan.interval === 'month' ? 'month' : 'year'}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{plan.tagline}</p>

      {plan.featuresIntro ? (
        <p className="mt-6 text-sm font-black text-content">{plan.featuresIntro}</p>
      ) : null}
      <ul className={cn('flex-1 space-y-3', plan.featuresIntro ? 'mt-3' : 'mt-6')}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm font-semibold text-content">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        className={cn(
          'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-chip px-6 py-3.5 text-sm font-bold',
          plan.highlighted
            ? 'btn-3d bg-brand text-white'
            : 'border border-line bg-surface text-content shadow-card transition-colors hover:border-brand hover:text-brand-strong',
        )}
      >
        List Your Brand
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </article>
  );
}

/** Two pricing cards; choosing one opens the application form for that plan. */
export function VendorListingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<VendorListingPlan | null>(null);
  const closeModal = useCallback(() => setSelectedPlan(null), []);

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
        {VENDOR_LISTING_PLANS.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} index={index} onSelect={setSelectedPlan} />
        ))}
      </div>
      {selectedPlan ? <VendorApplicationModal plan={selectedPlan} onClose={closeModal} /> : null}
    </>
  );
}
