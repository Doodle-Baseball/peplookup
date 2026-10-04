'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV } from '@/config/admin-nav';

function isActive(pathname: string, href: string): boolean {
  return href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Shared between the desktop sidebar and the mobile slide-in menu so both
 * always agree on which section is current, same purple treatment for
 * hover and the active/selected state, per the site's single-shade rule.
 */
export function AdminNavLinks({
  onNavigate,
  newVendorRequests = 0,
}: {
  onNavigate?: () => void;
  /** Unseen vendor-listing requests, shown as a badge on that section's link. */
  newVendorRequests?: number;
}) {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-chip px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'bg-brand text-white' : 'text-muted hover:bg-brand hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
            {item.href === '/admin/vendor-listing' && newVendorRequests > 0 ? (
              <span
                role="status"
                aria-label={`${newVendorRequests} new vendor listing ${newVendorRequests === 1 ? 'request' : 'requests'}`}
                className="relative ml-auto flex h-5 min-w-5 items-center justify-center"
              >
                <span aria-hidden="true" className="badge-ping absolute inset-0 rounded-pill bg-danger" />
                <span className="relative flex h-5 min-w-5 items-center justify-center rounded-pill bg-danger px-1.5 text-micro font-black text-white">
                  {newVendorRequests > 99 ? '99+' : newVendorRequests}
                </span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
