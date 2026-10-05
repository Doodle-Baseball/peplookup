'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { CheckIcon, CopyIcon } from '@/components/icons/icons';

/**
 * The coupon page's main call to action: the code reads large on the left,
 * "Copy code" sits on the right behind a divider. Leaf client component so the
 * rest of the page stays on the server.
 */
export function CouponCopyBlock({ code, className }: { code: string; className?: string }) {
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
      // The code stays on screen as text, so it can still be selected by hand.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Copied coupon code ${code}` : `Copy coupon code ${code}`}
      className={cn(
        'group/copy flex w-full items-stretch overflow-hidden rounded-card border border-dashed text-left transition-all duration-200',
        'active:scale-[0.99] motion-reduce:transition-none',
        copied ? 'border-accent bg-accent/10' : 'border-accent bg-surface-raised hover:bg-accent/10',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate px-4 py-3 font-mono text-lg font-black tracking-wide text-accent-strong">
        {code}
      </span>
      <span
        aria-live="polite"
        className={cn(
          'flex shrink-0 items-center gap-1.5 border-l border-dashed px-4 text-xs font-bold transition-colors sm:px-5',
          copied ? 'border-accent text-accent-strong' : 'border-accent/50 text-accent-strong group-hover/copy:bg-accent group-hover/copy:text-white',
        )}
      >
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5 motion-safe:animate-pulse" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5 transition-transform group-hover/copy:scale-110" />
        )}
        {copied ? 'Copied!' : 'Copy code'}
      </span>
    </button>
  );
}
