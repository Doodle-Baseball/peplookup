import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { SeoDashboard } from '@/components/admin/seo/seo-dashboard';
import { getSeoDashboardData, type SeoDashboardData } from '@/lib/admin/seo';

export const metadata: Metadata = { title: 'SEO | Admin', robots: { index: false, follow: false } };

// Pages, slugs and overrides change with every save; never serve a build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function AdminSeoPage() {
  let data: SeoDashboardData | null = null;
  let loadError: string | null = null;
  try {
    data = await getSeoDashboardData();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'The SEO dashboard could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="SEO" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {data ? (
          <SeoDashboard entries={data.entries} redirects={data.redirects} setupError={data.setupError} />
        ) : (
          <p role="alert" className="rounded-card border border-danger/30 bg-danger/5 px-5 py-4 text-sm font-semibold text-danger">
            {loadError}
          </p>
        )}
      </div>
    </>
  );
}
