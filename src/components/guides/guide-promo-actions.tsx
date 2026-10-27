'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon, ExternalIcon } from '@/components/icons/icons';

/**
 * The coupon card's two controls: the dashed code box (copies the code) and
 * "Copy Code & Shop", a real sponsored link that also copies the code on the
 * way out, so it still opens the shop with scripts off or the clipboard blocked.
 */
export function GuidePromoActions({
  code,
  shopUrl,
  supplierName,
}: {
  code: string;
  shopUrl: string;
  supplierName: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      // Clipboard is unavailable over plain HTTP and in some embedded views; the code stays visible to type in.
      .catch(() => setCopied(false));
  };

  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `Copied code ${code}` : `Copy code ${code}`}
        className="flex w-full items-center justify-center gap-2 rounded-chip border-2 border-dashed border-white/25 bg-white/5 px-4 py-3 font-mono text-base font-bold tracking-widest text-white transition-colors hover:border-white/50 hover:bg-white/10"
      >
        {code}
        {copied ? <CheckIcon className="h-4 w-4 text-ok" /> : <CopyIcon className="h-4 w-4 text-white/70" />}
      </button>
      <a
        href={shopUrl}
        target="_blank"
        rel="sponsored nofollow noopener"
        onClick={copy}
        // A green keycap on the dark card: the darker bottom edge compresses on press, like .btn-3d elsewhere.
        className="flex w-full items-center justify-center gap-2 rounded-chip border-b-4 border-accent-strong bg-accent px-4 py-3 text-sm font-bold text-white shadow-lift transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:border-b-2"
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        {copied ? 'Code copied, opening shop' : 'Copy Code & Shop'}
        <ExternalIcon className="h-3.5 w-3.5" />
        <span className="sr-only">at {supplierName} (affiliate link, opens in a new tab)</span>
      </a>
    </div>
  );
}
