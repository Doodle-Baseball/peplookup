'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { InfoIcon, CloseIcon } from '@/components/icons/icons';

/**
 * Full-screen info modal shared by product and supplier cards. Rendered
 * through a portal into document.body, the card it lives in has
 * `will-change: transform` for its 3D hover effect, which creates a new
 * containing block for `position: fixed` descendants and would otherwise
 * scope "full screen" to the card's own box instead of the viewport.
 */
export function InfoModal({
  triggerLabel,
  title,
  children,
}: {
  triggerLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={triggerLabel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip text-muted transition-colors hover:text-brand"
      >
        <InfoIcon className="h-5 w-5" />
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="relative w-full max-w-md rounded-card bg-surface-raised p-6 shadow-lift"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black text-content">{title}</h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="shrink-0 rounded-chip p-1.5 text-muted transition-colors hover:bg-surface-sunken hover:text-content"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
                {children}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
