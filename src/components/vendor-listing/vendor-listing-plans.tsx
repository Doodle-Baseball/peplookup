import { LISTED_PLAN_ID, vendorListingPlan } from '@/config/vendor-listing';
import { ArrowRightIcon, CheckCircleIcon, GlobeIcon } from '@/components/icons/icons';
import { ScrollToApplyLink } from '@/components/vendor-listing/scroll-to-apply-link';

/** The single listing on offer: everything it includes, and its price. Its button leads to the application form. */
export function VendorListingPlans() {
  const plan = vendorListingPlan(LISTED_PLAN_ID);
  // Integer cents to whole dollars at the render boundary; the "$" is set apart as a superscript.
  const amount = (plan.priceCents / 100).toLocaleString('en-US');
  const interval = plan.interval === 'month' ? 'month' : 'year';

  return (
    <section
      data-reveal="zoom"
      aria-labelledby="plans-heading"
      className="relative overflow-hidden rounded-panel border border-line bg-gradient-to-br from-surface-raised via-surface-raised to-accent-tint p-6 shadow-card sm:p-10 lg:p-12"
    >
      <div className="relative grid gap-10 lg:grid-cols-5 lg:items-center lg:gap-12">
        <div className="lg:col-span-3">
          <h2 id="plans-heading" className="text-2xl font-extrabold leading-tight tracking-tight text-content sm:text-4xl">
            What your <span className="text-accent">${amount}</span> listing includes
          </h2>
          <p className="mt-3 flex items-start gap-2.5 text-sm font-semibold text-accent-strong">
            <GlobeIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Every brand listed on PepLookup receives a backlink to its website.
          </p>
          <ul className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-accent-tint text-accent">
                  <CheckCircleIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-content sm:text-base">{feature.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{feature.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className="panel-dark listing-card-3d-dark relative mx-auto max-w-sm overflow-hidden rounded-panel border border-white/10 p-6 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-8">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent-soft to-accent" />
            <div aria-hidden="true" className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" />
            <p className="relative font-mono text-xs font-semibold uppercase tracking-widest text-white/60">{plan.name} listing</p>
            <p className="relative mt-4 flex items-start justify-center text-white">
              <span className="mt-1.5 text-2xl font-semibold text-white/60">$</span>
              <span className="text-6xl font-extrabold leading-none tracking-tight">{amount}</span>
            </p>
            <p className="relative mt-3 text-sm font-medium text-white/70">Per {interval} · Bitcoin or PayPal</p>
            <p className="relative mx-auto mt-4 max-w-xs border-t border-white/10 pt-4 text-xs leading-relaxed text-white/60">
              No guaranteed revenue, traffic, or rankings. Your payment covers the listing described here.
            </p>
            <ScrollToApplyLink className="group relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-surface-raised px-6 py-3.5 text-sm font-bold text-content shadow-lift transition-transform hover:-translate-y-0.5">
              List Your Brand
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ScrollToApplyLink>
          </div>
        </div>
      </div>
    </section>
  );
}
