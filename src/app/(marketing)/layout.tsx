import { getAllOffers, getSuppliers } from '@/lib/repository';
import { getSeoInjections } from '@/lib/seo';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ResearchNotice } from '@/components/layout/research-notice';
import { PromoBar } from '@/components/layout/promo-bar';
import { AllVendors } from '@/components/layout/all-vendors';
import { Newsletter } from '@/components/layout/newsletter';
import { SeoInjector } from '@/components/layout/seo-injector';
import { SupplierSpotlight } from '@/components/layout/supplier-spotlight';
import { RouteOverride } from '@/components/layout/route-override';
import { HighlightsBar } from '@/components/layout/highlights-bar';
import { highlightItems } from '@/components/layout/highlights-bar-items';
import { FeaturedPartnerSection } from '@/components/layout/featured-partner-section';
import { buildPromotedSupplier } from '@/lib/promoted-supplier';
import { PROMOTED_SUPPLIER } from '@/config/highlights-bar';
import { buildSupplierSpotlight } from '@/lib/supplier-spotlight';

/** Tool pages that drop the supplier directory, the featured partner and the "verified" claim. */
const TOOL_PATHS_WITHOUT_DIRECTORY = ['/tools/calculator', '/tools/intranasal', '/tools/coa-reader'];

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here (not per-page) so every public page gets the same
  // directory above the footer, instead of each page opting in separately.
  const [suppliers, seoInjections, offers] = await Promise.all([getSuppliers(), getSeoInjections(), getAllOffers()]);
  // The spotlight card belongs to a supplier marked Featured in the admin. When
  // several are, the promoted partner wins so the popup matches the top bar and
  // the featured section.
  const featuredSuppliers = suppliers.filter((supplier) => supplier.isFeatured);
  const featuredSupplier =
    featuredSuppliers.find((supplier) => supplier.slug === PROMOTED_SUPPLIER?.slug) ?? featuredSuppliers[0];
  // The partner promoted in the top bar and above the directory, from its live record.
  const promotedSupplier = buildPromotedSupplier(suppliers, offers, PROMOTED_SUPPLIER);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-chip focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      {/* No promotion is live until one is configured; the bar renders nothing. */}
      <PromoBar promotion={null} />
      <HighlightsBar promo={promotedSupplier} stats={highlightItems(suppliers, offers)} />
      <SiteHeader />
      <ResearchNotice />
      <main id="main" className="flex-1">
        {children}
      </main>
      <RouteOverride paths={TOOL_PATHS_WITHOUT_DIRECTORY} override={null}>
        {promotedSupplier ? <FeaturedPartnerSection promo={promotedSupplier} /> : null}
        <AllVendors suppliers={suppliers} />
      </RouteOverride>
      <RouteOverride
        paths={TOOL_PATHS_WITHOUT_DIRECTORY}
        override={<Newsletter compareSuppliersText="compare suppliers" />}
      >
        <Newsletter />
      </RouteOverride>
      <SiteFooter />
      {featuredSupplier ? (
        <SupplierSpotlight supplier={buildSupplierSpotlight(featuredSupplier)} />
      ) : null}
      {/* Custom head/body code from /admin/seo, per page. */}
      <SeoInjector injections={seoInjections} />
    </>
  );
}
