import type { Metadata } from 'next';
import Link from 'next/link';
import { CoaFieldAccordion, type CoaField } from '@/components/tools/coa-field-accordion';
import { CoaChecklist } from '@/components/tools/coa-checklist';
import { ChromatogramIllustration } from '@/components/tools/chromatogram-illustration';
import { ExampleTable } from '@/components/tools/example-table';
import {
  ArrowRightIcon,
  BoltIcon,
  BoxIcon,
  ClockIcon,
  DocumentIcon,
  FlaskIcon,
  InfoIcon,
  ShieldCheckIcon,
  TagIcon,
  WarningIcon,
} from '@/components/icons/icons';

import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { BuyPeptidesSection } from '@/components/tools/buy-peptides-section';
import { cn } from '@/lib/cn';
import { PageSeo } from '@/components/seo/page-seo';

const PAGE = staticSeoPage('/tools/coa-reader');

// The "Buy peptides" rail shows live prices, so the page is re-rendered on the
// same window as the other price pages rather than frozen at build time.
export const revalidate = 1800;

/** Same panel, heading and body treatment as the other tool pages' guide sections. */
const GUIDE_PANEL_CLASS = 'mt-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8';
const GUIDE_HEADING_CLASS = 'mt-3 text-3xl font-black leading-tight text-content sm:text-4xl';
const GUIDE_TEXT_CLASS = 'text-sm leading-7 text-muted sm:text-base';
const INLINE_LINK_CLASS = 'font-bold text-brand hover:underline';

/** Illustrative only: shows how a peak table reads, not results for any real batch. */
const HPLC_PEAK_COLUMNS = ['Peak', 'Retention time', 'Area %', 'What it is'];
const HPLC_PEAK_ROWS = [
  ['1', '3.2 min', '0.4%', 'Early-eluting impurity'],
  ['2', '11.8 min', '98.9%', 'Main peak (target peptide)'],
  ['3', '12.6 min', '0.7%', 'Related impurity'],
];
const HPLC_MAIN_PEAK_ROW = 1;
const HPLC_PEAK_TOTAL = ['Total', '', '100.0%', ''];

