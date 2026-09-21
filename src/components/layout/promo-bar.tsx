import Link from 'next/link';
import { ArrowRightIcon, BoltIcon, ClockIcon } from '@/components/icons/icons';

export interface Promotion {
  readonly id: string;
  readonly headline: string;
  readonly detail: string;
  readonly endsAt: string;
  readonly href: string;
}

function remaining(endsAt: string, now: Date): string | null {
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return null;
  const ms = end - now.getTime();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
}

/**
 * Renders nothing when no promotion is live, rather than showing an empty bar
 * or a countdown that has already expired.
 */
export function PromoBar({ promotion }: { promotion: Promotion | null }) {
  if (!promotion) return null;
  const left = remaining(promotion.endsAt, new Date());
  if (!left) return null;

  return (
    <div className="bg-brand-strong text-white">
      <div className="mx-auto flex max-w-shell flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm">
        <p className="flex items-center gap-2 font-bold uppercase tracking-wide">
          <BoltIcon className="h-4 w-4 text-rating" />
          {promotion.headline}
        </p>
        <p className="hidden text-white/80 sm:block">{promotion.detail}</p>
        <p className="flex items-center gap-1.5 rounded-pill bg-black/20 px-2.5 py-1 font-mono text-xs">
          <ClockIcon className="h-3.5 w-3.5" />
          {left}
        </p>
        <Link
          href={promotion.href}
          className="inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-1.5 text-xs font-bold text-brand-strong hover:bg-white/90"
        >
          Get Deal
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
