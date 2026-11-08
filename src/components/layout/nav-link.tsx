'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { keyedPath } from '@/lib/supplier-path';

/** Highlights the current section in the primary nav, same purple treatment as its hover state. */
export function NavLink({
  href,
  className,
  activeClassName,
  children,
}: {
  href: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}) {
  // keyedPath: a supplier profile that has moved to /supplier/<slug> still belongs to the Suppliers section.
  const pathname = keyedPath(usePathname());
  const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={cn(className, active && activeClassName)}>
      {children}
    </Link>
  );
}
