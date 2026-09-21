import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuides } from '@/lib/repository';
import { GuideCard } from '@/components/guides/guide-card';
import { FeaturedGuide } from '@/components/guides/featured-guide';
import { ArrowRightIcon, BoltIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';

const PAGE = staticSeoPage('/guides');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function GuidesPage() {
  const [seo, guides] = await Promise.all([getSeoOverride(PAGE.path), getGuides()]);
  const [featured, ...rest] = guides;
  const categories = [...new Set(guides.map((guide) => guide.category))];
  const totalMinutes = guides.reduce((sum, guide) => sum + guide.readMinutes, 0);

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
        <section className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
            <BoltIcon className="h-3.5 w-3.5" />
            Research guides
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Guides for the <span className="italic text-brand">modern researcher.</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            Plain-language explainers on verification, pricing and handling, the background behind the
            calculators and comparisons on the rest of this site.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <li
                key={category}
                className="rounded-pill border border-line bg-surface-raised px-3 py-1.5 text-xs font-bold text-content"
              >
                {category}
              </li>
            ))}
          </ul>
        </section>

        <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card border border-line bg-surface-raised p-4 text-center">
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-black text-content sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {featured ? (
          <section aria-labelledby="featured-heading" className="reveal mt-12">
            <h2 id="featured-heading" className="sr-only">
              Featured guide
            </h2>
            <FeaturedGuide guide={featured} />
          </section>
        ) : null}

        {rest.length > 0 ? (
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
              {rest.map((guide) => (
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
