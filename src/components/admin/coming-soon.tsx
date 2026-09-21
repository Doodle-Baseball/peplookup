import { AdminPageHeader } from '@/components/admin/page-header';

export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <AdminPageHeader title={title} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="rounded-card border border-dashed border-line bg-surface-raised p-12 text-center">
          <p className="text-lg font-bold text-content">{title} management is coming soon</p>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
      </div>
    </>
  );
}
