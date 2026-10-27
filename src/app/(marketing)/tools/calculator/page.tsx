import type { Metadata } from 'next';
import Link from 'next/link';
import { ReconstitutionCalculator } from '@/components/tools/reconstitution-calculator';
import { ReconstitutionChart } from '@/components/tools/reconstitution-chart';
import { ArrowRightIcon, VialIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { BuyPeptidesSection } from '@/components/tools/buy-peptides-section';
import { getProducts } from '@/lib/repository';
import { cn } from '@/lib/cn';
import { PageSeo } from '@/components/seo/page-seo';

const PAGE = staticSeoPage('/tools/calculator');

// The "Buy peptides" rail shows live prices, so the page is re-rendered on the
// same window as the other price pages rather than frozen at build time.
export const revalidate = 1800;

/** Same panel, heading and body treatment as the price per mg page's guide sections. */
const GUIDE_PANEL_CLASS = 'mt-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8';
const GUIDE_HEADING_CLASS = 'mt-3 text-3xl font-black leading-tight text-content sm:text-4xl';
const GUIDE_TEXT_CLASS = 'text-sm leading-7 text-muted sm:text-base';
const FORMULA_CLASS =
  'rounded-card border border-accent/25 bg-accent-tint px-4 py-3.5 font-mono text-sm font-bold text-accent-strong sm:px-5';
const INLINE_FORMULA_CLASS = 'rounded-chip bg-accent-tint px-1.5 py-0.5 font-mono text-xs font-bold text-accent-strong sm:text-sm';
const INLINE_LINK_CLASS = 'font-bold text-brand hover:underline';

/** Compounds linked from the "by compound" grid, in display order. */
const COMPOUND_SLUGS = [
  'retatrutide',
  'tirzepatide',
  'semaglutide',
  'bpc-157',
  'tb-500',
  'ghk-cu',
  'sermorelin',
  'tesamorelin',
  'mots-c',
  'nad',
];

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function ReconstitutionToolPage() {
  const [seo, products] = await Promise.all([getSeoOverride(PAGE.path), getProducts()]);
  // Only compounds that actually have a page are linked, so a removed compound
  // drops out of the grid instead of leaving a dead link.
  const compoundLinks = COMPOUND_SLUGS.flatMap((slug) => {
    const product = products.find((candidate) => candidate.slug === slug);
    return product ? [{ slug: product.slug, name: product.name }] : [];
  });

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
            3 Calculation Modes
          </span>
          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Reconstitution <span className="italic text-accent">Calculator.</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Enter the peptide amount in the vial and the bacteriostatic water you add, and get the concentration and
            exact U-100 syringe units for any volume you need to draw.
          </p>
        </section>

        <section className="mt-12">
          <ReconstitutionCalculator />
        </section>

        <section aria-labelledby="math-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">The formula</p>
              <h2 id="math-heading" className={GUIDE_HEADING_CLASS}>
                The <span className="italic text-accent">math</span>
              </h2>
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-3">
                <p className={FORMULA_CLASS}>Concentration = Vial (mg) ÷ BAC water (mL)</p>
                <p className={GUIDE_TEXT_CLASS}>
                  For example, a 10&nbsp;mg vial mixed with 2&nbsp;mL of BAC water yields 5,000&nbsp;mcg/mL.
                </p>
              </div>
              <div className="space-y-3">
                <p className={FORMULA_CLASS}>Units to draw = (target amount ÷ concentration) × 100</p>
                <p className={GUIDE_TEXT_CLASS}>
                  Drawing 500&nbsp;mcg from a 5,000&nbsp;mcg/mL solution takes 0.1&nbsp;mL, which is 10 units on a
                  U-100 syringe. The 1&nbsp;mL, 0.5&nbsp;mL and 0.3&nbsp;mL sizes all use the same 100-units-per-mL
                  scale; the smaller barrels just hold fewer units, which makes small volumes easier to read.
                </p>
              </div>
              <p className={GUIDE_TEXT_CLASS}>
                <strong className="text-content">Find Amount and Find BAC Water rearrange the same equation:</strong>{' '}
                <code className={INLINE_FORMULA_CLASS}>amount = (units ÷ 100) × concentration</code>, and{' '}
                <code className={INLINE_FORMULA_CLASS}>BAC water = vial (mcg) × units ÷ (amount × 100)</code>.
              </p>
              <p className="border-t border-line pt-5 text-xs leading-6 text-muted">
                For research use only. This tool converts units; it does not recommend amounts. Check the vial size
                against the{' '}
                <Link href="/lab-reports" className={INLINE_LINK_CLASS}>
                  batch certificate of analysis
                </Link>{' '}
                for the product in hand.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="chart-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Quick reference</p>
              <h2 id="chart-heading" className={GUIDE_HEADING_CLASS}>
                Peptide Reconstitution <span className="italic text-accent">Chart</span>
              </h2>
              <p className={cn('mt-3', GUIDE_TEXT_CLASS)}>
                Concentration for common vial sizes and water volumes, with the amount held in each unit on a U-100
                syringe.
              </p>
            </div>
            <div className="min-w-0 lg:col-span-2">
              <ReconstitutionChart />
            </div>
          </div>
        </section>

        {compoundLinks.length > 0 ? (
          <section aria-labelledby="by-compound-heading" className={GUIDE_PANEL_CLASS}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
              <div>
                <p className="eyebrow">By compound</p>
                <h2 id="by-compound-heading" className={GUIDE_HEADING_CLASS}>
                  Reconstitution Calculator by <span className="italic text-accent">Compound</span>
                </h2>
                <p className={cn('mt-3', GUIDE_TEXT_CLASS)}>
                  The math is the same for every lyophilised peptide. Pick a compound to see its common vial sizes
                  and current supplier prices.
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-3">
                {compoundLinks.map((compound) => (
                  <li key={compound.slug}>
                    <Link
                      href={`/products/${compound.slug}`}
                      className="tilt-card group flex items-center gap-3 rounded-card border border-line bg-surface p-4 hover:border-accent/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong shadow-sm">
                        <VialIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-base font-black text-content">{compound.name}</span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-accent-strong transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

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
                Before You Buy, <span className="italic text-accent">Compare</span>
              </h2>
            </div>
            <p className={cn('self-center lg:col-span-2', GUIDE_TEXT_CLASS)}>
              Know your concentration, now check the price. Compare cost per mg across suppliers with the{' '}
              <Link href="/tools/price-per-mg" className={INLINE_LINK_CLASS}>
                price per mg calculator
              </Link>
              , see live listings in the{' '}
              <Link href="/price-checker" className={INLINE_LINK_CLASS}>
                price checker
              </Link>
              , and check batch{' '}
              <Link href="/lab-reports" className={INLINE_LINK_CLASS}>
                lab reports
              </Link>{' '}
              before you choose.
            </p>
          </div>
        </section>
      </div>

      {/* Outside the page container so the product rail runs the full width of the screen. */}
      <BuyPeptidesSection supplierSlug="nura-peptide" className="mt-8" />

      <div className="mx-auto max-w-shell px-4 pb-14">
        <PageFaqSection path="/tools/calculator" className="mt-14" />
      </div>
    </div>
  );
}
