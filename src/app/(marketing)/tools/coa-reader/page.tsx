import type { Metadata } from 'next';
import Link from 'next/link';
import { CoaFieldAccordion, type CoaField } from '@/components/tools/coa-field-accordion';
import { CoaChecklist } from '@/components/tools/coa-checklist';
import {
  BoltIcon,
  BoxIcon,
  ClockIcon,
  DocumentIcon,
  ExternalIcon,
  FlaskIcon,
  InfoIcon,
  ShieldCheckIcon,
  TagIcon,
  WarningIcon,
} from '@/components/icons/icons';

import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/tools/coa-reader');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const FIELDS: CoaField[] = [
  {
    icon: <TagIcon className="h-5 w-5" />,
    accent: 'info',
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
    accent: 'lab',
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
    accent: 'brand',
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
    accent: 'coupon',
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
    accent: 'promo',
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
    accent: 'danger',
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
    accent: 'info',
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
    accent: 'lab',
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
    accent: 'brand',
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
    <div className="mx-auto max-w-shell px-4 py-14">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
          <DocumentIcon className="h-3.5 w-3.5" />
          Field guide
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? (
            seo.h1
          ) : (
            <>
              COA <span className="italic text-brand">Reader.</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
          How to read a peptide certificate of analysis: every field, what the numbers mean, and the red flags
          that signal a fake.
        </p>
      </section>

      <section className="mt-10 rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-black text-content">What is a peptide COA?</h2>
        <p className="mt-3 text-sm text-muted">
          A certificate of analysis is a batch-specific document summarizing the analytical results for a
          particular peptide lot. It&rsquo;s what connects a physical vial to its identity, purity, content, and
          contaminant profile: the four things worth knowing before trusting a research peptide.
        </p>
        <p className="mt-3 text-sm text-muted">
          A good COA answers four questions: <strong className="text-content">Identity</strong> (is this the right
          sequence?), <strong className="text-content">Purity</strong> (how chemically clean is it?),{' '}
          <strong className="text-content">Content</strong> (how much actual peptide?), and{' '}
          <strong className="text-content">Contaminants</strong> (any harmful compounds present?).
        </p>
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-black text-content">Field-by-field breakdown</h2>
        <div className="mt-4">
          <CoaFieldAccordion fields={FIELDS} />
        </div>
      </section>

      <section className="mt-10 rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-black text-content">COA verification checklist</h2>
        <div className="mt-4">
          <CoaChecklist />
        </div>
      </section>

      <section className="mt-10 rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-black text-content">Cross-check with verified lab reports</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm text-muted">
            Instead of judging a COA image in isolation, cross-check it against reports already on file from
            suppliers with a live, verifiable test on record.
          </p>
          <Link
            href="/lab-reports"
            className="btn-3d inline-flex shrink-0 items-center gap-2 rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
          >
            <DocumentIcon className="h-4 w-4" />
            Browse lab reports
            <ExternalIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-card border border-brand/20 bg-brand-tint p-6 sm:p-8">
        <h2 className="text-sm font-black uppercase tracking-wide text-content">Bottom line</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          HPLC tells you how clean it is. MS tells you what it is. Net content tells you how much. Contaminant
          tests tell you it&rsquo;s safe to handle. A complete COA touches all four.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          A COA is a research documentation tool, not a medical certificate or a guarantee. Pair it with your own
          judgment and quality checks rather than treating it as a substitute for either.
        </p>
      </section>

      <PageFaqSection path="/tools/coa-reader" className="mt-14" />
    </div>
  );
}
