'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { duplicateGuideAction } from '@/app/admin/(dashboard)/guides/actions';

export function GuideDuplicateButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        aria-label={`Duplicate ${title} as a draft`}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await duplicateGuideAction(slug);
            if (result.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
        className="rounded-chip border border-line bg-surface px-3 py-2 text-xs font-bold text-content transition-colors hover:border-brand hover:text-brand-strong disabled:opacity-60"
      >
        {pending ? 'Copying…' : 'Duplicate'}
      </button>
      {error ? (
        <span role="alert" className="mt-1 text-xs font-semibold text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
