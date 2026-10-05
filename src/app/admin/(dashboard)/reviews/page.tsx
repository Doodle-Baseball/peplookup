import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ReviewPagesManager } from '@/components/admin/review-pages-manager';
import { ReviewsAdminTabs } from '@/components/admin/reviews-admin-tabs';
import { getReviewPagesData, type ReviewPagesData } from '@/lib/admin/review-pages';

export const metadata: Metadata = { title: 'Reviews | Admin', robots: { index: false, follow: false } };

// SEO, indexing and page text change with every save; never serve a build-time snapshot.
export const dynamic = 'force-dynamic';

/** First option of the Reviews section: every vendor's public reviews page, with its text, SEO and indexing. */
export default async function AdminReviewsPage() {
  let data: ReviewPagesData | null = null;
  let loadError: string | null = null;
  try {
    data = await getReviewPagesData();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Review pages could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Reviews" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <ReviewsAdminTabs />
        {data ? (
          <ReviewPagesManager
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
