import { getSuppliers } from '@/lib/repository';
import { getSeoInjections } from '@/lib/seo';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ResearchNotice } from '@/components/layout/research-notice';
import { PromoBar } from '@/components/layout/promo-bar';
import { AllVendors } from '@/components/layout/all-vendors';
import { Newsletter } from '@/components/layout/newsletter';
import { SeoInjector } from '@/components/layout/seo-injector';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here (not per-page) so every public page gets the same
  // directory above the footer, instead of each page opting in separately.
  const [suppliers, seoInjections] = await Promise.all([getSuppliers(), getSeoInjections()]);

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
      <SiteHeader />
      <ResearchNotice />
      <main id="main" className="flex-1">
        {children}
      </main>
      <AllVendors suppliers={suppliers} />
      <Newsletter />
      <SiteFooter />
      {/* Custom head/body code from /admin/seo, per page. */}
      <SeoInjector injections={seoInjections} />
    </>
  );
}
