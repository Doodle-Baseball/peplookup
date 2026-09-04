'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { CheckIcon, CopyIcon } from '@/components/icons/icons';

/**
 * Leaf client component: the only thing on a supplier card that needs state.
 * Keeping it here means the card itself stays a Server Component.
 */
export function CopyCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard is unavailable over plain HTTP and in some embedded views.
      // The code stays visible as text, so the user can still select it.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Copied code ${code}` : `Copy code ${code}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip border border-promo/40 bg-surface',
        'px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-promo',
        'transition hover:bg-promo-soft',
        className,
      )}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      <span>{code}</span>
      {/* Announced to screen readers without shifting the visual layout. */}
      <span aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}
