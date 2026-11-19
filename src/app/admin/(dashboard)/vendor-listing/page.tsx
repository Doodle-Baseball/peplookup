import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { VendorListingBoard } from '@/components/admin/vendor-listing-board';
import { listRequests, type VendorListingRequest } from '@/lib/vendor-listing/requests';
import { signedScreenshotUrls } from '@/lib/vendor-listing/screenshots';

export const metadata: Metadata = { title: 'Supplier Listing | Admin', robots: { index: false, follow: false } };

// New applications arrive and statuses change outside any page render.
export const dynamic = 'force-dynamic';

export default async function AdminVendorListingPage() {
  let requests: VendorListingRequest[] = [];
  let screenshotUrls: Record<string, string> = {};
  let loadError: string | null = null;
  try {
    requests = await listRequests();
    const byPath = await signedScreenshotUrls(
      requests.flatMap((request) => (request.paymentScreenshotPath ? [request.paymentScreenshotPath] : [])),
    );
    screenshotUrls = Object.fromEntries(
      requests.flatMap((request) => {
        const url = request.paymentScreenshotPath ? byPath[request.paymentScreenshotPath] : undefined;
        return url ? [[request.requestId, url]] : [];
      }),
    );
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Requests could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Supplier Listing" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {loadError ? (
          <p role="alert" className="rounded-card border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
            {loadError}
          </p>
        ) : (
          <VendorListingBoard requests={requests} screenshotUrls={screenshotUrls} />
        )}
      </div>
    </>
  );
}
