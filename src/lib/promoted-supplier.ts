import type { Offer, Supplier } from '@/lib/schema';
import { formatRating, formatReviewCount } from '@/lib/format';
import { ratingSourceLabel } from '@/lib/review-pages';

/**
 * Everything the highlights bar and the featured-partner section show about
 * the promoted supplier. All of it comes from the supplier's record and its
 * live listings; a field the record doesn't hold is null and is left out of
 * the UI, never filled in. Deliberately no price-per-mg claim: being promoted
 * says nothing about being cheapest.
 */
export interface PromotedSupplier {
  slug: string;
  name: string;
  logoUrl: string | null;
  /** Our affiliate link to the supplier's own site. */
  shopUrl: string;
  /** "americanpeptides.us", for showing which site the link opens. */
  websiteHost: string;
  coupon: { code: string; percentOff: number } | null;
  inStockCompoundCount: number;
  listingCount: number;
  coaListingCount: number;
  country: string | null;
  foundedYear: number | null;
  /** First clause of the stored shipping note, e.g. "24–48 business hours processing". */
  processingTime: string | null;
  paymentMethods: readonly string[];
  /** Public review score with its source named, as the review pages show it; null without one. */
  rating: { value: string; reviewCountText: string | null; sourceLabel: string; url: string | null } | null;
}

type PromotedSupplierFields = Pick<
  Supplier,
  | 'slug'
  | 'name'
  | 'logoUrl'
  | 'faviconUrl'
  | 'affiliateUrl'
  | 'homepageUrl'
  | 'coupon'
  | 'country'
  | 'foundedYear'
  | 'shippingSpeed'
  | 'paymentMethods'
  | 'reviewRating'
  | 'reviewCount'
  | 'reviewsUrl'
>;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // The supplier schema validates these as URLs; this only guards a bad legacy row.
    return url;
  }
}

/**
 * The promoted supplier's display data, or null when no supplier is promoted
 * or it is no longer listed, so a delisted supplier is never advertised.
 */
export function buildPromotedSupplier(
  suppliers: readonly PromotedSupplierFields[],
  offers: readonly Pick<Offer, 'supplierSlug' | 'productSlug' | 'inStock' | 'coaUrl' | 'labReport'>[],
  promotion: { slug: string; logoUrl: string | null } | null,
): PromotedSupplier | null {
  const supplier = promotion ? suppliers.find((candidate) => candidate.slug === promotion.slug) : undefined;
  if (!promotion || !supplier) return null;

  const listings = offers.filter((offer) => offer.supplierSlug === supplier.slug);
  const inStockCompounds = new Set(listings.filter((offer) => offer.inStock).map((offer) => offer.productSlug));
  // Same test as /labs and /lab-reports: a document or the lab's own page to link to.
  const coaListings = listings.filter((offer) => offer.coaUrl || offer.labReport?.reportUrl || offer.labReport?.labUrl);
  const processingTime = supplier.shippingSpeed?.split(';')[0]?.trim() || null;

  return {
    slug: supplier.slug,
    name: supplier.name,
    logoUrl: promotion.logoUrl ?? supplier.logoUrl ?? supplier.faviconUrl,
    shopUrl: supplier.affiliateUrl || supplier.homepageUrl,
    websiteHost: hostOf(supplier.homepageUrl),
    coupon: supplier.coupon ? { code: supplier.coupon.code, percentOff: supplier.coupon.percentOff } : null,
    inStockCompoundCount: inStockCompounds.size,
    listingCount: listings.length,
    coaListingCount: coaListings.length,
    country: supplier.country,
    foundedYear: supplier.foundedYear,
    processingTime,
    paymentMethods: supplier.paymentMethods,
    rating:
      supplier.reviewRating !== null
        ? {
            value: formatRating(supplier.reviewRating),
            reviewCountText: formatReviewCount(supplier.reviewCount),
            sourceLabel: ratingSourceLabel(supplier.reviewsUrl),
            url: supplier.reviewsUrl,
          }
        : null,
  };
}

/** "24–48 business hours processing" -> "24–48h processing"; other wordings are kept as they are. */
export function shortProcessing(processingTime: string): string {
  return processingTime.replace(/\s*business\s+hours?/i, 'h');
}

const PAYMENT_GROUPS: readonly { label: string; pattern: RegExp }[] = [
  { label: 'Cards', pattern: /visa|master\s*card|american express|amex|discover|card/i },
  { label: 'ACH/Wire', pattern: /\bach\b|\bwire\b|bank transfer/i },
  { label: 'Crypto', pattern: /crypto|bitcoin|\bbtc\b|usdt|\beth(ereum)?\b/i },
];

/**
 * Payment methods folded into short groups ("Cards · ACH/Wire · Crypto"), in
 * first-seen order. A method that fits no group keeps its own name, so nothing
 * stored is dropped.
 */
export function shortPayments(methods: readonly string[]): string {
  const labels = methods.map((method) => PAYMENT_GROUPS.find((group) => group.pattern.test(method))?.label ?? method);
  return [...new Set(labels)].join(' · ');
}

const COUNTRY_SHORT_NAMES: Readonly<Record<string, string>> = {
  'United States': 'US',
  'United Kingdom': 'UK',
  'United Arab Emirates': 'UAE',
};

/** "United States" -> "US-based". */
export function shortCountry(country: string): string {
  return `${COUNTRY_SHORT_NAMES[country.trim()] ?? country.trim()}-based`;
}
