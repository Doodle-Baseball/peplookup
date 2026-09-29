import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PatternBackdrop } from '@/components/layout/pattern-backdrop';
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  DocumentIcon,
  ExternalIcon,
  FlaskIcon,
  GlobeIcon,
  SearchIcon,
  ShieldCheckIcon,
} from '@/components/icons/icons';

const PAGE = staticSeoPage('/community');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const TOPICS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Peptide education, in plain language',
    body: 'New to research peptides or well into it, the basics and the background explained without the jargon.',
    icon: <GlobeIcon className="h-5 w-5" />,
  },
  {
    title: 'Research studies, broken down',
    body: 'What a study actually says, what it does not, and how to read past the headline.',
    icon: <DocumentIcon className="h-5 w-5" />,
  },
  {
    title: 'Purity documentation and COAs',
    body: 'How to read a certificate of analysis and what to look for before trusting a purity number.',
    icon: <FlaskIcon className="h-5 w-5" />,
  },
  {
    title: 'Supplier and pricing comparisons',
    body: `Comparing research peptide suppliers and prices, with resources from ${site.name} shared where relevant.`,
    icon: <SearchIcon className="h-5 w-5" />,
  },
  {
    title: 'Open, respectful discussion',
    body: 'No hype and no spam. People learning together and helping each other ask better questions.',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
  },
];

const PILLARS: { label: string; value: string }[] = [
  { label: 'Membership', value: 'Free' },
  { label: 'Approach', value: 'Education first' },
  { label: 'Hosted on', value: 'Skool' },
];

const STEPS: { title: string; body: string }[] = [
  { title: 'Open the community', body: 'Follow the link to the Peptides Lookup community page on Skool.' },
  { title: 'Join for free', body: 'Sign in or create a free Skool account and join the group.' },
  { title: 'Read, ask and discuss', body: 'Learn from the material, ask your questions and talk it through with other members.' },
];

