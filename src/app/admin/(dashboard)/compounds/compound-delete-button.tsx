'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCompoundAction } from './actions';
import { TrashIcon } from '@/components/icons/icons';

export function CompoundDeleteButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCompoundAction(slug);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-label={`Delete ${name}`}
      className="rounded-chip p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-60"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
