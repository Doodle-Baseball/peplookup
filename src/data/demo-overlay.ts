import 'server-only';
import type { Supplier } from '@/lib/schema';

/**
 * DEV-ONLY placeholder numbers so supplier cards have something to look at
 * while building the UI. Never applied when NODE_ENV is "production" (Next
 * sets this for `next build`/`next start`), real founded-year and review
 * data must come from a verified source before it ships, per CLAUDE.md's
 * "never invent data" rule. Keyed by slug; only fills fields still null in
 * the real seed data, so a verified value always wins.
 */
type DemoFields = Pick<
  Supplier,
  | 'foundedYear'
  | 'reviewRating'
  | 'reviewCount'
  | 'trustRating'
  | 'shippingCost'
  | 'shippingSpeed'
  | 'paymentMethods'
  | 'policyUrls'
  | 'description'
  | 'country'
>;

const DEMO_OVERRIDES: Record<string, DemoFields> = {
  'elevate-research-co': {
    foundedYear: 2021,
    reviewRating: 4.8,
    reviewCount: { kind: 'exact', value: 96 },
    trustRating: 4.8,
    shippingCost: { kind: 'free' },
    shippingSpeed: '2-4 business days',
    paymentMethods: ['Credit Card', 'Debit Card', 'Crypto'],
    policyUrls: {
      shipping: 'https://elevateresearchco.com/pages/shipping-policy',
      returns: 'https://elevateresearchco.com/pages/refund-policy',
      privacy: null,
      terms: null,
    },
    description:
      'Research peptides for laboratory use only. COA-verified, third-party tested, and batch-documented.',
    country: 'United States',
  },
  peptime: {
    foundedYear: 2019,
    reviewRating: 4.6,
    reviewCount: { kind: 'exact', value: 214 },
    trustRating: 4.6,
    shippingCost: { kind: 'flat', amount: 999 },
    shippingSpeed: '3-5 business days',
    paymentMethods: ['Credit Card', 'ACH', 'Zelle'],
    policyUrls: {
      shipping: 'https://www.peptime.com/pages/shipping',
      returns: 'https://www.peptime.com/pages/returns',
      privacy: null,
      terms: null,
    },
    description: 'Shop research-grade peptides with fast domestic shipping and verified lab testing.',
    country: 'United States',
  },
  'refined-bio-labs': {
    foundedYear: 2022,
    reviewRating: 4.7,
    reviewCount: { kind: 'atLeast', value: 50 },
    trustRating: 4.5,
    shippingCost: { kind: 'freeUpTo', max: 15000 },
    shippingSpeed: '3 business days',
    paymentMethods: ['Credit Card', 'Debit Card'],
    policyUrls: {
      shipping: 'https://refinedbiolabs.com/pages/shipping-policy',
      returns: 'https://refinedbiolabs.com/pages/returns',
      privacy: null,
      terms: null,
    },
    description:
      'U.S.-based supplier of premium research compounds, batch-tested for purity and identity.',
    country: 'United States',
  },
  'axis-peptide-labs-2': {
    foundedYear: 2020,
    reviewRating: 4.8,
    reviewCount: { kind: 'exact', value: 128 },
    trustRating: 4.8,
    shippingCost: { kind: 'free' },
    shippingSpeed: '2-4 business days',
    paymentMethods: ['Credit Card', 'ACH', 'Crypto'],
    policyUrls: {
      shipping: 'https://example.com/shipping-policy',
      returns: 'https://example.com/returns-policy',
      privacy: null,
      terms: null,
    },
    description: 'Research-grade peptides with a strong reputation for quality, consistency and fast shipping.',
    country: 'United States',
  },
};

export function withDemoData(supplier: Supplier): Supplier {
  if (process.env.NODE_ENV === 'production') return supplier;
  const demo = DEMO_OVERRIDES[supplier.slug];
  if (!demo) return supplier;
  return {
    ...supplier,
    foundedYear: supplier.foundedYear ?? demo.foundedYear,
    reviewRating: supplier.reviewRating ?? demo.reviewRating,
    reviewCount: supplier.reviewCount ?? demo.reviewCount,
    trustRating: supplier.trustRating ?? demo.trustRating,
    shippingCost: supplier.shippingCost.kind === 'unknown' ? demo.shippingCost : supplier.shippingCost,
    shippingSpeed: supplier.shippingSpeed ?? demo.shippingSpeed,
    paymentMethods: supplier.paymentMethods.length > 0 ? supplier.paymentMethods : demo.paymentMethods,
    policyUrls: {
      shipping: supplier.policyUrls.shipping ?? demo.policyUrls.shipping,
      returns: supplier.policyUrls.returns ?? demo.policyUrls.returns,
      privacy: supplier.policyUrls.privacy ?? demo.policyUrls.privacy,
      terms: supplier.policyUrls.terms ?? demo.policyUrls.terms,
    },
    description: supplier.description ?? demo.description,
    country: supplier.country ?? demo.country,
  };
}
