'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Swaps a shared layout section for a page-specific version on the listed paths.
 * Layouts don't re-render on client navigation and can't read the path on the
 * server, so the choice has to happen here. Both versions are server-rendered;
 * this only picks which one shows.
 */
export function RouteOverride({
  paths,
  override,
  children,
}: {
  paths: readonly string[];
  /** Rendered instead of `children` on a matching path; `null` hides the section. */
  override: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return paths.includes(pathname) ? override : children;
}
