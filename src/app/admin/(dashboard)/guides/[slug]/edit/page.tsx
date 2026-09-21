import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGuideForEdit } from '@/lib/admin/guides';
import { listStoredFaqsByPath } from '@/lib/admin/page-faqs';
import { AdminPageHeader } from '@/components/admin/page-header';
import { GuideForm } from '@/components/admin/guide-form';
import { updateGuideAction } from '../../actions';

export const metadata: Metadata = { title: 'Edit guide | Admin', robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

export default async function EditGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [guide, storedFaqsByPath] = await Promise.all([
    getGuideForEdit(slug),
    // An unreadable FAQ table shouldn't block loading the guide itself; the
    // form just starts with an empty FAQ section (still safe, an untouched,
    // empty section is never saved, see createGuideAction/updateGuideAction).
    listStoredFaqsByPath().catch(() => new Map()),
  ]);
  if (!guide) notFound();

  const boundAction = updateGuideAction.bind(null, slug);
  const initialFaqs = storedFaqsByPath.get(`/guides/${slug}`) ?? [];

  return (
    <>
      <AdminPageHeader title={`Edit ${guide.title}`} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {guide.source === 'built-in' ? (
          <p className="mb-6 rounded-card border border-info/30 bg-info/10 p-4 text-sm text-content">
            This guide ships with the site. Saving writes a database copy that takes over from the built-in
            one. The original stays in the repository as a fallback.
          </p>
        ) : null}
        <GuideForm action={boundAction} guide={guide} submitLabel="Save changes" initialFaqs={initialFaqs} />
      </div>
    </>
  );
}
