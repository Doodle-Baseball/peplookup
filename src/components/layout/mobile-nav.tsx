'use client';

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { primaryNav } from '@/config/site';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, CloseIcon, HeartIcon, MenuIcon } from '@/components/icons/icons';
import { NavLink } from '@/components/layout/nav-link';
import { WatchlistCountBadge } from '@/components/layout/watchlist-count-badge';

const PANEL_ID = 'mobile-nav-panel';
/** Must match the breakpoint at which SiteHeader shows the desktop nav. */
const DESKTOP_QUERY = '(min-width: 1280px)';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Covers back/forward navigation too, not only taps on links in the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    // The page must not scroll underneath the menu while a thumb drags the list.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Rotating a tablet past the breakpoint hides this component; without this the
  // body would stay scroll-locked behind an invisible menu.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Tapping the link for the page you're already on doesn't change the
  // pathname, so the effect above wouldn't close the menu on its own.
  function closeOnLinkClick(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  }

  return (
    <div className="xl:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className="rounded-pill p-2 text-content transition-colors hover:bg-brand hover:text-surface"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open
        ? createPortal(
            // Portalled to <body>: the header's backdrop-blur makes it the
            // containing block for fixed children, which would shrink this
            // scrim to the size of the header bar.
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              // z-40 matches the sticky header, so the dim covers that too
              // rather than leaving the bar bright above the scrim.
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm xl:hidden"
            />,
            document.body,
          )
        : null}

      {open
        ? createPortal(
            // Portalled for the same reason as the scrim: the header's
            // backdrop-blur is a containing block for fixed children, which
            // would otherwise trap this drawer inside the header bar.
            // Full-height panel pinned to the right edge.
            <nav
              id={PANEL_ID}
              aria-label="Primary mobile menu"
              onClick={closeOnLinkClick}
              className="animate-slide-in-right fixed right-0 top-0 z-50 flex h-dvh w-[min(86vw,22rem)] flex-col overflow-y-auto overscroll-contain border-l border-line bg-surface-raised p-3 shadow-panel xl:hidden"
            >
              {/* The drawer covers the header, so the hamburger that opened it
                  is no longer reachable; this is the way back out. */}
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    toggleRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="rounded-pill p-2 text-content transition-colors hover:bg-brand hover:text-surface"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

          <ul className="space-y-1">
            {primaryNav.map((item, index) => {
              const isExpanded = expandedGroup === item.label;
              const groupId = `${PANEL_ID}-group-${index}`;

              return (
                <li key={item.label}>
                  <div className="flex items-center gap-1">
                    <NavLink
                      href={item.href}
                      className="flex-1 rounded-chip px-3 py-3 text-base font-bold text-content transition-colors hover:bg-brand-soft"
                      activeClassName="bg-brand text-surface hover:bg-brand"
                    >
                      {item.label}
                    </NavLink>
                    {item.children ? (
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(isExpanded ? null : item.label)}
                        aria-expanded={isExpanded}
                        aria-controls={groupId}
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} ${item.label} links`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip text-muted transition-colors hover:bg-brand-soft hover:text-content"
                      >
                        <ChevronDownIcon className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                    ) : null}
                  </div>

                  {item.children && isExpanded ? (
                    <ul id={groupId} className="mb-1 ml-3 mt-1 space-y-0.5 border-l border-line pl-3">
                      {item.children.map((child) => (
                        <li key={child.href + child.label}>
                          <NavLink
                            href={child.href}
                            className="block rounded-chip px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-brand-soft hover:text-content"
                            activeClassName="bg-brand-soft text-content"
                          >
                            {child.label}
                            {child.hint ? (
                              <span className="block text-xs font-normal text-faint">{child.hint}</span>
                            ) : null}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 border-t border-line pt-2">
            <NavLink
              href="/watchlist"
              className="flex items-center justify-between gap-2.5 rounded-chip px-3 py-3 text-base font-bold text-content transition-colors hover:bg-brand-soft"
              activeClassName="bg-brand text-surface hover:bg-brand"
            >
              <span className="flex items-center gap-2.5">
                <HeartIcon className="h-4 w-4" />
                Watchlist
              </span>
              <WatchlistCountBadge />
            </NavLink>
          </div>
            </nav>,
            document.body,
          )
        : null}
    </div>
  );
}
