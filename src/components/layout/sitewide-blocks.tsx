import { getAllOffers, getSuppliers } from '@/lib/repository';
import { AllVendors } from '@/components/layout/all-vendors';
import { Newsletter } from '@/components/layout/newsletter';
import { SupplierSpotlight } from '@/components/layout/supplier-spotlight';
import { FeaturedPartnerSection } from '@/components/layout/featured-partner-section';
import { buildPromotedSupplier } from '@/lib/promoted-supplier';
import { PROMOTED_SUPPLIER } from '@/config/highlights-bar';
import { buildSupplierSpotlight } from '@/lib/supplier-spotlight';

/**
 * The blocks that used to sit on every public page, now rendered only by the
 * pages that own them (B5): the directory and the community promo on / and
 * /supplier, the featured partner and the spotlight popup on / alone.
 * Rendered by the page rather than switched by path in the layout, so other
 * pages don't carry them in their HTML or their RSC payload either.
 */
export async function SitewideBlocks({ featuredPartner }: { featuredPartner: boolean }) {
  const [suppliers, offers] = await Promise.all([getSuppliers(), getAllOffers()]);
  // The spotlight shows the promoted partner whenever one is listed, so it
  // matches the top bar; without a promotion it falls back to the first
  // supplier marked Featured in the admin.
  const promotedSlug = PROMOTED_SUPPLIER?.slug;
  const promotedRecord = promotedSlug ? suppliers.find((supplier) => supplier.slug === promotedSlug) : undefined;
  const featuredSupplier = promotedRecord ?? suppliers.find((supplier) => supplier.isFeatured);
  const promotedSupplier = buildPromotedSupplier(suppliers, offers, PROMOTED_SUPPLIER);

  return (
    <>
      {featuredPartner && promotedSupplier ? <FeaturedPartnerSection promo={promotedSupplier} /> : null}
      <AllVendors suppliers={suppliers} />
      <Newsletter />
      {featuredPartner && featuredSupplier ? <SupplierSpotlight supplier={buildSupplierSpotlight(featuredSupplier)} /> : null}
    </>
  );
}
