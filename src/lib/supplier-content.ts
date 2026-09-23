import { site } from '@/config/site';
import { mcg, pricePerMg } from '@/lib/price';
import { cents } from '@/lib/money';
import type { Offer, Supplier } from '@/lib/schema';

/**
 * The three editable content boxes on every supplier page: "About", "Why
 * researchers choose" and "vs other suppliers".
 *
 * Until someone edits a box in /admin/seo, its text is generated here from the
 * vendor's own record and the offers we actually hold, so every sentence is a
 * fact we can back up. Nothing is written about a vendor that its data does not
 * support, and nothing reads as dosing or medical advice.
 *
 * Pure and client-safe: no database access, so the admin editor and the tests
 * can call it directly.
 */

export type SupplierContentKey = 'about' | 'why' | 'compare';

export const SUPPLIER_CONTENT_KEYS: readonly SupplierContentKey[] = ['about', 'why', 'compare'];

export interface SupplierContentBlock {
  title: string;
  body: string;
}

export type SupplierContent = Record<SupplierContentKey, SupplierContentBlock>;

/** What an admin has saved. Null in a field means "use the generated text". */
export type SupplierContentOverride = Record<SupplierContentKey, { title: string | null; body: string | null }>;

/** Target body lengths, shown as a guide in the admin editor. */
export const SUPPLIER_CONTENT_WORD_TARGET: Record<SupplierContentKey, { min: number; max: number }> = {
  about: { min: 100, max: 150 },
  why: { min: 70, max: 110 },
  compare: { min: 50, max: 90 },
};

export const SUPPLIER_CONTENT_LABEL: Record<SupplierContentKey, string> = {
  about: 'About',
  why: 'Why researchers choose',
  compare: 'Vs other suppliers',
};

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/** Facts about one vendor's catalogue, measured against every other vendor's offers. */
export interface SupplierMarketStats {
  listingCount: number;
  compoundCount: number;
  inStockCount: number;
  /** Listings that link to a certificate of analysis, graded or not. */
  labDocumentCount: number;
  /** In-stock compounds this vendor shares with at least one other vendor, same currency. */
  comparableCompoundCount: number;
  /** Of those, how many this vendor has the lowest (or joint-lowest) cost per mg on. */
  lowestPriceCount: number;
  /** Other vendors with at least one listing. */
  otherVendorCount: number;
}

/**
 * Compares at full precision, per compound and currency: currencies are never
 * ranked against each other without a rate. Out-of-stock listings are dropped
 * before comparing, so a price nobody can buy never counts as "lowest".
 */