/** Illustrative only: the ions a 1,419.5 Da peptide would be expected to show. */
const MASS_SPEC_COLUMNS = ['Ion reported', 'How it is calculated', 'Expected m/z'];
const MASS_SPEC_ROWS = [
  ['[M+H]+', '1,419.5 + 1.007', '1,420.5'],
  ['[M+2H]2+', '(1,419.5 + 2.014) ÷ 2', '710.8'],
];

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const FIELDS: CoaField[] = [
  {
    icon: <TagIcon className="h-5 w-5" />,
    title: 'Product & Lot Identity',
    subtitle: 'Does the COA identify the exact peptide, lot, and method?',
    bullets: [
      'Peptide name (e.g. BPC-157 acetate) and its amino acid sequence',
      'Theoretical molecular weight in daltons: should match the MS result',
      'Lot or batch number that matches the vial label exactly',
      'Manufacturing date and report date',
      'Testing laboratory name, address, and analyst',
    ],
  },
  {
    icon: <InfoIcon className="h-5 w-5" />,
    title: 'Appearance',
    subtitle: 'A simple but meaningful check on the physical product.',
    bullets: [
      'Most lyophilized peptides should be a white to off-white powder',
      'Yellow or brown discoloration can signal oxidation or degradation',
      'Visible clumping or an unusual texture can point to moisture exposure',
      'Compare what’s reported here to the product photos and description',
    ],
  },
  {
    icon: <FlaskIcon className="h-5 w-5" />,
    title: 'HPLC Purity',
    subtitle: 'Tells you how chemically clean the sample is.',
    bullets: [
      'Reported as area % at roughly 210–220 nm, where peptide bonds absorb',
      '98% or higher is generally treated as the research-grade benchmark',
      '95–97% is usually acceptable for most research applications',
      'Anything under 95% suggests a synthesis or purification issue',
      'Purity is method-dependent: column, gradient, wavelength and integration settings all affect the number',
    ],
  },
  {
    icon: <BoltIcon className="h-5 w-5" />,
    title: 'Mass Spectrometry (MS)',
    subtitle: 'Confirms the molecule actually matches what the label claims.',
    bullets: [
      'MS checks that molecular weight and charge states match the expected peptide',
      'Look for the expected m/z values at the +2 or +3 charge states',
      'Major peaks should line up with the theoretical molecular weight',
      'HPLC tells you how clean it is; MS tells you what it actually is',
    ],
  },
  {
    icon: <BoxIcon className="h-5 w-5" />,
    title: 'Net Peptide Content',
    subtitle: 'How much actual peptide is in the vial, excluding counterions.',
    bullets: [
      'Expressed as a % of gross weight, after accounting for water, salts and counterions like TFA or acetate',
      'Typical range is 75–90% for acetate salts',
      'Matters for dosing math: a vial labeled "10 mg" might contain closer to 8 mg of actual peptide',
      'Skipping this figure can throw reconstitution calculations off by 10–25%',
    ],
  },
  {
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    title: 'Endotoxin Testing',
    subtitle: 'Bacterial endotoxin testing, most relevant for in-vitro work.',
    bullets: [
      'Reported in EU/mg or EU/mL',
      'A common research-grade limit is under 1 EU/mg, sometimes up to 5 EU/mg',
      'Performed with a LAL (Limulus Amebocyte Lysate) assay',
      'Often missing from bare-minimum COAs: worth requesting directly before in-vitro use',
    ],
  },
  {
    icon: <WarningIcon className="h-5 w-5" />,
    title: 'Heavy Metals',
    subtitle: 'ICP-MS screening for residual lead, mercury, arsenic and cadmium.',
    bullets: [
      'Usually reported in ppm (parts per million)',
      'Should sit below the ICH Q3D limits used for parenteral research material',
      'Often run as a separate test from the main identity/purity report',
      'If it’s missing, it’s reasonable to ask the supplier for it directly',
    ],
  },
  {
    icon: <DocumentIcon className="h-5 w-5" />,
    title: 'Residual Solvents',
    subtitle: 'Trace synthesis solvents like acetonitrile, TFA, or methanol.',
    bullets: [
      'Reported against ICH Q3C guideline classes',
      'Class 1 solvents (e.g. benzene) should be undetectable',
      'Class 2/3 solvents (acetonitrile, methanol) have defined allowable limits',
      'Usually grouped into a single "residual solvents" section on the report',
    ],
  },
  {
    icon: <ClockIcon className="h-5 w-5" />,
    title: 'Dates & Sign-off',
    subtitle: 'Traceability and accountability for the report itself.',
    bullets: [
      'Manufacturing date for the lot',
      'Testing date and report date',
      'Retest date, if used: typically 1–2 years out for a lyophilized peptide',
      'Analyst name, QA reviewer, and a document control ID',
      'Stripped PDF metadata (missing author or lab info) is itself a red flag',
    ],
  },
];

