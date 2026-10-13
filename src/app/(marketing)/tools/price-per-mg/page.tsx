import type { Metadata } from 'next';
import Link from 'next/link';
import { PriceMgCalculator } from '@/components/tools/price-mg-calculator';
import { ArrowRightIcon, DocumentIcon, ListIcon, TagIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { RESEARCH_USE_NOTICE } from '@/config/site';

const PAGE = staticSeoPage('/tools/price-per-mg');

/** Same panel, heading and body treatment as the price checker's guide sections. */
const GUIDE_PANEL_CLASS = 'mt-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8';
const GUIDE_HEADING_CLASS = 'mt-3 text-3xl font-black leading-tight text-content sm:text-4xl';
const GUIDE_TEXT_CLASS = 'text-sm leading-7 text-muted sm:text-base';
/** Half-width headings for the two explainers that share one panel. */
const SPLIT_HEADING_CLASS = 'mt-3 text-2xl font-black leading-tight text-content sm:text-3xl';

const COMPARE_LINKS: { href: string; label: string; title: string; icon: React.ReactNode }[] = [
  { href: '/suppliers', label: 'Browse all suppliers', title: 'Every listed supplier', icon: <ListIcon className="h-5 w-5" /> },
  { href: '/price-checker', label: 'Compare by compound', title: 'Side-by-side pricing', icon: <TagIcon className="h-5 w-5" /> },
  { href: '/lab-reports', label: 'Listings with lab reports', title: 'COA test reports', icon: <DocumentIcon className="h-5 w-5" /> },
];

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function PricePerMgToolPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <section className="mx-auto max-w-4xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Free tool
          </span>
          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Peptide Price per mg <span className="text-accent">Calculator</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Turn any vial price into a true cost-per-milligram and cost-per-dose figure, so vial sizes and
            suppliers can be compared on equal footing instead of by sticker price alone.
          </p>
        </section>

        <section className="mt-12">
          <PriceMgCalculator />
          <p className="mt-4 text-center text-xs text-muted">{RESEARCH_USE_NOTICE}</p>
        </section>

        <section aria-labelledby="cost-per-mg-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">The formula</p>
              <h2 id="cost-per-mg-heading" className={GUIDE_HEADING_CLASS}>
                How to Calculate Peptide Cost <span className="italic text-accent">per mg</span>
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <p className={GUIDE_TEXT_CLASS}>
                Cost per mg is the total price divided by the total milligrams you receive.
              </p>
              <p className="rounded-card border border-accent/25 bg-accent-tint px-4 py-3.5 font-mono text-sm font-bold text-accent-strong sm:px-5">
                Cost per mg = (price + shipping) ÷ (vial size in mg × number of vials)
              </p>
              <p className={GUIDE_TEXT_CLASS}>
                Example: two 10 mg vials at $80 each plus $10 shipping is $170 for 20 mg, or $8.50 per mg. Without
                shipping it is $8.00 per mg. Enter your own numbers in the calculator above to compare listings
                fairly.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="compare-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 id="compare-heading" className={GUIDE_HEADING_CLASS}>
                Compare against real <span className="italic text-accent">listings</span>
              </h2>
              <p className={`mt-3 ${GUIDE_TEXT_CLASS}`}>
                See how a price stacks up against what suppliers are actually charging right now.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2">
              {COMPARE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="tilt-card group flex flex-col rounded-card border border-line bg-surface p-5 hover:border-accent/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong shadow-sm">
                    {link.icon}
                  </span>
                  <span className="mt-4 block text-micro font-bold uppercase tracking-wide text-faint">{link.label}</span>
                  <span className="mt-1 block text-base font-black text-content">{link.title}</span>
                  <ArrowRightIcon className="mt-4 h-4 w-4 text-accent-strong transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Two short explainers share one panel; each keeps its own h2 so the outline is unchanged. */}
        <div className={`${GUIDE_PANEL_CLASS} grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-0 md:divide-x md:divide-line`}>
          <section aria-labelledby="why-heading" className="md:pr-8 lg:pr-10">
            <p className="eyebrow">Why it matters</p>
            <h2 id="why-heading" className={SPLIT_HEADING_CLASS}>
              Why price per mg <span className="italic text-accent">matters</span>
            </h2>
            <p className={`mt-4 ${GUIDE_TEXT_CLASS}`}>
              A 5 mg vial at $45 and a 10 mg vial at $80 look like different deals until the price is
              divided by the milligrams: the first works out to $9/mg, the second to $8/mg. Larger vials
              usually win on cost per mg, but tiers, coupons and shipping can change the ranking, so run the
              numbers for each listing rather than assuming.
            </p>
          </section>

          <section
            aria-labelledby="limits-heading"
            className="border-t border-line pt-8 md:border-t-0 md:pl-8 md:pt-0 lg:pl-10"
          >
            <p className="eyebrow">Limits</p>
            <h2 id="limits-heading" className={SPLIT_HEADING_CLASS}>
              What Price per mg Doesn&rsquo;t <span className="italic text-accent">Tell You</span>
            </h2>
            <p className={`mt-4 ${GUIDE_TEXT_CLASS}`}>
              Price per mg compares quantity for money. It does not show purity, testing or whether the product is in
              stock, and it only includes shipping if you add it. A low price per mg only matters if the product is
              what the{' '}
              <Link href="/suppliers" className="font-bold text-brand hover:underline">
                supplier
              </Link>{' '}
              says it is, so check for a batch-specific COA in the supplier&rsquo;s published{' '}
              <Link href="/lab-reports" className="font-bold text-brand hover:underline">
                lab reports
              </Link>{' '}
              before you decide. Research use only.
            </p>
          </section>
        </div>

        <PageFaqSection path="/tools/price-per-mg" className="mt-14" />
      </div>
    </div>
  );
}
