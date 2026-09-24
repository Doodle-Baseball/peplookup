import type { Metadata } from 'next';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getAllOffers, getSuppliers } from '@/lib/repository';
import { CouponBrowser, type CouponVendor } from '@/components/coupons/coupon-browser';
import { TagIcon } from '@/components/icons/icons';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/coupons');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

// Codes are edited in the admin; never serve a build-time snapshot of them.
export const dynamic = 'force-dynamic';

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

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <div className="mb-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <p className="eyebrow">Research Peptide Coupon Codes</p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Active discount codes from verified peptide suppliers, collected and tracked by {site.name}.
            Every code is checked against the vendor&rsquo;s own checkout, and prices on the site already
            reflect the discount where a sitewide code applies. Tap any code below to copy it, then
            paste it at the vendor&rsquo;s checkout to apply.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-pill bg-coupon-tint px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-coupon-ink">
          <TagIcon className="h-3.5 w-3.5" />
          Coupons
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? seo.h1 : <>Vendor <span className="italic text-brand">coupon codes.</span></>}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Every active discount code we track, with the vendor it belongs to. Tap a code to copy it, then
          apply it at checkout on the vendor&rsquo;s own site. {site.name} never handles the order.
        </p>

        {vendors.length === 0 ? (
          <p className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No coupon codes are active right now. Check back soon.
          </p>
        ) : (
          <CouponBrowser vendors={vendors} />
        )}

        <section className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <h2 className="text-lg font-black text-content sm:text-xl">
            How {site.name}&rsquo;s <span className="text-brand">Coupon Tracking</span> Works
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              {site.name} monitors vendor sites for published discount codes and verifies each one
              before listing it here. When a vendor runs a sitewide coupon, every listing from that
              vendor on the site shows the discounted price alongside the original, so comparisons
              reflect what you would actually pay.
            </p>
            <p>
              Codes are set by the vendors, not by {site.name}. They can expire, carry conditions such
              as minimum orders or first-time-customer restrictions, or be withdrawn at any time. If a
              code stops working, let us know and we will recheck it.
            </p>
          </div>
        </section>

        <PageFaqSection path="/coupons" className="mt-14" />
      </div>
    </div>
  );
}
