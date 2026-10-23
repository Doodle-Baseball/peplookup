import type { Metadata } from 'next';
import Link from 'next/link';
import { IntranasalCalculator } from '@/components/tools/intranasal-calculator';
import { IntranasalChart } from '@/components/tools/intranasal-chart';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { BuyPeptidesSection } from '@/components/tools/buy-peptides-section';
import { cn } from '@/lib/cn';
import { PageSeo } from '@/components/seo/page-seo';

const PAGE = staticSeoPage('/tools/intranasal');

// The "Buy peptides" rail shows live prices, so the page is re-rendered on the
// same window as the other price pages rather than frozen at build time.
export const revalidate = 1800;

/** Same panel, heading and body treatment as the other tool pages' guide sections. */
const GUIDE_PANEL_CLASS = 'mt-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8';
const GUIDE_HEADING_CLASS = 'mt-3 text-3xl font-black leading-tight text-content sm:text-4xl';
const GUIDE_TEXT_CLASS = 'text-sm leading-7 text-muted sm:text-base';
const INLINE_LINK_CLASS = 'font-bold text-brand hover:underline';

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function IntranasalToolPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 pt-14">
        <PageSeo seo={PAGE} />
        <section className="mx-auto max-w-4xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Free tool
          </span>
          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 || 'Intranasal Calculator'}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Pick a peptide or enter a custom vial, then work out the concentration, the amount in each pump
            actuation, the actuations per bottle and the cost of each actuation.
          </p>
        </section>

        <section className="mt-12">
          <IntranasalCalculator />
        </section>

        <section aria-labelledby="how-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">The formula</p>
              <h2 id="how-heading" className={GUIDE_HEADING_CLASS}>
                How this is <span className="italic text-accent">calculated</span>
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <p className={GUIDE_TEXT_CLASS}>
                Concentration is the vial&rsquo;s peptide in mcg divided by the BAC water added. The amount per
                actuation is that concentration divided by the pump&rsquo;s actuations per mL, and actuations per
                bottle is the bottle volume times actuations per mL, rounded down because a part-filled last
                actuation is not a full one.
              </p>
              <p className={GUIDE_TEXT_CLASS}>
                Cost per actuation divides the vial price by the actuations in one bottle, so it treats one vial as
                filling one bottle.
              </p>
              <p className="rounded-card border border-accent/25 bg-accent-tint px-4 py-3.5 text-sm leading-6 text-accent-strong sm:px-5">
                Pumps vary, so check the volume per actuation printed on your pump (0.05 mL per actuation is 20 per
                mL).
              </p>
              <p className="border-t border-line pt-5 text-xs leading-6 text-muted">
                Check the vial size against the{' '}
                <Link href="/lab-reports" className={INLINE_LINK_CLASS}>
                  batch certificate of analysis
                </Link>{' '}
                for the product in hand. For research use only; this tool converts units and does not recommend
                amounts.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="chart-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Quick reference</p>
              <h2 id="chart-heading" className={GUIDE_HEADING_CLASS}>
                Nasal Spray Concentration <span className="italic text-accent">Chart</span>
              </h2>
              <p className={cn('mt-3', GUIDE_TEXT_CLASS)}>
                Amount in each actuation for common concentrations and pump sizes.
              </p>
            </div>
            <div className="min-w-0 lg:col-span-2">
              <IntranasalChart />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="compare-heading"
          className="relative mt-8 overflow-hidden rounded-panel border border-accent/25 bg-accent-tint p-5 shadow-card sm:p-8"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
          />
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 id="compare-heading" className={GUIDE_HEADING_CLASS}>
                Compare Before You <span className="italic text-accent">Buy</span>
              </h2>
            </div>
            <p className={cn('self-center lg:col-span-2', GUIDE_TEXT_CLASS)}>
              Working from a vial? Use the{' '}
              <Link href="/tools/calculator" className={INLINE_LINK_CLASS}>
                reconstitution calculator
              </Link>{' '}
              for vial concentration math, compare{' '}
              <Link href="/products/semax" className={INLINE_LINK_CLASS}>
                Semax
              </Link>{' '}
              and{' '}
              <Link href="/products/selank" className={INLINE_LINK_CLASS}>
                Selank
              </Link>{' '}
              prices across suppliers, and check batch{' '}
              <Link href="/lab-reports" className={INLINE_LINK_CLASS}>
                lab reports
              </Link>{' '}
              before you choose.
            </p>
          </div>
        </section>
      </div>

      {/* Outside the page container so the product rail runs the full width of the screen. */}
      <BuyPeptidesSection supplierSlug="disguised-alpha" className="mt-8" />

      <div className="mx-auto max-w-shell px-4 pb-14">
        <PageFaqSection path="/tools/intranasal" className="mt-14" />
      </div>
    </div>
  );
}
