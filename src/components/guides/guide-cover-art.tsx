import { BadgeIconMap } from '@/components/guides/guide-icon-map';
import type { GuideAccent, GuideIcon } from '@/data/guides';
import { cn } from '@/lib/cn';

const ACCENT_BG: Record<GuideAccent, string> = {
  'cat-1': 'bg-cat-1/15',
  'cat-2': 'bg-cat-2/15',
  'cat-3': 'bg-cat-3/15',
  'cat-4': 'bg-cat-4/15',
  'cat-5': 'bg-cat-5/15',
};

const ACCENT_GLOW: Record<GuideAccent, string> = {
  'cat-1': 'bg-cat-1/40',
  'cat-2': 'bg-cat-2/40',
  'cat-3': 'bg-cat-3/40',
  'cat-4': 'bg-cat-4/40',
  'cat-5': 'bg-cat-5/40',
};

const ACCENT_TEXT: Record<GuideAccent, string> = {
  'cat-1': 'text-cat-1',
  'cat-2': 'text-cat-2',
  'cat-3': 'text-cat-3',
  'cat-4': 'text-cat-4',
  'cat-5': 'text-cat-5',
};

/**
 * Every guide's "photo": a generated cover instead of stock or AI imagery, so
 * nothing here is a claim about a real product, lab or person. Built from the
 * same dot-grid + soft accent glow language as PatternBackdrop, so guides
 * read as part of this site rather than a bolted-on blog.
 */
export function GuideCoverArt({
  icon,
  accent,
  className,
}: {
  icon: GuideIcon;
  accent: GuideAccent;
  className?: string;
}) {
  const IconComponent = BadgeIconMap[icon];
  return (
    <div className={cn('dot-grid relative isolate overflow-hidden', ACCENT_BG[accent], className)}>
      <div
        aria-hidden="true"
        className={cn('absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl', ACCENT_GLOW[accent])}
      />
      <div
        aria-hidden="true"
        className={cn('absolute -bottom-12 -left-8 h-32 w-32 rounded-full blur-3xl', ACCENT_GLOW[accent])}
      />
      <div className="relative flex h-full items-center justify-center">
        <IconComponent className={cn('h-12 w-12', ACCENT_TEXT[accent])} strokeWidth={1.5} />
      </div>
    </div>
  );
}
