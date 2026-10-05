import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { VendorForm } from '@/components/admin/vendor-form';
import { getProducts } from '@/lib/repository';
import { createVendorAction } from '../actions';

export const metadata: Metadata = { title: 'Add supplier | Admin', robots: { index: false, follow: false } };

export default async function NewVendorPage() {
  const products = await getProducts().catch(() => []);

  return (
    <>
      <AdminPageHeader title="Add supplier" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <VendorForm
          action={createVendorAction}
          submitLabel="Add supplier"
          products={products.map((product) => ({ slug: product.slug, name: product.name }))}
        />
      </div>
    </>
  );
}
