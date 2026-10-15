'use client';

import { useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

/**
 * A product-page filter, sort or tab control. The URL stays the source of
 * truth, so a filtered view can still be shared as a link, but the control is a
 * button that swaps the URL in place rather than an `<a href>`: crawlers follow
 * links, and a link per filter combination led search engines to hundreds of
 * parameter URLs that all canonicalise back to the clean product page.
 */
export function FilterButton({
  href,
  isSelected,
  className,
  children,
}: {
  href: string;
  /** Omit for an action, such as a sort-direction toggle, that has no on/off state. */
  isSelected?: boolean;
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-busy={isPending || undefined}
      onClick={() => startTransition(() => router.replace(href, { scroll: false }))}
      // Buttons don't trigger the link-based navigation progress bar, so the
      // control itself shows that the new results are on their way.
      className={cn(className, isPending && 'opacity-60')}
    >
      {children}
    </button>
  );
}
