import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGuideForEdit, guidePath } from '@/lib/admin/guides';
import { listStoredFaqsByPath } from '@/lib/admin/page-faqs';
import type { FaqItem } from '@/data/default-page-faqs';
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
    // form then starts with an empty FAQ section and leaves the saved set
    // alone on save (see faqsLoaded in updateGuideAction).
    listStoredFaqsByPath().catch((): Map<string, FaqItem[]> | null => null),
  ]);
  if (!guide) notFound();

  const boundAction = updateGuideAction.bind(null, slug);
  const initialFaqs = storedFaqsByPath?.get(guidePath(slug)) ?? [];

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
        {storedFaqsByPath === null ? (
          <p role="alert" className="mb-6 rounded-card border border-danger/30 bg-danger/10 p-4 text-sm text-content">
            The saved FAQs for this guide could not be loaded, so the FAQ section starts empty. Saving leaves the
            stored FAQs unchanged.
          </p>
        ) : null}
        <GuideForm
          action={boundAction}
          guide={guide}
          submitLabel="Save changes"
          initialFaqs={initialFaqs}
          faqsLoaded={storedFaqsByPath !== null}
        />
      </div>
    </>
  );
}
