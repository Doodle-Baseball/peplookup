'use client';

import { useState } from 'react';

import { refreshAllVendorImagesAction } from '@/app/admin/(dashboard)/vendors/actions';

export function RefreshVendorImagesButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setMessage(null);

    const result = await refreshAllVendorImagesAction();
    setMessage(result.error ?? `Updated ${result.updated} supplier image${result.updated === 1 ? '' : 's'}.`);
    setPending(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong disabled:opacity-60"
      >
        {pending ? 'Refreshing…' : 'Import supplier images'}
      </button>
      {message ? (
        <span className={message.startsWith('Updated') ? 'text-sm text-ok' : 'text-sm text-danger'}>{message}</span>
      ) : null}
    </div>
  );
}
