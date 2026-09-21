import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { guides as seedGuides } from '@/data/guides';
import { getGuideBySlug, getGuides } from '@/lib/repository';
import { GuideCover } from '@/components/guides/guide-cover';
import { GuideCard } from '@/components/guides/guide-card';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '@/components/icons/icons';
import { formatDate } from '@/lib/format';
import { site } from '@/config/site';
import { guideSeoDefaults, pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

/**
 * Prerenders the guides that ship with the site. Admin-created guides are
 * rendered on demand instead, so adding one never needs a rebuild.
 */
export function generateStaticParams() {
  return seedGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  return withSeo(`/guides/${guide.slug}`, pageMetadata(guideSeoDefaults(guide)));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();
  const [seo, allGuides] = await Promise.all([getSeoOverride(`/guides/${guide.slug}`), getGuides()]);

  const more = allGuides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.publishedAt,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
  };

  return (
    <>
      {/* The reading column stays narrow: long-form prose is unreadable at full
          shell width. The FAQ and "More guides" bands below break out of it,
          the same width they get on every other page that renders them. */}
      <article className="mx-auto max-w-3xl px-4 pt-8 sm:pt-10">
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand">
          <ArrowLeftIcon className="h-4 w-4" />
          All guides
        </Link>

        <GuideCover
          imageUrl={guide.coverImageUrl}
          icon={guide.icon}
          accent={guide.accent}
          alt=""
          priority
          className="mt-5 aspect-[16/9] w-full rounded-card sm:rounded-panel"
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-micro font-bold uppercase text-faint">
          <span className="rounded-pill border border-line bg-surface px-2 py-0.5 text-content">{guide.category}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {guide.readMinutes} min read
          </span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
        </div>

        <h1 className="mt-3 text-[clamp(1.75rem,5vw,2.5rem)] font-black leading-tight text-content">
          {seo?.h1 || guide.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{guide.excerpt}</p>

        <div className="mt-10 space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-black leading-tight text-content sm:text-2xl">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {guide.relatedTool ? (
          <Link
            href={guide.relatedTool.href}
            className="btn-3d mt-10 inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-white"
          >
            {guide.relatedTool.label}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : null}

        <p className="mt-10 rounded-chip border border-line bg-surface-raised px-4 py-3 text-xs leading-relaxed text-faint">
          Research use only. This guide is general information, not medical, legal or laboratory-protocol advice.
          See the full{' '}
          <Link href="/disclaimer" className="font-semibold text-brand hover:underline">
            disclaimer
          </Link>{' '}
          for the terms this site operates under.
        </p>
      </article>

      <div className="mx-auto max-w-shell px-4">
        <PageFaqSection path={`/guides/${guide.slug}`} className="mt-12 sm:mt-14" />
      </div>

      {more.length > 0 ? (
        <section className="mx-auto max-w-shell px-4 pb-12">
          <div className="mt-12 border-t border-line pt-10 sm:mt-14">
            <h2 className="text-micro font-bold uppercase text-faint">More guides</h2>
            <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((item) => (
                <GuideCard key={item.slug} guide={item} />
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <div className="pb-12" />
      )}
    </>
  );
}
