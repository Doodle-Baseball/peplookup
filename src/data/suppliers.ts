import { supplierListSchema, type Supplier } from '@/lib/schema';
import { faviconUrl } from '@/lib/favicon';

/**
 * Seed suppliers.
 *
 * Only fields we have actually confirmed are populated; everything unknown is
 * null and renders as an empty state rather than a plausible-looking guess.
 * Ratings, lab scores and founding years are absent because they have not
 * been verified for these vendors yet. Logos use each vendor's own favicon,
 * resolved in the visitor's browser rather than scraped by us.
 *
 * affiliateUrl is OUR affiliate link. Never copy another aggregator's ref
 * parameters — that pays commission to them, not us.
 */
const seed: Supplier[] = [
  {
    slug: 'elevate-research-co',
    name: 'Elevate Research Co',
    logoUrl: null,
    faviconUrl: faviconUrl('https://elevateresearchco.com/'),
    homepageUrl: 'https://elevateresearchco.com/',
    affiliateUrl: 'https://elevateresearchco.com/?ref=PRODUCTS',
    tier: null,
    trustRating: null,
    labScore: null,
    labVerified: false,
    foundedYear: null,
    reviewRating: null,
    reviewCount: null,
    reviewsUrl: null,
    shippingCost: { kind: 'unknown' },
    shippingSpeed: null,
    paymentMethods: [],
    coupon: { code: 'PRODUCTS', percentOff: 10 },
    description: null,
    hotline: null,
    policyUrls: { shipping: null, returns: null, privacy: null, terms: null },
    inventoryRefreshedAt: null,
  },
  {
    slug: 'peptime',
    name: 'Peptime',
    logoUrl: null,
    faviconUrl: faviconUrl('https://www.peptime.com/'),
    homepageUrl: 'https://www.peptime.com/',
    affiliateUrl: 'https://peptime.link/peplookup',
    tier: null,
    trustRating: null,
    labScore: null,
    labVerified: false,
    foundedYear: null,
    reviewRating: null,
    reviewCount: null,
    reviewsUrl: null,
    shippingCost: { kind: 'unknown' },
    shippingSpeed: null,
    paymentMethods: [],
    coupon: { code: '11@Awan22', percentOff: 11 },
    description: null,
    hotline: null,
    policyUrls: { shipping: null, returns: null, privacy: null, terms: null },
    inventoryRefreshedAt: null,
  },
  {
    slug: 'refined-bio-labs',
    name: 'Refined Bio Labs',
    logoUrl: null,
    faviconUrl: faviconUrl('https://refinedbiolabs.com/'),
    homepageUrl: 'https://refinedbiolabs.com/',
    // No affiliate programme confirmed yet, so this points at the plain
    // homepage. Swap in the tracked link once the relationship is approved.
    affiliateUrl: 'https://refinedbiolabs.com/',
    tier: null,
    trustRating: null,
    labScore: null,
    labVerified: false,
    foundedYear: null,
    reviewRating: null,
    reviewCount: null,
    reviewsUrl: null,
    shippingCost: { kind: 'unknown' },
    shippingSpeed: null,
    paymentMethods: [],
    coupon: null,
    description: null,
    hotline: null,
    policyUrls: { shipping: null, returns: null, privacy: null, terms: null },
    inventoryRefreshedAt: null,
  },
];

export const suppliers: readonly Supplier[] = supplierListSchema.parse(seed);