export default async function CoaReaderGuidePage() {
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
            COA Reader · Field guide
          </span>
          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                How to Read a <span className="text-accent">Peptide COA</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            How to read a peptide certificate of analysis: every field, what the numbers mean, and the red flags
            that signal a fake.
          </p>
          <div className="animate-fade-up animate-delay-300 mx-auto mt-8 flex max-w-2xl items-start gap-4 rounded-card border border-danger/25 bg-surface-raised p-4 text-left shadow-card sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-danger/10 text-danger">
              <WarningIcon className="h-5 w-5" />
            </span>
            <p className="text-sm leading-6 text-muted">
              <strong className="font-bold text-content">Watch for fakes.</strong> Fraudulent certificates
              are common in the peptide market. A real COA names a specific batch, an identifiable lab,
              and a dated analytical method. If any of those are missing, treat the document with extra
              skepticism.
            </p>
          </div>
        </section>

        <section aria-labelledby="checklist-heading" className={cn(GUIDE_PANEL_CLASS, 'mt-12')}>
          <p className="eyebrow">Interactive</p>
          <h2 id="checklist-heading" className={GUIDE_HEADING_CLASS}>
            COA verification <span className="italic text-accent">checklist</span>
          </h2>
          <div className="mt-6">
            <CoaChecklist />
          </div>
        </section>

        <section aria-labelledby="what-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">The basics</p>
              <h2 id="what-heading" className={GUIDE_HEADING_CLASS}>
                What is a peptide <span className="italic text-accent">COA?</span>
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <p className={GUIDE_TEXT_CLASS}>
                A certificate of analysis is a batch-specific document summarizing the analytical results for a
                particular peptide lot. It&rsquo;s what connects a physical vial to its identity, purity, content,
                and contaminant profile: the four things worth knowing before trusting a research peptide.
              </p>
              <p className={GUIDE_TEXT_CLASS}>
                A good COA answers four questions: <strong className="text-content">Identity</strong> (is this the
                right molecule?), <strong className="text-content">Purity</strong> (how chemically clean is it?),{' '}
                <strong className="text-content">Content</strong> (how much actual peptide?), and{' '}
                <strong className="text-content">Contaminants</strong> (what else is present?).
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="approach-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Our approach</p>
              <h2 id="approach-heading" className={GUIDE_HEADING_CLASS}>
                Part of {site.name}&rsquo;s <span className="italic text-accent">COA Verification</span> Approach
              </h2>
            </div>
            <p className={cn('lg:col-span-2', GUIDE_TEXT_CLASS)}>
              This reader is one part of how {site.name} approaches certificate verification. Alongside
              this field guide, our{' '}
              <Link href="/lab-reports" className={INLINE_LINK_CLASS}>
                lab reports directory
              </Link>{' '}
              links directly to supplier-published certificates, and every supplier profile notes whether
              a COA is on file for each listing. Together, these tools help you cross-check claims
              rather than accepting them at face value.
            </p>
          </div>
        </section>

        <section aria-labelledby="fields-heading" className={GUIDE_PANEL_CLASS}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Every field</p>
              <h2 id="fields-heading" className={GUIDE_HEADING_CLASS}>
                Field-by-field <span className="italic text-accent">breakdown</span>
              </h2>
            </div>
            <p className="font-mono text-micro font-bold uppercase tracking-wide text-muted">{FIELDS.length} fields</p>
          </div>
          <div className="mt-6">
            <CoaFieldAccordion fields={FIELDS} />
          </div>
        </section>

        <section aria-labelledby="hplc-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Purity</p>
              <h2 id="hplc-heading" className={GUIDE_HEADING_CLASS}>
                How to Read an <span className="italic text-accent">HPLC Chromatogram</span>
              </h2>
            </div>
            <div className="min-w-0 space-y-5 lg:col-span-2">
              <p className={GUIDE_TEXT_CLASS}>
                An HPLC chromatogram is a graph of everything the detector picked up as the sample passed through the
                column. Time runs along the bottom (retention time, in minutes) and signal strength runs up the side.
                Each peak is a separate substance, and the target peptide should be the largest one by far.
              </p>
              <ChromatogramIllustration />
              <p className={GUIDE_TEXT_CLASS}>
                Purity is calculated from peak areas: the main peak&rsquo;s area divided by the total area of all
                peaks. The table below is an illustrative example of how a peak table appears on a COA.
              </p>
              <ExampleTable
                caption="Illustrative HPLC peak table"
                columns={HPLC_PEAK_COLUMNS}
                rows={HPLC_PEAK_ROWS}
                footer={HPLC_PEAK_TOTAL}
                highlightRow={HPLC_MAIN_PEAK_ROW}
              />
              <p className={GUIDE_TEXT_CLASS}>
                In this example the reported purity is 98.9%. Small peaks sitting close to the main peak are usually
                related impurities from synthesis, such as shortened or incomplete sequences. Peptides are normally
                detected at around 214–220&nbsp;nm, so check that the wavelength is listed. Remember that HPLC purity
                describes how clean the material is, not how much peptide is in the vial; that is what net peptide
                content covers.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="ms-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Identity</p>
              <h2 id="ms-heading" className={GUIDE_HEADING_CLASS}>
                How to Read <span className="italic text-accent">Mass Spectrometry</span> Results
              </h2>
            </div>
            <div className="min-w-0 space-y-5 lg:col-span-2">
              <p className={GUIDE_TEXT_CLASS}>
                Mass spectrometry confirms identity by measuring the molecular weight of what is in the sample and
                comparing it with the peptide&rsquo;s theoretical weight. If the two match closely, the expected
                molecule is present. A match does not measure purity, and it cannot by itself confirm the exact amino
                acid sequence.
              </p>
              <p className={GUIDE_TEXT_CLASS}>
                The number on a COA often does not equal the molecular weight, which confuses many readers. Mass
                spectrometers measure mass-to-charge ratio (m/z), and peptides usually pick up one or more protons,
                so the result may be reported as a charged ion rather than the neutral mass. The illustrative example
                below uses a peptide with a theoretical molecular weight of 1,419.5&nbsp;Da.
              </p>
              <ExampleTable
                caption="Illustrative mass spec results for a 1,419.5 Da peptide"
                columns={MASS_SPEC_COLUMNS}
                rows={MASS_SPEC_ROWS}
              />
              <p className="rounded-card border border-accent/25 bg-accent-tint px-4 py-3.5 text-sm leading-7 text-content sm:px-5 sm:text-base">
                If a COA lists 710.8 for this peptide, that is a match, not an error. What should worry you is an
                observed mass that matches no reasonable ion of the target, or a COA that gives a single &ldquo;MW
                confirmed&rdquo; line with no spectrum and no numbers.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cross-check-heading"
          className="relative mt-8 overflow-hidden rounded-panel border border-accent/25 bg-accent-tint p-5 shadow-card sm:p-8"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
          />
          <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 id="cross-check-heading" className={GUIDE_HEADING_CLASS}>
                Cross-check with published <span className="italic text-accent">lab reports</span>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-5 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between">
              <p className={cn('max-w-xl', GUIDE_TEXT_CLASS)}>
                Instead of judging a COA image in isolation, cross-check it against the reports suppliers have
                published for the same compound, and contact the testing lab directly if anything looks off.
              </p>
              <Link
                href="/lab-reports"
                className="btn-3d inline-flex shrink-0 items-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
              >
                <DocumentIcon className="h-4 w-4" />
                Browse lab reports
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="bottom-line-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Summary</p>
              <h2 id="bottom-line-heading" className={GUIDE_HEADING_CLASS}>
                Bottom <span className="italic text-accent">line</span>
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <p className="text-base font-bold leading-7 text-content sm:text-lg">
                HPLC tells you how clean it is. MS tells you what it is. Net content tells you how much. Contaminant
                tests tell you what else is in it. A complete COA touches all four.
              </p>
              <p className={GUIDE_TEXT_CLASS}>
                A COA is a research documentation tool, not a medical certificate or a guarantee. Pair it with your
                own judgment and quality checks rather than treating it as a substitute for either.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Outside the page container so the product rail runs the full width of the screen. */}
      <BuyPeptidesSection supplierSlug="nura-peptide" className="mt-8" />

      <div className="mx-auto max-w-shell px-4 pb-14">
        <PageFaqSection path="/tools/coa-reader" className="mt-14" />
      </div>
    </div>
  );
}
