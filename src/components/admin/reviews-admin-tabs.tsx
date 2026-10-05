'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { DocumentIcon, StarIcon } from '@/components/icons/icons';

const TABS = [
  { href: '/admin/reviews', label: 'Edit review page', icon: DocumentIcon },
  { href: '/admin/reviews/add', label: 'Add review', icon: StarIcon },
] as const;

/**
 * The two options of the Reviews section: edit a vendor's reviews page (text,
 * SEO and indexing), or add reviews to a vendor. The first is the default.
 */
export function ReviewsAdminTabs() {
  const pathname = usePathname();
  // "Add review" owns /admin/reviews/add; everything else under /admin/reviews belongs to the first option.
  const activeHref = pathname === '/admin/reviews/add' ? '/admin/reviews/add' : '/admin/reviews';

  return (
    <nav aria-label="Reviews options" className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-line bg-surface-raised p-1 shadow-sm">
      {TABS.map((tab) => {
        const active = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold transition-colors',
              active ? 'bg-brand text-surface shadow-card' : 'text-muted hover:bg-surface-sunken hover:text-content',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
