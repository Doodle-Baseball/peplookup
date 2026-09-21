'use client';

import { useState, useTransition } from 'react';
import { toggleVendorFeaturedAction } from './actions';
import { cn } from '@/lib/cn';
import { StarIcon } from '@/components/icons/icons';

export function VendorFeaturedToggle({ slug, isFeatured }: { slug: string; isFeatured: boolean }) {
  const [featured, setFeatured] = useState(isFeatured);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !featured;
    setFeatured(next); // optimistic
    setError(null);
    startTransition(async () => {
      const result = await toggleVendorFeaturedAction(slug, next);
      if (result.error) {
        // Revert, and say why: silently snapping back looks like a dead button.
        setFeatured(!next);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={featured}
        aria-label={featured ? 'Unmark as featured vendor' : 'Mark as featured vendor'}
        onClick={toggle}
        disabled={pending}
        className={cn(
          'inline-flex items-center justify-center rounded-chip p-1.5 transition-colors disabled:opacity-60',
          // `coupon` is the actual yellow; `coupon-ink` is a dark brown meant for
          // text on a gold background, not for the star itself.
          featured ? 'text-coupon hover:bg-coupon-tint' : 'text-line hover:bg-surface-sunken hover:text-coupon',
        )}
      >
        <StarIcon className="h-5 w-5" />
      </button>
      {error ? (
        <p role="alert" className="max-w-[16rem] text-micro font-semibold leading-snug text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
