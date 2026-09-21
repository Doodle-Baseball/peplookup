import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { GuideForm } from '@/components/admin/guide-form';
import { createGuideAction } from '../actions';

export const metadata: Metadata = { title: 'New guide | Admin', robots: { index: false, follow: false } };

export default function NewGuidePage() {
  return (
    <>
      <AdminPageHeader title="New guide" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <GuideForm action={createGuideAction} submitLabel="Create guide" />
      </div>
    </>
  );
}
