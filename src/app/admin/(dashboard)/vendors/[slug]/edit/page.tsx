import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getStoredCoupon, getVendor } from '@/lib/admin/vendors';
import { couponCodeFromLinks } from '@/lib/coupon-detect';
import { getRedirectTarget } from '@/lib/seo';
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
  if (!vendor) {
    // A slug renamed in /admin/seo leaves bookmarks and open tabs on the old
    // edit URL; follow the same redirect the public page uses so they land on
    // the same vendor instead of a 404.
    const renamedTo = await getRedirectTarget(`/suppliers/${slug}`);
    if (renamedTo?.startsWith('/suppliers/')) {
      const query = step ? `?step=${encodeURIComponent(step)}` : '';
      redirect(`/admin/vendors/${renamedTo.slice('/suppliers/'.length)}/edit${query}`);
    }
    notFound();
  }

  const [reviews, storedCoupon] = await Promise.all([
    getSupplierReviews(vendor).catch(() => []),
    getStoredCoupon(vendor.slug),
  ]);
  // Only offered when nothing is saved: a saved code always wins.
  const detectedCouponCode = storedCoupon.code
    ? null
    : couponCodeFromLinks([vendor.affiliateUrl, vendor.policyUrls.shipping, vendor.policyUrls.returns]);

  const boundAction = updateVendorAction.bind(null, slug);

  return (
    <>
      <AdminPageHeader title={`Edit ${vendor.name}`} />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <VendorForm
          action={boundAction}
          vendor={vendor}
          storedCoupon={storedCoupon}
          detectedCouponCode={detectedCouponCode}
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
