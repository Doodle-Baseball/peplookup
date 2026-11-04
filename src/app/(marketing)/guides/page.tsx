import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuides } from '@/lib/repository';
import { guideHasContent } from '@/data/guides';
import { GuideCard } from '@/components/guides/guide-card';
import { ArrowRightIcon, BoltIcon } from '@/components/icons/icons';
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

  const ticker = [
    `${guides.length} ${guides.length === 1 ? 'guide' : 'guides'} published`,
    `${categories.length} ${categories.length === 1 ? 'topic' : 'topics'} covered`,
    `${totalMinutes} minutes of reading`,
    'Research use only',
    'Written in plain language',
  ];
  const stats = [
    { label: 'Guides published', value: String(guides.length) },
    { label: 'Topics covered', value: String(categories.length) },
    { label: 'Minutes of reading', value: String(totalMinutes) },
  ];

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <PageSeo seo={PAGE} itemList={guideItems} dataDates={guides.map((guide) => guide.publishedAt)} />
        {/* Hero, built like the homepage's: a centred badge, heading and line, quick links to each
            guide with a caption under it, and the dark ticker band below carrying the library's figures. */}
        <section className="relative text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-micro font-bold uppercase tracking-wide text-content shadow-card">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Research guides
          </span>

          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight text-content sm:text-6xl lg:text-7xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Guides for the <span className="text-accent">modern researcher.</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Plain-language explainers on verification, pricing and handling, the background behind the
            calculators and comparisons on the rest of this site.
          </p>

          {guides.length > 0 ? (
            <div className="animate-fade-up animate-delay-300 mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3 sm:items-start">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group flex min-w-0 flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-chip border border-line bg-surface-raised px-4 py-2 text-center text-sm font-bold text-content shadow-sm transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                    <BoltIcon className="h-3.5 w-3.5 shrink-0 text-promo transition-colors group-hover:text-white" />
                    <span className="min-w-0 break-words">{guide.title}</span>
                  </span>
                  <span className="text-xs text-faint">
                    {guide.category} &middot; {guide.readMinutes} min read
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {guides.length > 0 ? (
          <section aria-label="The guide library in numbers" className="mt-10">
            <div className="marquee panel-dark rounded-bar py-4 shadow-panel">
              <div className="marquee-track" aria-hidden="true">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 items-center">
                    {ticker.map((item) => (
                      <span
                        key={`${copy}-${item}`}
                        className="flex items-center whitespace-nowrap px-8 font-mono text-sm font-bold uppercase tracking-wide text-white/90"
                      >
                        {item}
                        <span className="ml-8 text-white/25">&middot;</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              {/* The moving band is hidden from screen readers; the same figures, read once. */}
              <p className="sr-only">{stats.map((stat) => `${stat.label}: ${stat.value}`).join(', ')}.</p>
            </div>
          </section>
        ) : null}

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
