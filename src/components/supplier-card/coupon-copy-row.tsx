'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, TagIcon } from '@/components/icons/icons';

/**
 * The whole coupon row is the copy control, not just the code chip, so
 * there's more room to hit on a supplier card, with a clear "Copied"
 * confirmation instead of a silent clipboard write.
 */
export function CouponCopyRow({ percentOff, code }: { percentOff: number; code: string }) {
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
      aria-label={copied ? `Copied coupon code ${code}` : `Copy coupon code ${code}`}
      className="flex w-full items-center gap-2.5 rounded-chip border border-coupon/40 bg-coupon-tint px-3 py-2.5 text-left transition-colors hover:border-coupon hover:bg-coupon-soft"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 shrink-0 text-coupon-ink" />
      ) : (
        <TagIcon className="h-4 w-4 shrink-0 text-coupon-ink" />
      )}
      <p className="min-w-0 flex-1 truncate text-xs font-bold uppercase text-coupon-ink" aria-live="polite">
        {copied ? 'Copied!' : `${percentOff}% off with coupon`}
      </p>
      <span className="shrink-0 rounded-chip border border-coupon/50 bg-surface px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-coupon-ink">
        {code}
      </span>
    </button>
  );
}
