'use client';

import { useEffect, useId, useRef, useState, type MouseEvent, type MutableRefObject } from 'react';
import { ChevronDownIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

/** How long scroll-tracking stays paused after a click, so the highlight doesn't flicker through the sections it passes. */
const CLICK_SCROLL_LOCK_MS = 900;

/**
 * The section currently being read: whichever section crosses a band across
 * the upper part of the screen, so the highlight moves as each H2 arrives.
 * `lockUntil` lets a click set the answer directly while its scroll runs.
 */
function useActiveSection(idsKey: string, lockUntil: MutableRefObject<number>) {
  const [activeId, setActiveId] = useState<string | null>(idsKey.split('|')[0] || null);

  // Keyed on the joined ids rather than an array, so a re-render with the same
  // sections doesn't tear down and rebuild the observer.
  useEffect(() => {
    const ids = idsKey.split('|').filter(Boolean);
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        if (Date.now() < lockUntil.current) return;
        const first = ids.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [idsKey, lockUntil]);

  return [activeId, setActiveId] as const;
}

/**
 * "On this page": one link per H2, built from the guide's own section
 * headings. Collapsible, marks the section on screen, and scrolls to a
 * section in place: the address bar keeps the page's clean URL rather than
 * picking up a #fragment on every click.
 */
export function GuideToc({
  items,
  defaultOpen = true,
}: {
  items: readonly { id: string; heading: string }[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const listId = useId();
  const labelId = useId();
  const lockUntil = useRef(0);
  const [activeId, setActiveId] = useActiveSection(items.map((item) => item.id).join('|'), lockUntil);

  if (items.length < 2) return null;

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    // Without the section (it should always be there) the plain anchor link still works.
    if (!target) return;
    event.preventDefault();
    lockUntil.current = Date.now() + CLICK_SCROLL_LOCK_MS;
    setActiveId(id);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // scroll-margin on the section keeps its heading clear of the sticky site header.
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    // Move focus with the view, as following an in-page link would, so keyboard and screen-reader users land there too.
    const heading = target.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  };


  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const progress = ((activeIndex + 1) / items.length) * 100;

  return (
    <nav
      aria-labelledby={labelId}
      className="animate-fade-up relative overflow-hidden rounded-card border border-line border-b-accent/30 bg-surface-raised shadow-lift ring-1 ring-accent/10 transition-shadow duration-300 hover:shadow-panel"
    >
      {/* Top edge highlight that gives the card a lifted, 3D lip. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={listId}
        className="group/toc relative flex w-full items-center gap-3 overflow-hidden bg-gradient-to-br from-accent-tint via-surface-raised to-surface-raised px-4 py-3.5 text-left"
      >
        {/* A band of light that crosses the header now and then (skipped with reduced motion). */}
        <span
          aria-hidden="true"
          className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-surface-raised/70 to-transparent"
        />
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-chip border-b-4 border-accent-strong bg-accent text-white shadow-lift transition-transform duration-300 group-hover/toc:-translate-y-0.5 group-hover/toc:rotate-3">
          <BookIcon className="h-5 w-5" />
        </span>
        <span className="relative min-w-0 flex-1">
          {/* A label rather than an H2, so the page's H2s stay exactly its sections. */}
          <span id={labelId} className="block text-base font-black leading-tight text-content">
            On this page
          </span>
          <span className="mt-0.5 block font-mono text-micro font-bold uppercase tracking-wide text-faint">
            {items.length} sections
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-chip border border-b-4 border-line bg-surface-raised text-muted shadow-card transition-all duration-300 group-hover/toc:-translate-y-0.5 group-hover/toc:border-accent group-hover/toc:text-accent-strong group-active/toc:translate-y-0 group-active/toc:border-b-2"
        >
          <ChevronDownIcon className={cn('h-4 w-4 transition-transform duration-300', !isOpen && '-rotate-90')} />
        </span>
      </button>

      {/* How far through the guide's sections the reader is. */}
      <div aria-hidden="true" className="h-1 bg-surface-sunken">
        <div
          className="h-full rounded-r-pill bg-gradient-to-r from-accent to-accent-strong transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol id={listId} hidden={!isOpen} className="space-y-0.5 p-2">
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const isRead = index < activeIndex;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => goTo(event, item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'group/item relative flex items-start gap-3 rounded-chip py-1.5 pl-2 pr-2.5 text-sm leading-snug transition-all duration-300',
                  isActive
                    ? 'translate-x-0.5 bg-accent-soft font-bold text-accent-strong shadow-card'
                    : 'font-medium text-muted hover:translate-x-1 hover:bg-surface-sunken hover:text-content',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative mt-px flex h-5 w-6 shrink-0 items-center justify-center rounded-chip font-mono text-micro font-bold tabular-nums transition-all duration-300',
                    isActive
                      ? 'border-b-2 border-accent-strong bg-accent text-white shadow-card'
                      : isRead
                        ? 'bg-accent-soft text-accent-strong'
                        : 'bg-surface-sunken text-faint group-hover/item:bg-surface-raised group-hover/item:text-content',
                  )}
                >
                  {isActive ? <span className="badge-ping absolute inset-0 rounded-chip bg-accent/40" /> : null}
                  <span className="relative">{String(index + 1).padStart(2, '0')}</span>
                </span>
                {item.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
