import type { Metadata } from 'next';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getSuppliers } from '@/lib/repository';
import { getPaymentDetails } from '@/lib/vendor-listing/payment-details';
import { ListingHero } from '@/components/vendor-listing/listing-hero';
import { ListingBenefits } from '@/components/vendor-listing/listing-benefits';
import { ListingJourney } from '@/components/vendor-listing/listing-journey';
import { VendorListingPlans } from '@/components/vendor-listing/vendor-listing-plans';
import { ListingHowItWorks } from '@/components/vendor-listing/listing-how-it-works';
import { VendorListingForm } from '@/components/vendor-listing/vendor-listing-form';
import { ListingDisclaimer, ListingFootnote } from '@/components/vendor-listing/listing-disclaimer';
import { ListingFaq } from '@/components/vendor-listing/listing-faq';
import { PageSeo } from '@/components/seo/page-seo';
import { ScrollReveal } from '@/components/vendor-listing/scroll-reveal';

const PAGE = staticSeoPage('/supplier-listing');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function VendorListingPage() {
  const [seo, suppliers] = await Promise.all([getSeoOverride(PAGE.path), getSuppliers()]);
  const paymentDetails = getPaymentDetails();

  return (
    <div className="pb-16 sm:pb-20">
      <PageSeo seo={PAGE} />

      {/* Full width, edge to edge; everything below sits in the site's usual column. */}
      <ListingHero heading={seo?.h1 || null} supplierCount={suppliers.length} />

      <div className="mx-auto mt-16 max-w-shell space-y-20 px-4 sm:mt-20 sm:space-y-24">
        <ListingBenefits />
        <ListingJourney />
        <VendorListingPlans />
        <ListingHowItWorks />

        <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-20 sm:scroll-mt-24">
          <h2 id="apply-heading" className="sr-only">
            Apply for a listing
          </h2>
          <div data-reveal="zoom" className="mx-auto max-w-2xl">
            <VendorListingForm paymentDetails={paymentDetails} />
          </div>
        </section>

        <div className="space-y-12 sm:space-y-16">
          <ListingDisclaimer />
          <div data-reveal>
            <ListingFaq path={PAGE.path} />
          </div>
          <ListingFootnote />
        </div>
      </div>
      <ScrollReveal />
    </div>
  );
}
