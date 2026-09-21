import Link from 'next/link';
import type { Guide } from '@/data/guides';
import { GuideCover } from '@/components/guides/guide-cover';
import { ArrowRightIcon, ClockIcon } from '@/components/icons/icons';
import { formatDate } from '@/lib/format';

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    // overflow-hidden belongs on the card-3d element itself, not only on the
    // link inside it: card-3d sets transform-style: preserve-3d, and a clip on
    // a descendant of a preserve-3d ancestor doesn't reliably contain the
    // cover art once it scales on hover, so it bled past the rounded corners.
    <li className="card-3d h-full overflow-hidden rounded-card">
      <Link
        href={`/guides/${guide.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface-raised"
      >
        <GuideCover
          imageUrl={guide.coverImageUrl}
          icon={guide.icon}
          accent={guide.accent}
          className="card-3d-layer aspect-[16/9] w-full"
        />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2 text-micro font-bold uppercase text-faint">
            <span className="rounded-pill border border-line bg-surface px-2 py-0.5 text-content">{guide.category}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {guide.readMinutes} min read
            </span>
          </div>
          <h2 className="text-lg font-black leading-snug text-content">{guide.title}</h2>
          <p className="line-clamp-2 text-sm text-muted">{guide.excerpt}</p>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-faint">
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand">
              Read guide
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
