'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { primaryNav } from '@/config/site';
import { CloseIcon, MenuIcon } from '@/components/icons/icons';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // A fixed overlay over a scrolled page should not scroll the page behind it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="rounded-chip p-2 text-muted hover:bg-surface-sunken hover:text-content xl:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <nav
            aria-label="Primary"
            className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-surface shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-sm font-bold uppercase text-muted">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-chip p-2 text-muted hover:bg-surface-sunken"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex-1 p-2">
              {primaryNav.map((item) => (
                <li key={item.label} className="py-1">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-chip px-3 py-2 text-sm font-bold text-content hover:bg-surface-sunken"
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <ul className="ml-3 border-l border-line pl-2">
                      {item.children.map((child) => (
                        <li key={child.href + child.label}>
                          <Link
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-chip px-3 py-1.5 text-sm text-muted hover:bg-surface-sunken hover:text-content"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
