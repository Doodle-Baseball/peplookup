import type { Metadata } from 'next';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getAllOffers, getSuppliers } from '@/lib/repository';
import { CouponBrowser, type CouponVendor } from '@/components/coupons/coupon-browser';
import { ShieldCheckIcon, TagIcon } from '@/components/icons/icons';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { PageSeo } from '@/components/seo/page-seo';
import { compareCouponVendors, DEFAULT_COUPON_SORT } from '@/components/coupons/coupon-sort';
import { couponPagePath } from '@/lib/coupon-pages';
import { ExtensionBanner } from '@/components/extension/extension-banner';

const PAGE = staticSeoPage('/coupons');

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
  const [seo, suppliers, offers] = await Promise.all([
    getSeoOverride(PAGE.path),
    getSuppliers(),
    getAllOffers(),
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
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
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
          <CouponBrowser vendors={vendors} totalSupplierCount={suppliers.length} />
        )}

        {/* Same panel, heading and callout treatment as the supplier guide on /suppliers:
            heading on the left from `lg` up, stacked above the text on smaller screens. */}
        <section className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-coupon-tint text-coupon-ink">
                <TagIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-[clamp(1.75rem,7vw,3rem)] font-black leading-[1.05] text-content">
                Research Peptide Coupon Codes and <span className="italic text-accent">Discount Codes</span>
              </h2>
            </div>
            <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8 lg:col-span-2">
              Active peptide discount codes from verified suppliers, collected and tracked by {site.name}.
              Every code is checked against the supplier&rsquo;s own checkout, and prices on the site already
              reflect the discount where a sitewide code applies. Most codes work sitewide, so they apply to
              popular compounds like BPC-157, TB-500, Retatrutide and Semaglutide. Tap any code to copy it,
              then paste it at the supplier&rsquo;s checkout.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-[clamp(1.75rem,7vw,3rem)] font-black leading-[1.05] text-content">
                How We Verify Peptide <span className="italic text-accent">Coupon Codes</span>
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">
                {site.name} monitors supplier sites for published discount codes and verifies each one at
                checkout before listing it here. When a supplier runs a sitewide coupon, every listing from
                that supplier shows the discounted price alongside the original, so price per mg comparisons
                reflect what you would actually pay.
              </p>
              <div className="flex items-start gap-3 rounded-card border border-accent/25 bg-accent-tint p-4 sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-surface-raised text-accent-strong shadow-card">
                  <TagIcon className="h-5 w-5" />
                </span>
                <p className="min-w-0 text-sm leading-7 text-content sm:text-base">
                  Codes are set by the suppliers, not by {site.name}. They can expire, carry conditions such
                  as minimum orders or first-time-customer restrictions, or be withdrawn at any time. If a
                  peptide coupon code stops working, let us know through the contact page and we will recheck it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <PageFaqSection path="/coupons" className="mt-14" />
      </div>
    </div>
  );
}
