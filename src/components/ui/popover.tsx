'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/icons/icons';

/**
 * Full-screen centered modal, same chrome as the product-card info popup
 * (portal into document.body, dark blurred backdrop, centered card). Named
 * Popover for its trigger-driven API (a custom `trigger` element rather than
 * a fixed icon button), not for anchored/inline positioning.
 */
export function Popover({
  title,
  trigger,
  triggerClassName,
  children,
}: {
  title: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
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
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {trigger}
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
                <div className="mt-3">{children}</div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