const TOOL_LINKS: { label: string; href: string; hint: string }[] = [
  { label: 'Price Checker', href: '/price-checker', hint: 'Cost per mg across suppliers' },
  { label: 'Supplier directory', href: '/suppliers', hint: 'Profiles, shipping and coupons' },
  { label: 'COA Reader', href: '/tools/coa-reader', hint: 'How to read a certificate' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Peptides Lookup Community',
  url: `https://${site.domain}/community`,
  description: PAGE.description,
  author: { '@type': 'Organization', name: site.publisher },
  publisher: { '@type': 'Organization', name: site.publisher },
  about: { '@type': 'Organization', name: 'Peptides Lookup', url: site.communityUrl },
};

export default async function CommunityPage() {
  const seo = await getSeoOverride(PAGE.path);

  return (
    <div className="relative isolate overflow-hidden">
      <PatternBackdrop mask="radial-gradient(ellipse at top, black 10%, transparent 55%)" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ------------------------------------------------------------- Hero */}
      <section className="mx-auto max-w-shell px-4 pb-12 pt-12 text-center sm:pt-16">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Free community
        </span>

        <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
          {seo?.h1 ? (
            seo.h1
          ) : (
            <>
              Peptides Skool <span className="text-accent">Community.</span>
            </>
          )}
        </h1>
        <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          A free community for anyone curious about research peptides, whether you are brand new or have been
          researching for a while. We make the research side easier to understand and give people a place to learn
          and talk it through together.
        </p>

        <div className="animate-fade-up animate-delay-300 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={site.communityUrl}
            target="_blank"
            rel="nofollow noopener"
            className="btn-3d group/cta inline-flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-7 py-3.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong sm:w-auto"
          >
            Join the community on Skool
            <ExternalIcon className="h-4 w-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </a>
          <Link
            href="/suppliers"
            className="inline-flex w-full items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-7 py-3.5 text-sm font-bold text-content shadow-card transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-strong sm:w-auto"
          >
            Compare suppliers
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <dl className="animate-fade-up animate-delay-300 mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-2 text-left sm:gap-3">
          {PILLARS.map((pillar, index) => (
            <div
              key={pillar.label}
              className={
                index === 0
                  ? 'rounded-card border border-accent/30 bg-accent-tint p-3 sm:p-4'
                  : 'rounded-card border border-line bg-surface-raised p-3 sm:p-4'
              }
            >
              <dt className="eyebrow">{pillar.label}</dt>
              <dd
                className={
                  index === 0
                    ? 'mt-1 text-base font-black text-accent-strong sm:text-xl'
                    : 'mt-1 text-base font-black text-content sm:text-xl'
                }
              >
                {pillar.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-sm text-muted">
          Author:{' '}
          <Link href="/about" rel="author" className="font-bold text-brand hover:underline">
            {site.publisher}
          </Link>
        </p>
      </section>

      <div className="mx-auto max-w-shell px-4 pb-16">
        {/* -------------------------------------------------------- Topics */}
        <section aria-labelledby="community-inside-heading">
          <p className="eyebrow">Inside the community</p>
          <h2 id="community-inside-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
            What we cover <span className="text-accent">inside.</span>
          </h2>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic, index) => (
              <li
                key={topic.title}
                className="group relative flex flex-col rounded-card border border-line bg-surface-raised p-5 shadow-card transition-all duration-150 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-chip bg-accent-tint text-accent-strong transition-transform duration-150 group-hover:scale-110">
                    {topic.icon}
                  </span>
                  <span className="font-mono text-xs font-bold text-faint">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-4 text-base font-black text-content">{topic.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{topic.body}</p>
              </li>
            ))}
            <li className="flex flex-col justify-center rounded-card border border-dashed border-accent/40 bg-accent-tint p-5 sm:col-span-2 lg:col-span-1">
              <p className="text-base font-black text-accent-strong">Education first, hype free.</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Just people learning about peptide research together and helping each other ask better questions.
              </p>
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------- Steps */}
        <section aria-labelledby="community-join-heading" className="mt-16">
          <p className="eyebrow">Getting started</p>
          <h2 id="community-join-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
            How to <span className="text-accent">join.</span>
          </h2>

          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4 rounded-card border border-line bg-surface-raised p-5 shadow-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand font-mono text-sm font-bold text-surface">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-black text-content">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------------- Behind the tool */}
        <section
          aria-labelledby="community-tools-heading"
          className="mt-16 rounded-panel border border-line bg-surface-raised p-6 shadow-card sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
            <div className="lg:col-span-2">
              <p className="eyebrow">From the team behind {site.name}</p>
              <h2 id="community-tools-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
                Built alongside <span className="text-accent">the tools.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                The community is run by the people who built {site.name}, a free tool for comparing verified research
                peptide suppliers, prices and COAs. Resources from it are shared in the community where they are
                relevant.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-3">
              {TOOL_LINKS.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="group flex h-full flex-col rounded-card border border-line bg-surface p-4 transition-all duration-150 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
                  >
                    <span className="text-sm font-black text-content transition-colors group-hover:text-accent-strong">
                      {tool.label}
                    </span>
                    <span className="mt-1 text-xs text-muted">{tool.hint}</span>
                    <ArrowRightIcon className="mt-auto h-4 w-4 pt-3 text-accent transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------------ CTA */}
        <section className="mt-16 rounded-panel border border-brand/20 bg-brand-tint p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black text-content sm:text-3xl">Ready to learn alongside us?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted sm:text-base">
            Join for free and bring your questions about peptide research, COAs and suppliers.
          </p>
          <a
            href={site.communityUrl}
            target="_blank"
            rel="nofollow noopener"
            className="btn-3d mt-6 inline-flex items-center gap-2 rounded-pill bg-brand px-7 py-3.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
          >
            Join on Skool
            <ExternalIcon className="h-4 w-4" />
          </a>
        </section>

        <p className="mt-8 flex items-start gap-2 rounded-chip border border-line bg-surface-raised px-4 py-3 text-xs leading-relaxed text-faint">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
          <span>
            For research and educational purposes only. Nothing here or in the community is medical advice,
            diagnosis or treatment. See our{' '}
            <Link href="/disclaimer" className="font-semibold text-brand hover:underline">
              legal disclaimer
            </Link>
            .
          </span>
        </p>
      </div>
    </div>
  );
}
