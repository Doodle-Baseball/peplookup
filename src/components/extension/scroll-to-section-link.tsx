'use client';

import type { MouseEvent, ReactNode } from 'react';

/**
 * An in-page link that scrolls to its section without writing `#id` into the
 * address bar, so the page URL stays as it was. The real `href` is kept for
 * visitors without JavaScript.
 */
export function ScrollToSectionLink({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: ReactNode;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Modified clicks keep their browser meaning (new tab, new window).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    // Moves keyboard and screen-reader focus to the section, as following a real anchor would.
    target.focus({ preventScroll: true });
  }

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
