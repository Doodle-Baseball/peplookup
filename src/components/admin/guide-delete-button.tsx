'use client';

import { useRouter } from 'next/navigation';
import { useId, useRef, useState, useTransition } from 'react';
import { deleteGuideAction } from '@/app/admin/(dashboard)/guides/actions';

export function GuideDeleteButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = () =>
    startTransition(async () => {
      const result = await deleteGuideAction(slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          dialogRef.current?.showModal();
        }}
        aria-label={`Delete ${title}`}
        className="rounded-chip px-2.5 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger/10"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        className="w-full max-w-md rounded-card border border-line bg-surface-raised p-6 text-left text-content shadow-card backdrop:bg-content/50"
      >
        <h2 id={headingId} className="text-lg font-black">
          Delete this guide permanently?
        </h2>
        <p className="mt-2 text-sm text-muted">
          &ldquo;{title}&rdquo; and the FAQs saved for it will be removed. This cannot be undone.
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-sm font-semibold text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={confirmDelete}
            className="rounded-chip bg-danger px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? 'Deleting…' : 'Delete guide'}
          </button>
        </div>
      </dialog>
    </>
  );
}
