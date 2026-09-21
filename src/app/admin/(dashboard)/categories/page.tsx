import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Categories | Admin', robots: { index: false, follow: false } };

export default function AdminCategoriesPage() {
  return (
    <ComingSoonPage
      title="Categories"
      description="Managing compound categories (Healing, GLP-1, Longevity, Growth, Metabolic, …) from here is planned next."
    />
  );
}
