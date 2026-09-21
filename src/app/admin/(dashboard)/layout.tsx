import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo-mark';
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';
import { AdminNavLinks } from '@/components/admin/admin-nav-links';
import { ArrowLeftIcon } from '@/components/icons/icons';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface-raised sm:flex">
        <div className="flex items-center justify-center border-b border-line px-6 py-5">
          <LogoMark size={32} className="rounded-pill" />
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-1 px-3 py-4">
          <AdminNavLinks />
        </nav>

        <div className="border-t border-line p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-chip px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-brand hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            View marketplace
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Below `sm` the sidebar is hidden entirely, so this bar, logo plus
            the slide-in menu trigger, is the only way to reach admin nav. */}
        <div className="flex items-center justify-between border-b border-line bg-surface-raised px-4 py-3 sm:hidden">
          <span className="flex items-center gap-2 text-base font-black tracking-tight">
            <LogoMark size={26} className="rounded-pill" />
          </span>
          <AdminMobileNav />
        </div>

        {children}
      </div>
    </div>
  );
}
