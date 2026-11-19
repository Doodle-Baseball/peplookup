import Link from 'next/link';
import { site } from '@/config/site';
import { LISTED_PLAN_ID, formatPlanPrice, vendorListingPlan } from '@/config/vendor-listing';
import { InfoIcon, ShieldCheckIcon } from '@/components/icons/icons';

/** What a payment does and does not buy, in plain words. */
export function ListingDisclaimer() {
  const price = formatPlanPrice(vendorListingPlan(LISTED_PLAN_ID));
  return (
    <section data-reveal aria-labelledby="disclaimer-heading" className="mx-auto max-w-4xl rounded-panel border border-warn/40 bg-warn/10 p-7 sm:p-9">
      <h2 id="disclaimer-heading" className="flex items-center gap-2.5 text-xl font-black text-content">
        <InfoIcon className="h-5 w-5 shrink-0 text-warn" />
        Disclaimer
      </h2>
      <p className="mt-4 text-sm leading-7 text-content sm:text-base">
        We don&rsquo;t promise or guarantee any revenue, traffic, search rankings, clicks or sales. Your {price}{' '}
        payment covers your brand&rsquo;s listing on {site.name} as described on this page. Listings go live after
        our team confirms your payment. Prices are compared exactly as published, and rankings are by price and
        quality, never by payment.
      </p>
    </section>
  );
}

/** Closing note: who we are, and the affiliate disclosure. */
export function ListingFootnote() {
  return (
    <p data-reveal className="mx-auto flex max-w-4xl gap-4 rounded-panel border border-line bg-surface-raised p-6 text-sm leading-7 text-muted shadow-card sm:p-8">
      <ShieldCheckIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
      <span>
        {site.name} is an independent price-comparison publisher. We do not manufacture, sell, store, ship or process
        payment for any peptide product; every purchase happens directly with the supplier. Some outbound links are
        affiliate links, so we may earn a commission at no extra cost to the buyer. Read the full{' '}
        <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
          legal disclaimer
        </Link>{' '}
        and{' '}
        <Link href="/terms" className="font-semibold text-accent hover:underline">
          terms of service
        </Link>
        .
      </span>
    </p>
  );
}
