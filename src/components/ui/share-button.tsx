'use client';

import { useState } from 'react';
import { ShareIcon, CheckIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

export function ShareButton({
  title,
  url,
  className,
}: {
  title: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User dismissed the native share sheet, nothing to recover from.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied, the button simply doesn't confirm.
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        aria-label={copied ? 'Link copied' : `Share ${title}`}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-chip border border-line bg-surface text-content transition-colors hover:border-brand hover:text-brand',
          className,
        )}
      >
        {copied ? <CheckIcon className="h-5 w-5 text-brand" /> : <ShareIcon className="h-5 w-5" />}
      </button>
      {copied ? (
        <span
          role="status"
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-chip bg-content px-2 py-1 text-xs font-bold text-surface shadow-lift"
        >
          Copied
        </span>
      ) : null}
    </span>
  );
}
