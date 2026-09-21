import type { Metadata } from 'next';
import Link from 'next/link';
import { ReconstitutionCalculator } from '@/components/tools/reconstitution-calculator';
import { InfoIcon, SlidersIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/tools/calculator');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function ReconstitutionToolPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="mx-auto max-w-shell px-4 py-14">
      <section className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-accent/25 bg-accent-tint px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-strong">
          <SlidersIcon className="h-3.5 w-3.5" />
          3 Calculation Modes
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-content sm:text-6xl">
          {seo?.h1 ? (
            seo.h1
          ) : (
            <>
              Reconstitution <span className="italic text-accent">Calculator.</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
          Convert peptide vial size, BAC water volume, and target dose into exact syringe units.
        </p>
      </section>

      <section className="mt-10">
        <ReconstitutionCalculator />
      </section>

      <section className="mt-10 rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-tint text-accent">
            <InfoIcon className="h-5 w-5" />
          </span>
          <div className="max-w-3xl space-y-3 text-sm text-muted">
            <h2 className="text-lg font-black text-content">The math</h2>
            <p>
              <strong className="text-content">Concentration = Vial (mg) ÷ BAC water (mL).</strong> For example, a
              10&nbsp;mg vial mixed with 2&nbsp;mL of BAC water yields 5,000&nbsp;mcg/mL.
            </p>
            <p>
              <strong className="text-content">Units to draw = (Target dose ÷ concentration) × 100.</strong> A
              500&nbsp;mcg dose from 5,000&nbsp;mcg/mL is 0.1&nbsp;mL, which is 10 units on a U-100 syringe. U-100,
              U-50 and U-30 syringes all use the same 100-units-per-mL scale; the smaller barrels just hold fewer
              units, which makes small doses easier to read.
            </p>
            <p>
              <strong className="text-content">Find Dose and Find BAC Water rearrange the same equation:</strong>{' '}
              dose = (units ÷ 100) × concentration, and BAC water = vial (mcg) × units ÷ (dose × 100).
            </p>
            <p>
              Always reconstitute slowly: drip BAC water down the side of the vial, never squirt it directly onto
              the lyophilized cake. Do not shake; gently swirl until dissolved.
            </p>
            <p className="text-xs text-faint">
              For research use only. This tool converts units; it doesn&rsquo;t recommend a dose. Cross-check against
              a{' '}
              <Link href="/lab-reports" className="font-bold text-accent hover:underline">
                lab-verified COA
              </Link>{' '}
              for the actual product in hand.
            </p>
          </div>
        </div>
      </section>

      <PageFaqSection path="/tools/calculator" className="mt-14" />
    </div>
  );
}