export function supplierMarketStats(supplierSlug: string, offers: readonly Offer[]): SupplierMarketStats {
  const own = offers.filter((offer) => offer.supplierSlug === supplierSlug);

  // compound|currency -> supplier -> that supplier's best cost per mg (cents).
  const bestByCompound = new Map<string, Map<string, number>>();
  for (const offer of offers) {
    if (!offer.inStock) continue;
    const perMg = pricePerMg({
      supplierSlug: offer.supplierSlug,
      productSlug: offer.productSlug,
      listPrice: cents(offer.listPrice),
      salePrice: offer.salePrice === null ? null : cents(offer.salePrice),
      currency: offer.currency,
      vialSize: mcg(offer.vialSize),
      vialCount: offer.vialCount,
      inStock: offer.inStock,
      scrapedAt: offer.scrapedAt,
      url: offer.productUrl,
    });
    if (perMg === null) continue;
    const key = `${offer.productSlug}|${offer.currency}`;
    const bySupplier = bestByCompound.get(key) ?? new Map<string, number>();
    const current = bySupplier.get(offer.supplierSlug);
    if (current === undefined || perMg < current) bySupplier.set(offer.supplierSlug, perMg);
    bestByCompound.set(key, bySupplier);
  }

  let comparableCompoundCount = 0;
  let lowestPriceCount = 0;
  for (const bySupplier of bestByCompound.values()) {
    const ownBest = bySupplier.get(supplierSlug);
    if (ownBest === undefined || bySupplier.size < 2) continue;
    comparableCompoundCount += 1;
    const othersBest = Math.min(
      ...[...bySupplier].filter(([slug]) => slug !== supplierSlug).map(([, perMg]) => perMg),
    );
    if (ownBest <= othersBest) lowestPriceCount += 1;
  }

  return {
    listingCount: own.length,
    compoundCount: new Set(own.map((offer) => offer.productSlug)).size,
    inStockCount: own.filter((offer) => offer.inStock).length,
    labDocumentCount: own.filter((offer) => offer.labReport !== null || Boolean(offer.coaUrl)).length,
    comparableCompoundCount,
    lowestPriceCount,
    otherVendorCount: new Set(
      offers.filter((offer) => offer.supplierSlug !== supplierSlug).map((offer) => offer.supplierSlug),
    ).size,
  };
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function listPhrase(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

type SupplierFacts = Pick<
  Supplier,
  'name' | 'country' | 'foundedYear' | 'coaLabName' | 'coupon' | 'reviewRating' | 'paymentMethods'
>;

function aboutBody(supplier: SupplierFacts, stats: SupplierMarketStats): string {
  const { name } = supplier;
  const origin = [
    supplier.country ? `operating from ${supplier.country}` : null,
    supplier.foundedYear ? `established in ${supplier.foundedYear}` : null,
  ].filter((part): part is string => part !== null);

  return [
    `${name} is a research peptide supplier listed in the ${site.name} directory${origin.length > 0 ? `, ${origin.join(' and ')}` : ''}.`,
    stats.listingCount > 0
      ? `We currently track ${plural(stats.listingCount, 'listing')} from ${name} across ${plural(stats.compoundCount, 'compound')}, and ${stats.inStockCount} of them were in stock when their prices were last checked.`
      : `We have not recorded any prices from ${name} yet; listings appear here once they are read from the vendor's live product pages.`,
    `Every price is read from ${name}'s own product pages and converted to cost per milligram, so a single vial and a multi-vial kit can be compared on the same scale as every other supplier.`,
    stats.labDocumentCount > 0
      ? `${plural(stats.labDocumentCount, 'listing')} ${stats.labDocumentCount === 1 ? 'links' : 'link'} to a certificate of analysis${supplier.coaLabName ? ` from ${supplier.coaLabName}` : ''}, which you can open from the listing itself.`
      : `${name} has no certificates of analysis on file with us yet, so purity claims for its products cannot be checked here.`,
    `${site.name} does not sell ${name}'s products: every order is placed on the vendor's own site, and everything listed is sold for laboratory research use only.`,
  ].join(' ');
}

function whyBody(supplier: SupplierFacts, stats: SupplierMarketStats): string {
  const { name } = supplier;
  // Only points this vendor's record actually supports; a missing fact is left
  // out rather than softened into a vague claim.
  const facts = [
    stats.listingCount > 0
      ? `The catalogue covers ${plural(stats.compoundCount, 'compound')}, each priced per milligram.`
      : `No prices are on file for ${name} yet, so the comparison fills in as listings are recorded.`,
    supplier.coupon
      ? `An active ${supplier.coupon.percentOff}% code, ${supplier.coupon.code}, is shown alongside the prices.`
      : null,
    supplier.reviewRating !== null
      ? `Its public review profile averages ${supplier.reviewRating.toFixed(1)} out of 5.`
      : null,
    stats.labDocumentCount > 0 ? `COAs are linked on ${plural(stats.labDocumentCount, 'listing')}.` : null,
    supplier.paymentMethods.length > 0
      ? `Payment options include ${listPhrase(supplier.paymentMethods.slice(0, 3))}.`
      : null,
  ].filter((fact): fact is string => fact !== null);

  return [
    `Researchers who shortlist ${name} tend to weigh a few concrete, checkable points, and this page gathers them in one place.`,
    ...facts,
    `Prices carry the time they were last seen, and out-of-stock listings never win a comparison.`,
    `None of this is an endorsement: compare cost per mg, read the COA for the exact batch, and confirm terms on ${name}'s site before ordering.`,
  ].join(' ');
}

function compareBody(supplier: SupplierFacts, stats: SupplierMarketStats): string {
  const { name } = supplier;
  const headline =
    stats.comparableCompoundCount > 0
      ? `Of the ${plural(stats.comparableCompoundCount, 'compound')} ${name} has in stock that other tracked suppliers also carry, ${name} had the lowest listed cost per mg on ${stats.lowestPriceCount}.`
      : stats.listingCount > 0
        ? `None of ${name}'s in-stock listings currently overlap with another tracked supplier's, so there is no like-for-like price comparison for it yet.`
        : `${name} has no prices on file yet, so it cannot be ranked against the other suppliers we track.`;

  return [
    headline,
    stats.otherVendorCount > 0
      ? `${site.name} tracks ${plural(stats.otherVendorCount, 'other supplier')} with listed prices, and every ranking uses cost per milligram rather than headline price, because pack sizes differ.`
      : `Every ranking on ${site.name} uses cost per milligram rather than headline price, because pack sizes differ between suppliers.`,
    `Out-of-stock listings are excluded before ranking.`,
    `Prices move often, so open any compound's comparison page to see where ${name} sits against every other vendor today.`,
  ].join(' ');
}

export function defaultSupplierContent(supplier: SupplierFacts, stats: SupplierMarketStats): SupplierContent {
  const { name } = supplier;
  return {
    about: { title: `About ${name}`, body: aboutBody(supplier, stats) },
    why: { title: `Why researchers choose ${name}`, body: whyBody(supplier, stats) },
    compare: { title: `${name} vs other suppliers`, body: compareBody(supplier, stats) },
  };
}

/** Saved text wins field by field; anything left blank falls back to the generated default. */
export function resolveSupplierContent(
  defaults: SupplierContent,
  override: SupplierContentOverride | null,
): SupplierContent {
  if (!override) return defaults;
  const pick = (key: SupplierContentKey): SupplierContentBlock => ({
    title: override[key].title?.trim() || defaults[key].title,
    body: override[key].body?.trim() || defaults[key].body,
  });
  return { about: pick('about'), why: pick('why'), compare: pick('compare') };
}
