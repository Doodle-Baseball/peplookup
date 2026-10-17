'use client';

import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons/icons';
import { IDLE_CLASS, ITEM_CLASS, pageSlots } from '@/components/ui/pagination';

/**
 * One pre-rendered page of a supplier's catalogue at a time. The page number is
 * component state rather than a `?page=` param, so paging through a supplier's
 * products leaves the address bar alone. Search and the Form/Size filters still
 * live in the URL; the caller re-keys this on those so a narrower list starts
 * from its first page.
 */
export function CatalogPager({
  pages,
  initialPage,
  label,
}: {
  pages: readonly ReactNode[];
  /** From an old `?page=` link, so those still open on the page they point to. */
  initialPage: number;
  label: string;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const pageCount = pages.length;

  const goTo = (page: number) => {
    setCurrentPage(page);
    // The grid swaps in place; a visitor who scrolled down to the page buttons
    // is brought back to the top of the new page instead of its last row.
    const gridTop = gridTopRef.current;
    if (gridTop && gridTop.getBoundingClientRect().top < 0) gridTop.scrollIntoView({ block: 'start' });
  };

  return (
    <div ref={gridTopRef} className="scroll-mt-24">
      {pages[currentPage - 1]}

      {pageCount > 1 ? (
        <nav aria-label={label} className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          <StepButton disabled={currentPage === 1} label="Previous page" onClick={() => goTo(currentPage - 1)}>
            <ArrowLeftIcon className="h-4 w-4" />
          </StepButton>

          {pageSlots(currentPage, pageCount).map((slot, index) =>
            slot === 'gap' ? (
              <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-faint">
                …
              </span>
            ) : (
              <button
                key={slot}
                type="button"
                onClick={() => goTo(slot)}
                aria-current={slot === currentPage ? 'page' : undefined}
                className={cn(ITEM_CLASS, slot === currentPage ? 'bg-brand text-surface' : IDLE_CLASS)}
              >
                {slot}
              </button>
            ),
          )}

          <StepButton disabled={currentPage === pageCount} label="Next page" onClick={() => goTo(currentPage + 1)}>
            <ArrowRightIcon className="h-4 w-4" />
          </StepButton>
        </nav>
      ) : null}
    </div>
  );
}

function StepButton({
  disabled,
  label,
  onClick,
  children,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-hidden="true" className={cn(ITEM_CLASS, 'border border-line text-faint opacity-50')}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn(ITEM_CLASS, IDLE_CLASS)}>
      {children}
    </button>
  );
}
