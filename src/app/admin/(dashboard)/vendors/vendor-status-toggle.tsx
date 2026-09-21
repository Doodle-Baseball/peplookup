'use client';

import { useState, useTransition } from 'react';
import { toggleVendorStatusAction } from './actions';
import { cn } from '@/lib/cn';

export function VendorStatusToggle({ slug, isActive }: { slug: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    setActive(next); // optimistic
    startTransition(async () => {
      const result = await toggleVendorStatusAction(slug, next);
      if (result.error) setActive(!next); // revert on failure
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Deactivate vendor' : 'Activate vendor'}
      onClick={toggle}
      disabled={pending}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-pill transition-colors disabled:opacity-60',
        active ? 'bg-brand' : 'bg-black',
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-pill bg-white shadow-md transition-transform',
          active ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
