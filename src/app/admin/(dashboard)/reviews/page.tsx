import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ReviewManager } from '@/components/admin/review-manager';
import { listVendorsWithReviewCounts, type VendorReviewSummary } from '@/lib/admin/reviews';

export const metadata: Metadata = { title: 'Reviews | Admin', robots: { index: false, follow: false } };

// Review counts change on every save; never serve a build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  let vendors: VendorReviewSummary[] = [];
  let loadError: string | null = null;
  try {
    vendors = await listVendorsWithReviewCounts();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Vendors could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Reviews" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {loadError ? (
          <p role="alert" className="rounded-card border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
            {loadError}
          </p>
        ) : (
          <ReviewManager vendors={vendors} />
        )}
      </div>
    </>
  );
}
