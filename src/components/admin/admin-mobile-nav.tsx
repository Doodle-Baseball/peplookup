'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { site } from '@/config/site';
import { LogoMark } from '@/components/layout/logo-mark';
import { AdminNavLinks } from '@/components/admin/admin-nav-links';
import { ArrowLeftIcon, CloseIcon, MenuIcon } from '@/components/icons/icons';

/**
 * The admin sidebar is desktop-only (`sm:flex`), below that breakpoint this
 * is the only way to reach any admin section, so it mirrors the site's own
 * MobileNav pattern (slide-in panel, same overlay/close behavior) rather
 * than leaving small screens with no navigation at all.
 */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

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
        aria-label="Open admin menu"
        aria-expanded={open}
        className="rounded-chip p-2 text-muted transition-colors hover:bg-brand hover:text-white sm:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <nav
            aria-label="Admin"
            className="absolute left-0 top-0 flex h-full w-[min(18rem,85vw)] flex-col overflow-y-auto bg-surface-raised shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 text-lg font-black tracking-tight">
                <LogoMark size={28} className="rounded-pill" />
                <span>
                  <span className="text-content">{site.nameParts.lead}</span>
                  <span className="text-brand">{site.nameParts.tail}</span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
                className="rounded-chip p-2 text-muted hover:bg-surface-sunken"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-1 p-3">
              <AdminNavLinks onNavigate={() => setOpen(false)} />
            </div>

            <div className="border-t border-line p-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-chip px-3 py-2.5 text-sm font-semibold text-content transition-colors hover:bg-brand hover:text-white"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                View marketplace
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
