import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons/icons';

type PageSlot = number | 'gap';

/**
 * First, last, and the current page ±1. Enough to reach any page in two taps
 * without a row of twenty numbers wrapping across a phone screen.
 */
function pageSlots(currentPage: number, pageCount: number): PageSlot[] {
  const slots: PageSlot[] = [];
  for (let page = 1; page <= pageCount; page++) {
    const isEdge = page === 1 || page === pageCount;
    if (isEdge || Math.abs(page - currentPage) <= 1) {
      slots.push(page);
    } else if (slots[slots.length - 1] !== 'gap') {
      slots.push('gap');
    }
  }
  return slots;
}

/** 40px square keeps every page link a comfortable touch target. */
const ITEM_CLASS =
  'flex h-10 min-w-10 items-center justify-center rounded-chip px-3 text-sm font-bold transition-colors';
const IDLE_CLASS = 'border border-line bg-surface-raised text-content hover:border-brand';

export function Pagination({
  label,
  currentPage,
  pageCount,
  hrefForPage,
}: {
  label: string;
  currentPage: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <StepLink href={currentPage > 1 ? hrefForPage(currentPage - 1) : null} label="Previous page">
        <ArrowLeftIcon className="h-4 w-4" />
      </StepLink>

      {pageSlots(currentPage, pageCount).map((slot, index) =>
        slot === 'gap' ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-faint">
            …
          </span>
        ) : (
          <Link
            key={slot}
            href={hrefForPage(slot)}
            aria-current={slot === currentPage ? 'page' : undefined}
            className={cn(ITEM_CLASS, slot === currentPage ? 'bg-brand text-surface' : IDLE_CLASS)}
          >
            {slot}
          </Link>
        ),
      )}

      <StepLink href={currentPage < pageCount ? hrefForPage(currentPage + 1) : null} label="Next page">
        <ArrowRightIcon className="h-4 w-4" />
      </StepLink>
    </nav>
  );
}

function StepLink({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  if (!href) {
    return (
      <span aria-hidden="true" className={cn(ITEM_CLASS, 'border border-line text-faint opacity-50')}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cn(ITEM_CLASS, IDLE_CLASS)}>
      {children}
    </Link>
  );
}
