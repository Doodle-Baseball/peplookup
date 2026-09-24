import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRightIcon,
  BoltIcon,
  BoxIcon,
  CheckBadgeIcon,
  DocumentIcon,
  FlaskIcon,
  ListIcon,
  ShieldCheckIcon,
  TagIcon,
} from '@/components/icons/icons';

import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/tools');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

interface ToolCard {
  href: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  icon: React.ReactNode;
  accent: 'brand' | 'info' | 'coupon' | 'lab' | 'promo';
}

const ACCENT_CLASSES: Record<ToolCard['accent'], { icon: string; text: string }> = {
  brand: { icon: 'bg-brand-soft text-brand-strong', text: 'text-brand' },
  info: { icon: 'bg-info/10 text-info', text: 'text-info' },
  coupon: { icon: 'bg-coupon-tint text-coupon-ink', text: 'text-coupon-ink' },
  lab: { icon: 'bg-lab-soft text-lab-ink', text: 'text-lab-ink' },
  promo: { icon: 'bg-promo-tint text-promo', text: 'text-promo' },
};

const TOOLS: ToolCard[] = [
  {
    href: '/',
    label: 'Price Checker',
    title: 'Price Checker',
    description:
      'Compare up to 4 research peptides side by side: cost per mg, dosage options, supplier ratings, and COA verification in one view.',
    bullets: ['Side-by-side comparison', '$/mg across vendors', 'Real supplier listings'],
    cta: 'Check Prices',
    icon: <ListIcon className="h-6 w-6" />,
    accent: 'coupon',
  },
  {
    href: '/tools/price-per-mg',
    label: 'Price per MG Calculator',
    title: 'Price per MG Calculator',
    description:
      'Compute the cost per milligram for any peptide vial, compare it against real live listings, and spot the best deals across suppliers.',
    bullets: ['$/mg, $/dose, total cost', 'Compare against real listings', 'Multi-vial pricing'],
    cta: 'Calculate Price',
    icon: <TagIcon className="h-6 w-6" />,
    accent: 'brand',
  },
  {
    href: '/tools/calculator',
    label: 'Reconstitution Calculator',
    title: 'Reconstitution Calculator',
    description:
      'Convert vial size, BAC water, and target dose into exact syringe units. Supports Find Units, Find Dose, and Find BAC Water modes.',
    bullets: ['3 calculation modes', 'U-100 / U-50 / U-30 syringes', 'Doses per vial'],
    cta: 'Reconstitute',
    icon: <FlaskIcon className="h-6 w-6" />,
    accent: 'info',
  },
  {
    href: '/tools/intranasal',
    label: 'Intranasal Calculator',
    title: 'Intranasal Calculator',
    description:
      'Calculate mcg per spray, sprays per bottle, and how many sprays deliver a target dose for intranasal peptide formulations.',
    bullets: ['Mcg per spray', 'Spray volume tuning', 'Doses per bottle'],
    cta: 'Spray Doses',
    icon: <BoxIcon className="h-6 w-6" />,
    accent: 'lab',
  },
  {
    href: '/tools/coa-reader',
    label: 'COA Reader & Guide',
    title: 'COA Reader & Guide',
    description:
      'Learn how to read a certificate of analysis, identify red flags, and verify HPLC, mass spec, and contaminant data on any vendor COA.',
    bullets: ['Field-by-field breakdown', 'Red/green flag checklist', 'Lab-verified listings'],
    cta: 'Verify a COA',
    icon: <DocumentIcon className="h-6 w-6" />,
    accent: 'promo',
  },
];

const BADGES: { label: string; icon: React.ReactNode }[] = [
  { label: '100% Client-Side', icon: <ShieldCheckIcon className="h-3.5 w-3.5" /> },
  { label: 'No Data Stored', icon: <CheckBadgeIcon className="h-3.5 w-3.5" /> },
  { label: 'Always Free', icon: <BoltIcon className="h-3.5 w-3.5" /> },
];

export default async function ToolsHubPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-info/10 blur-3xl" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-coupon/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <section className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
            <BoltIcon className="h-3.5 w-3.5" />
            Free research tools
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Peptide Pricing <span className="italic text-brand">Tools.</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            A free, no-login suite of calculators and verification tools for the modern peptide researcher.
            Reconstitute vials, compare prices, dose intranasal sprays, and read COAs like a pro.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
            Every calculation runs entirely in your browser with no data stored. The same per-milligram
            normalization used across the{' '}
            <Link href="/suppliers" className="font-bold text-brand hover:underline">
              supplier directory
            </Link>{' '}
            and{' '}
            <Link href="/price-checker" className="font-bold text-brand hover:underline">
              price checker
            </Link>{' '}
            powers these tools, so the numbers stay consistent whether you are browsing listings
            or running your own figures.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {BADGES.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 py-1.5 text-xs font-bold text-content shadow-sm"
              >
                <span className="text-brand">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {TOOLS.map((tool) => {
            const accent = ACCENT_CLASSES[tool.accent];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="tilt-card group flex flex-col rounded-card border border-line bg-surface-raised p-6 hover:border-brand/30 sm:p-7"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-chip shadow-sm ${accent.icon}`}>
                  {tool.icon}
                </span>
                <h2 className="mt-4 text-xl font-black text-content">{tool.title}</h2>
                <p className="mt-2 text-sm text-muted">{tool.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {tool.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm font-semibold text-content">
                      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.text.replace('text-', 'bg-')}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wide ${accent.text}`}>
                  {tool.cta}
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </section>

        <PageFaqSection path="/tools" className="mt-14" />

        <section className="mx-auto mt-12 max-w-3xl rounded-card border border-brand/20 bg-brand-tint p-6 text-center sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-sm">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-xl font-black text-content">Research Use Only</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
            All tools on this page are intended strictly for research, educational, and laboratory use. They are
            not a substitute for professional medical advice. Always verify a product against a real{' '}
            <Link href="/lab-reports" className="font-bold text-brand hover:underline">
              certificate of analysis
            </Link>{' '}
            and consult a qualified professional before starting any protocol.
          </p>
        </section>
      </div>
    </div>
  );
}
