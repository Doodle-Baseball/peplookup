import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CouponPagesManager } from '@/components/admin/coupon-pages-manager';
import { getCouponPagesData, type CouponPagesData } from '@/lib/admin/coupon-pages';

export const metadata: Metadata = { title: 'Coupon Pages | Admin', robots: { index: false, follow: false } };

// SEO, indexing and page text change with every save; never serve a build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function AdminCouponPagesPage() {
  let data: CouponPagesData | null = null;
  let loadError: string | null = null;
  try {
    data = await getCouponPagesData();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Coupon pages could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Coupon Pages" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {data ? (
          <CouponPagesManager
            pages={data.pages}
            seoSetupError={data.seoSetupError}
            contentSetupError={data.contentSetupError}
          />
        ) : (
          <p role="alert" className="rounded-card border border-danger/30 bg-danger/5 px-5 py-4 text-sm font-semibold text-danger">
            {loadError}
          </p>
        )}
      </div>
    </>
  );
}
