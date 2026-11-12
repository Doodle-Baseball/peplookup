import { getAllOffers, getSuppliers } from '@/lib/repository';
import { getSeoInjections } from '@/lib/seo';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ResearchNotice } from '@/components/layout/research-notice';
import { PromoBar } from '@/components/layout/promo-bar';
import { SeoInjector } from '@/components/layout/seo-injector';
import { HighlightsBar } from '@/components/layout/highlights-bar';
import { highlightItems } from '@/components/layout/highlights-bar-items';
import { buildPromotedSupplier } from '@/lib/promoted-supplier';
import { PROMOTED_SUPPLIER } from '@/config/highlights-bar';
import { HideOnPaths } from '@/components/layout/hide-on-paths';

/** Pages that carry no supplier promotion at all, the top bar's featured partner and rating included. */
const PATHS_WITHOUT_PROMOTION = ['/guide/what-is-peplookup'];

/**
 * The frame every public page shares: header, notices and footer only.
 *
 * Sitewide content blocks (the supplier directory, the featured partner, the
 * supplier spotlight and the community promo) are not rendered here: repeated
 * on every page they made most of each page identical. They live on the pages
 * that own them instead, see src/components/layout/sitewide-blocks.tsx.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [suppliers, seoInjections, offers] = await Promise.all([getSuppliers(), getSeoInjections(), getAllOffers()]);
  // The partner promoted in the top bar, from its live record.
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
      <HideOnPaths paths={PATHS_WITHOUT_PROMOTION}>
        <HighlightsBar promo={promotedSupplier} stats={highlightItems(suppliers, offers)} />
      </HideOnPaths>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ResearchNotice />
      <SiteFooter />
      {/* Custom head/body code from /admin/seo, per page. */}
      <SeoInjector injections={seoInjections} />
    </>
  );
}
