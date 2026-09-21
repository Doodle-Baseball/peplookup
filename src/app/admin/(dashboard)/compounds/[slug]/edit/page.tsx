import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompound } from '@/lib/admin/compounds';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CompoundForm } from '@/components/admin/compound-form';
import { updateCompoundAction } from '../../actions';

export const metadata: Metadata = { title: 'Edit compound | Admin', robots: { index: false, follow: false } };

export default async function EditCompoundPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const compound = await getCompound(slug);
  if (!compound) notFound();

  const boundAction = updateCompoundAction.bind(null, slug);

  return (
    <>
      <AdminPageHeader title={`Edit ${compound.name}`} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <CompoundForm action={boundAction} compound={compound} submitLabel="Save changes" />
      </div>
    </>
  );
}
