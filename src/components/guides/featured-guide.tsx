import Link from 'next/link';
import type { Guide } from '@/data/guides';
import { GuideCover } from '@/components/guides/guide-cover';
import { ArrowRightIcon, ClockIcon } from '@/components/icons/icons';
import { formatDate } from '@/lib/format';

/** The lead guide on /guides, same card language as GuideCard, given the width to breathe. */
export function FeaturedGuide({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group grid overflow-hidden rounded-panel border border-line bg-surface-raised shadow-card transition-all duration-150 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift lg:grid-cols-2"
    >
      <GuideCover
        imageUrl={guide.coverImageUrl}
        icon={guide.icon}
        accent={guide.accent}
        className="aspect-[16/9] w-full lg:h-full lg:aspect-auto lg:min-h-64"
      />

      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-micro font-bold uppercase text-faint">
          <span className="rounded-pill bg-accent-tint px-2.5 py-1 text-accent-strong">Start here</span>
          <span className="rounded-pill border border-line bg-surface px-2.5 py-1 text-content">{guide.category}</span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {guide.readMinutes} min read
          </span>
        </div>

        <h2 className="text-2xl font-black leading-tight text-content transition-colors group-hover:text-accent-strong sm:text-3xl">
          {guide.title}
        </h2>

        <p className="text-sm leading-relaxed text-muted sm:text-base">{guide.excerpt}</p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <time dateTime={guide.publishedAt} className="text-xs text-faint">
            {formatDate(guide.publishedAt)}
          </time>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand">
            Read guide
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
