import { catalogueStats, moreThanFloor } from '@/lib/catalogue-stats';
import type { Offer, Supplier } from '@/lib/schema';
import { shortPayments, shortProcessing, type PromotedSupplier } from '@/lib/promoted-supplier';

/** "80+ suppliers" when the count rounds down truthfully, the exact count otherwise; null at zero. */
function countLabel(count: number, singular: string, plural: string): string | null {
  if (count <= 0) return null;
  const floor = moreThanFloor(count);
  if (floor !== null) return `${floor.toLocaleString('en-US')}+ ${plural}`;
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * The strip above the navbar, built from live catalogue counts so every
 * figure is true at render time. A count of zero drops its item rather than
 * advertising "0 coupon codes".
 */
export function highlightItems(
  suppliers: readonly Pick<Supplier, 'slug' | 'coupon'>[],
  offers: readonly Pick<Offer, 'supplierSlug' | 'productSlug' | 'coaUrl' | 'labReport'>[],
): string[] {
  const { supplierCount, compoundCount } = catalogueStats(suppliers, offers);
  const listedSlugs = new Set(suppliers.map((supplier) => supplier.slug));
  // Same test as /labs and /lab-reports: a document or the lab's own page to link to.
  const coaCount = offers.filter(
    (offer) =>
      listedSlugs.has(offer.supplierSlug) && (offer.coaUrl || offer.labReport?.reportUrl || offer.labReport?.labUrl),
  ).length;
  const couponCount = suppliers.filter((supplier) => supplier.coupon !== null).length;

  return [
    // Exact, never rounded to "80+": every other page quotes the precise supplier count.
    supplierCount > 0 ? `${supplierCount.toLocaleString('en-US')} ${supplierCount === 1 ? 'supplier' : 'suppliers'}` : null,
    countLabel(compoundCount, 'compound', 'compounds'),
    countLabel(coaCount, 'supplier COA', 'supplier COAs'),
    'Price per mg comparison',
    countLabel(couponCount, 'coupon code', 'coupon codes'),
  ].filter((item): item is string => item !== null);
}

export type PromotedFactKind = 'coupon' | 'rating' | 'processing' | 'payments';

/**
 * The promoted supplier's facts for the bar, each only when the record holds
 * it, in short form. Nothing here compares price: a promotion is not a value
 * ranking.
 */
export function promotedFacts(promo: PromotedSupplier): { kind: PromotedFactKind; text: string }[] {
  const facts: { kind: PromotedFactKind; text: string }[] = [];
  if (promo.coupon) facts.push({ kind: 'coupon', text: `${promo.coupon.percentOff}% off with code ${promo.coupon.code}` });
  if (promo.rating) facts.push({ kind: 'rating', text: `${promo.rating.value}/5 on ${promo.rating.sourceLabel}` });
  if (promo.processingTime) facts.push({ kind: 'processing', text: shortProcessing(promo.processingTime) });
  if (promo.paymentMethods.length > 0) facts.push({ kind: 'payments', text: shortPayments(promo.paymentMethods) });
  return facts;
}
