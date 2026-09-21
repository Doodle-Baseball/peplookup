import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CompoundForm } from '@/components/admin/compound-form';
import { createCompoundAction } from '../actions';

export const metadata: Metadata = { title: 'Add compound | Admin', robots: { index: false, follow: false } };

export default function NewCompoundPage() {
  return (
    <>
      <AdminPageHeader title="Add compound" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <CompoundForm action={createCompoundAction} submitLabel="Save compound" />
      </div>
    </>
  );
}
