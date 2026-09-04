import Link from 'next/link';
import { RESEARCH_USE_NOTICE } from '@/config/site';
import { WarningIcon } from '@/components/icons/icons';

export function ResearchNotice() {
  return (
    <div className="border-y border-brand/20 bg-brand-tint">
      <p className="mx-auto flex max-w-shell flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center text-xs text-muted sm:text-sm">
        <WarningIcon className="h-4 w-4 shrink-0 text-warn" />
        <span>
          <strong className="font-bold text-content">Research Use Only.</strong>{' '}
          {RESEARCH_USE_NOTICE.replace('Research Use Only. ', '')}
        </span>
        <Link href="/disclaimer" className="font-bold text-brand-strong underline hover:no-underline">
          View full disclaimers →
        </Link>
      </p>
    </div>
  );
}
