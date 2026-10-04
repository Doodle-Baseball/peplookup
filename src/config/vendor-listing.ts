import { site } from '@/config/site';

export type VendorListingPlanId = 'basic' | 'pro';

export interface VendorListingPlan {
  id: VendorListingPlanId;
  name: string;
  /** Integer cents. Formatted only at the render boundary. */
  priceCents: number;
  interval: 'month' | 'year';
  tagline: string;
  /** A lead-in line shown above the features, e.g. "Everything in Basic, plus:". */
  featuresIntro: string | null;
  features: readonly string[];
  highlighted: boolean;
}

export const VENDOR_LISTING_PLANS: readonly VendorListingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceCents: 5_000,
    interval: 'month',
    tagline: 'Get your brand compared on PepLookup.',
    featuresIntro: null,
    features: [
      'Dedicated brand page with info, products and website link',
      'Your products listed in our price-comparison directory',
      'Upload COA / lab reports so buyers can trust you',
      'Brand profile with logo and short description',
      'Direct link from your listing to your store',
      '"Verified Listing" badge to stand out instantly',
      'Standard email support',
      'Live within 24 hours',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceCents: 50_000,
    interval: 'year',
    tagline: 'Maximum visibility, with promotion included.',
    featuresIntro: 'Everything in Basic, plus:',
    features: [
      'Clearly labelled "Sponsored" badge for extra visibility',
      'COA badge shown on the comparison card too',
      'Dedicated coupon section to attract more buyers',
      'Named support contact, not a ticket queue',
      'Featured in PepLookup social and community promotion',
      'Complete product catalog with your links',
      'Early access to new features and placements',
      'Live within 24 hours',
    ],
    highlighted: true,
  },
] as const;

export function vendorListingPlan(id: VendorListingPlanId): VendorListingPlan {
  const plan = VENDOR_LISTING_PLANS.find((candidate) => candidate.id === id);
  if (!plan) throw new Error(`Unknown vendor listing plan "${id}".`);
  return plan;
}

export function formatPlanPrice(plan: Pick<VendorListingPlan, 'priceCents'>): string {
  return `$${(plan.priceCents / 100).toLocaleString('en-US')}`;
}

/** Remembers the applicant's request id across the trip to Whop and back. */
export const REQUEST_COOKIE = 'vl_request';

/** Who the applicant is told will contact them, shown on the thanks page and in emails. */
export const VENDOR_LISTING_CONTACT = {
  name: `${site.publisher} Team`,
  email: site.contactEmail,
  responseWindow: '24 hours',
} as const;
