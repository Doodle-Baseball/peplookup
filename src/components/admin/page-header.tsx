import { LogoutButton } from '@/components/admin/logout-button';

export function AdminPageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-brand-tint px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
      <div className="min-w-0 flex-1">
        <p className="text-micro font-bold uppercase tracking-wide text-faint">Dashboard</p>
        <h1 className="truncate text-xl font-black text-content sm:text-2xl">{title}</h1>
      </div>
      <LogoutButton />
    </header>
  );
}
