import type { Metadata } from 'next';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { CouponBrowser, type CouponCompound, type CouponVendor } from '@/components/coupons/coupon-browser';
import { TagIcon } from '@/components/icons/icons';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { PageSeo } from '@/components/seo/page-seo';
import { compareCouponVendors, DEFAULT_COUPON_SORT } from '@/components/coupons/coupon-sort';
import { couponPagePath } from '@/lib/coupon-pages';
import { ExtensionBanner } from '@/components/extension/extension-banner';

const PAGE = staticSeoPage('/coupons');

/** "Find a coupon by compound" chips: the compounds stocked by the most suppliers with a code. */
const COMPOUND_CHIP_COUNT = 6;

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

// Codes are edited in the admin, so this must not be a build-time snapshot.
// Rendering per request was the costly way to get that: the page reads the
// whole offer catalogue, and every visitor and crawler paid for a fresh scan.
// The vendor actions already revalidatePath('/coupons') on every edit, so a
// cached render is corrected the moment a code changes; the window only
// applies to edits made outside those actions.
export const revalidate = 1800;

export default async function CouponsPage() {
  const [seo, suppliers, offers, products] = await Promise.all([
    getSeoOverride(PAGE.path),
    getSuppliers(),
    getAllOffers(),
    getProducts(),
  ]);

  // One pass over the catalogue rather than a count query per vendor card.
  const listingCounts = new Map<string, number>();
  for (const offer of offers) {
    listingCounts.set(offer.supplierSlug, (listingCounts.get(offer.supplierSlug) ?? 0) + 1);
  }

  const vendors: CouponVendor[] = suppliers
    .filter((supplier) => supplier.coupon !== null)
    .map((supplier) => ({
      ...supplier,
      coupon: supplier.coupon!,
      listingCount: listingCounts.get(supplier.slug) ?? 0,
    }));
  // Which suppliers with a code have each compound in stock, for the compound chips.
  const couponSlugs = new Set(vendors.map((vendor) => vendor.slug));
  const stockistsByProduct = new Map<string, Set<string>>();
  for (const offer of offers) {
    if (!offer.inStock || !couponSlugs.has(offer.supplierSlug)) continue;
    const stockists = stockistsByProduct.get(offer.productSlug) ?? new Set<string>();
    stockists.add(offer.supplierSlug);
    stockistsByProduct.set(offer.productSlug, stockists);
  }
  const compounds: CouponCompound[] = products
    .map((product) => ({ slug: product.slug, name: product.name, supplierSlugs: [...(stockistsByProduct.get(product.slug) ?? [])] }))
    .filter((compound) => compound.supplierSlugs.length > 0)
    .sort((a, b) => b.supplierSlugs.length - a.supplierSlugs.length || a.name.localeCompare(b.name))
    .slice(0, COMPOUND_CHIP_COUNT);

  const couponItems = [...vendors].sort(compareCouponVendors(DEFAULT_COUPON_SORT)).map((vendor) => ({
    name: vendor.name,
    url: couponPagePath(vendor.slug),
  }));

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <PageSeo seo={PAGE} itemList={couponItems} />
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-coupon-tint px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-coupon-ink">
          <TagIcon className="h-3.5 w-3.5" />
          Coupons
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? seo.h1 : <>Supplier <span className="italic text-brand">coupon codes.</span></>}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Every active peptide coupon code we track, with the supplier it belongs to, its discount and its rating.
          Tap a code to copy it, then apply it at checkout on the supplier&rsquo;s own site. {site.name} never
          handles the order.
        </p>

        <ExtensionBanner />

        {vendors.length === 0 ? (
          <p className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No coupon codes are active right now. Check back soon.
          </p>
        ) : (
          <CouponBrowser vendors={vendors} compounds={compounds} totalSupplierCount={suppliers.length} />
        )}

        <div className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <p className="eyebrow">Research Peptide Coupon Codes and Discount Codes</p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Active peptide discount codes from verified suppliers, collected and tracked by {site.name}.
            Every code is checked against the supplier&rsquo;s own checkout, and prices on the site already
            reflect the discount where a sitewide code applies. Most codes work sitewide, so they apply to
            popular compounds like BPC-157, TB-500, Retatrutide and Semaglutide. Tap any code to copy it,
            then paste it at the supplier&rsquo;s checkout.
          </p>
        </div>

        <section className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <h2 className="text-lg font-black text-content sm:text-xl">
            How We Verify <span className="text-brand">Peptide Coupon Codes</span>
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              {site.name} monitors supplier sites for published discount codes and verifies each one at
              checkout before listing it here. When a supplier runs a sitewide coupon, every listing from
              that supplier shows the discounted price alongside the original, so price per mg comparisons
              reflect what you would actually pay.
            </p>
            <p>
              Codes are set by the suppliers, not by {site.name}. They can expire, carry conditions such
              as minimum orders or first-time-customer restrictions, or be withdrawn at any time. If a
              peptide coupon code stops working, let us know through the contact page and we will recheck it.
            </p>
          </div>
        </section>

        <PageFaqSection path="/coupons" className="mt-14" />
      </div>
    </div>
  );
}
