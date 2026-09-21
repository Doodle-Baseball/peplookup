import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVendor } from '@/lib/admin/vendors';
import { listOffersForVendor } from '@/lib/admin/offers';
import { getProducts, getSupplierReviews } from '@/lib/repository';
import { AdminPageHeader } from '@/components/admin/page-header';
import { VendorForm } from '@/components/admin/vendor-form';
import { updateVendorAction } from '../../actions';

export const metadata: Metadata = { title: 'Edit vendor | Admin', robots: { index: false, follow: false } };

export default async function EditVendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { slug } = await params;
  const { step } = await searchParams;
  const initialStep = step ? Number(step) : undefined;
  const [vendor, products, vendorOffers] = await Promise.all([
    getVendor(slug),
    getProducts().catch(() => []),
    // Only this vendor's rows, read straight from the table (not the public
    // 5-minute cache) so an edit or delete made in the admin shows here
    // immediately. Null renders as a "couldn't load" notice in the form rather
    // than an empty list.
    listOffersForVendor(slug).catch(() => null),
  ]);
  if (!vendor) notFound();

  const reviews = await getSupplierReviews(vendor).catch(() => []);

  const boundAction = updateVendorAction.bind(null, slug);

  return (
    <>
      <AdminPageHeader title={`Edit ${vendor.name}`} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <VendorForm
          action={boundAction}
          vendor={vendor}
          reviews={[...reviews]}
          submitLabel="Save changes"
          products={products.map((product) => ({ slug: product.slug, name: product.name }))}
          existingProducts={vendorOffers}
          initialStep={initialStep}
        />
      </div>
    </>
  );
}
