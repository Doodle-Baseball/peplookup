'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MAX_REFRESHES = 12;

/**
 * Re-renders the server page every few seconds while a payment is still being
 * confirmed, then stops, so the page flips to "paid" without a manual reload
 * but never polls forever.
 */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      router.refresh();
      if (count >= MAX_REFRESHES) window.clearInterval(timer);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}
