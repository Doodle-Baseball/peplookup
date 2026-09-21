'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteGuideAction } from '@/app/admin/(dashboard)/guides/actions';

export function GuideDeleteButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-1 text-xs font-bold text-danger transition-colors hover:text-danger/80"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-xs font-bold text-danger">Delete?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteGuideAction(slug);
            if (result.error) {
              setError(result.error);
              setConfirming(false);
              return;
            }
            router.refresh();
          })
        }
        className="rounded-chip bg-danger px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Deleting…' : 'Yes'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs font-bold text-muted hover:text-content"
      >
        No
      </button>
      {error ? <span className="text-xs font-semibold text-danger">{error}</span> : null}
      <span className="sr-only">{title}</span>
    </span>
  );
}
