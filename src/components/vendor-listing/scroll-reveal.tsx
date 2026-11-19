'use client';

import { useEffect } from 'react';

/** How long the entrance takes (see `[data-reveal].reveal-in` in globals.css), plus a margin. */
const REVEAL_MS = 950;

/**
 * Fades in every `[data-reveal]` element on the page as it scrolls into view.
 *
 * Only elements that start below the fold are hidden, and only once this has
 * run, so the server-rendered page is fully visible without JavaScript and
 * nothing above the fold flickers. `data-reveal-delay` (ms) staggers siblings.
 * Reduced-motion visitors get the page as it is.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const pending = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
      (element) => element.getBoundingClientRect().top > window.innerHeight * 0.92,
    );
    const timers: number[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          const delay = Number(element.dataset.revealDelay ?? 0) || 0;
          element.style.transitionDelay = `${delay}ms`;
          element.classList.add('reveal-in');
          // Hand the element back to its own styles (hover transitions included) once it has arrived.
          timers.push(
            window.setTimeout(() => {
              element.classList.remove('reveal-armed', 'reveal-in');
              element.style.transitionDelay = '';
            }, delay + REVEAL_MS),
          );
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );

    for (const element of pending) {
      element.classList.add('reveal-armed');
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const timer of timers) window.clearTimeout(timer);
      for (const element of pending) element.classList.remove('reveal-armed', 'reveal-in');
    };
  }, []);

  return null;
}
