import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuides } from '@/lib/repository';
import { guideHasContent } from '@/data/guides';
import { GuideCard } from '@/components/guides/guide-card';
import { ArrowRightIcon, BoltIcon, ClockIcon, DocumentIcon, TagIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageSeo } from '@/components/seo/page-seo';

const PAGE = staticSeoPage('/guides');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function GuidesPage() {
  const [seo, allGuides] = await Promise.all([getSeoOverride(PAGE.path), getGuides()]);
  // Placeholder guides (no body yet) are noindex, so nothing links to them either.
  const guides = allGuides.filter(guideHasContent);
  const guideItems = guides.map((guide) => ({ name: guide.title, url: `/guides/${guide.slug}` }));
  const categories = [...new Set(guides.map((guide) => guide.category))];
  const totalMinutes = guides.reduce((sum, guide) => sum + guide.readMinutes, 0);

  const stats = [
    { label: 'Guides published', value: String(guides.length), icon: <DocumentIcon className="h-5 w-5" /> },
    { label: 'Topics covered', value: String(categories.length), icon: <TagIcon className="h-5 w-5" /> },
    { label: 'Minutes of reading', value: String(totalMinutes), icon: <ClockIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <PageSeo seo={PAGE} itemList={guideItems} dataDates={guides.map((guide) => guide.publishedAt)} />
        {/* Hero: the heading and topics on the left, the library's figures beside them. */}
        <section className="animate-fade-up relative overflow-hidden rounded-panel border border-line bg-surface-raised p-6 shadow-card sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 font-mono text-micro font-bold uppercase tracking-wide text-content shadow-card">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <BoltIcon className="h-3.5 w-3.5 text-accent-strong" />
                Research guides
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-content sm:text-5xl lg:text-6xl">
                {seo?.h1 ? (
                  seo.h1
                ) : (
                  <>
                    Guides for the <span className="italic text-brand">modern researcher.</span>
                  </>
                )}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
                Plain-language explainers on verification, pricing and handling, the background behind the
                calculators and comparisons on the rest of this site.
              </p>

              {categories.length > 0 ? (
                <ul aria-label="Topics" className="mt-7 flex flex-wrap items-center gap-2">
                  {categories.map((category) => (
                    <li
                      key={category}
                      className="rounded-pill border border-accent/25 bg-accent-tint px-3.5 py-1.5 text-xs font-bold text-accent-strong"
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {guides.length > 0 ? (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="animate-fade-up flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-sm"
                    style={{ animationDelay: `${150 + index * 80}ms` }}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                      {stat.icon}
                    </span>
                    <div className="min-w-0">
                      <dt className="eyebrow">{stat.label}</dt>
                      <dd className="mt-0.5 text-2xl font-black text-content sm:text-3xl">{stat.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </section>

        {guides.length === 0 ? (
          <p className="mx-auto mt-10 max-w-2xl rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No guides published yet.
          </p>
        ) : null}

        {guides.length > 0 ? (
          <section aria-labelledby="all-guides-heading" className="reveal mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">The library</p>
                <h2 id="all-guides-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
                  Every <span className="text-accent">guide.</span>
                </h2>
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </ul>
          </section>
        ) : null}

        <section className="reveal mt-14 rounded-panel border border-brand/20 bg-brand-tint p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black text-content sm:text-3xl">Put the theory to work.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted sm:text-base">
            Every guide here backs a calculator or comparison on the site. Run the numbers on a real vial
            next.
          </p>
          <Link
            href="/tools"
            className="btn-3d mt-6 inline-flex items-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
          >
            Browse the tools
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
