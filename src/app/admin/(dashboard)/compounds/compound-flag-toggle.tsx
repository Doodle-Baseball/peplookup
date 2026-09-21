'use client';

import { useState, useTransition } from 'react';
import { toggleCompoundFlagAction } from './actions';
import { cn } from '@/lib/cn';

export function CompoundFlagToggle({ slug, isCompound }: { slug: string; isCompound: boolean }) {
  const [checked, setChecked] = useState(isCompound);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      const result = await toggleCompoundFlagAction(slug, next);
      if (result.error) setChecked(!next);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Mark as not a single compound' : 'Mark as a single compound'}
      onClick={toggle}
      disabled={pending}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-pill transition-colors disabled:opacity-60',
        checked ? 'bg-brand' : 'bg-black',
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-pill bg-white shadow-md transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
