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
  features: readonly VendorListingFeature[];
  highlighted: boolean;
}

/** A short bold title over the full sentence, as the pricing panel lists them. */
export interface VendorListingFeature {
  title: string;
  detail: string;
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
      { title: 'A dedicated brand page', detail: 'Dedicated brand page with company information, products, and website link.' },
      { title: 'A spot in our comparison directory', detail: 'Your products listed in our price-comparison directory.' },
      { title: 'Your COAs and lab reports', detail: 'Upload COAs and laboratory reports to help buyers evaluate your products.' },
      { title: 'A brand profile', detail: 'Brand profile with logo and short description.' },
      { title: 'A backlink to your website', detail: 'Direct backlink from your listing to your store.' },
      { title: 'A "FEATURED" badge', detail: 'Clearly displayed "FEATURED" badge so buyers can identify your brand.' },
      { title: 'Email support', detail: 'Standard email support.' },
      { title: 'Live within 24 hours', detail: 'Listing published within 24 hours after approval.' },
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
    // No longer offered; kept so requests made under it can still be shown.
    features: [
      { title: 'Sponsored badge', detail: 'Clearly labelled "Sponsored" badge for extra visibility' },
      { title: 'COA badge', detail: 'COA badge shown on the comparison card too' },
      { title: 'Coupon section', detail: 'Dedicated coupon section to attract more buyers' },
      { title: 'Named support', detail: 'Named support contact, not a ticket queue' },
      { title: 'Promotion', detail: 'Featured in PepLookup social and community promotion' },
      { title: 'Full catalog', detail: 'Complete product catalog with your links' },
      { title: 'Early access', detail: 'Early access to new features and placements' },
      { title: 'Live within 24 hours', detail: 'Live within 24 hours' },
    ],
    highlighted: true,
  },
] as const;

export function vendorListingPlan(id: VendorListingPlanId): VendorListingPlan {
  const plan = VENDOR_LISTING_PLANS.find((candidate) => candidate.id === id);
  if (!plan) throw new Error(`Unknown supplier listing plan "${id}".`);
  return plan;
}

export function formatPlanPrice(plan: Pick<VendorListingPlan, 'priceCents'>): string {
  return `$${(plan.priceCents / 100).toLocaleString('en-US')}`;
}

/**
 * The one plan offered on /supplier-listing. "pro" stays defined above only so
 * requests made under it before can still be shown in the admin.
 */
export const LISTED_PLAN_ID = 'basic' satisfies VendorListingPlanId;

export type VendorPaymentMethod = 'btc' | 'paypal';

export const PAYMENT_METHOD_LABEL: Record<VendorPaymentMethod, string> = {
  btc: 'Bitcoin (BTC)',
  paypal: 'PayPal',
};

/** Where each method pays to; null while it isn't set in the environment, and then the method can't be chosen. */
export interface VendorPaymentDetails {
  btc: string | null;
  paypal: string | null;
}

/** 4 MB: under the 5 MB server action limit in next.config.mjs, with room for the form fields. */
export const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;

export const SCREENSHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Who the applicant is told will contact them, shown on the listing page and in emails. */
export const VENDOR_LISTING_CONTACT = {
  name: `${site.publisher} Team`,
  email: site.contactEmail,
  responseWindow: '24 hours',
} as const;
