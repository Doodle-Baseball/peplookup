'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Leaves a shared layout section out on the listed paths. Layouts can't read
 * the path on the server and don't re-render on client navigation, so the
 * choice is made here; the server render already uses the right path.
 */
export function HideOnPaths({ paths, children }: { paths: readonly string[]; children: ReactNode }) {
  const pathname = usePathname();
  return paths.includes(pathname) ? null : children;
}
