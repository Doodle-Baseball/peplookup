import { site } from '@/config/site';
import { formatShipping } from '@/lib/format';
import type { Supplier } from '@/lib/schema';

/**
 * The editable text on a vendor's coupon page: the intro, the six "Coupon
 * Details" rows, the "How to use" steps and the note under them.
 *
 * Until someone edits it in /admin/coupon-pages, each piece is generated here
 * from the vendor's own coupon record, so every sentence is one we can back up.
 * Where we have not confirmed a condition (expiry, stacking, customer rules) the
 * text says so rather than implying a rule.
 *
 * Pure and client-safe: no database access, so the admin form and the tests can
 * call it directly.
 */

export const COUPON_DETAIL_KEYS = [
  'codeAndOffer',
  'offerStatus',
  'customers',
  'expiry',
  'stacking',
  'shipping',
] as const;
export type CouponDetailKey = (typeof COUPON_DETAIL_KEYS)[number];

export const COUPON_DETAIL_LABELS: Record<CouponDetailKey, string> = {
  codeAndOffer: 'Code and offer',
  offerStatus: 'Offer status',
  customers: 'First order / returning customer',
  expiry: 'Expiry / minimum spend',
  stacking: 'Combining offers',
  shipping: 'Shipping',
};

export const COUPON_STEPS_MAX = 8;
export const COUPON_TEXT_MAX = 1000;
export const COUPON_STEP_MAX = 500;

export interface CouponPageContent {
  /** Null when the vendor has no description and none was written. */
  intro: string | null;
  details: Record<CouponDetailKey, string>;
  steps: string[];
  workingNote: string;
}

/** What an admin has saved. Null in a field means "use the generated text". */
export interface CouponPageContentOverride {
  intro: string | null;
  details: Record<CouponDetailKey, string | null>;
  steps: string[] | null;
  workingNote: string | null;
}

type CouponVendor = Pick<Supplier, 'name' | 'description' | 'shippingCost'>;
type Coupon = NonNullable<Supplier['coupon']>;

export function defaultCouponPageContent(supplier: CouponVendor, coupon: Coupon): CouponPageContent {
  const { name } = supplier;
  const shippingKnown = supplier.shippingCost.kind !== 'unknown';

  return {
    intro: supplier.description,
    details: {
      codeAndOffer: `${coupon.code} for ${coupon.percentOff}% off eligible orders, the tracked ${name} promo code, entered in the promo or discount field at checkout`,
      offerStatus: `Listed by ${site.name}; final eligibility and savings are determined at checkout`,
      customers: 'No customer-specific eligibility rule confirmed',
      expiry: 'No published expiry date or minimum confirmed',
      stacking: "Stacking the code with other codes or the supplier's own sales is not confirmed",
      shipping: shippingKnown
        ? `${formatShipping(supplier.shippingCost)} standard shipping listed; separate from the coupon, availability and charges appear at checkout`
        : 'Separate from the coupon; availability and charges appear at checkout',
    },
    steps: [
      `Open the ${name} store through the ${site.name} link, so the visit is tracked to this code.`,
      `Add eligible products to your cart, then paste ${coupon.code} into the promo, discount, or coupon code field.`,
      `Confirm the savings in the order summary before checkout, so you know the ${name} promo code was accepted.`,
      "Check the supplier's banner too. Suppliers sometimes run their own sitewide sales alongside a tracked code, so compare the cart total before you pay.",
    ],
    workingNote: `${coupon.code} is the code ${site.name} tracks and lists on this page. ${name} may also advertise its own rotating or sitewide sale codes separately, so compare both against the cart total before you pay.`,
  };
}

/** Saved text where there is some, generated text everywhere else. */
export function resolveCouponPageContent(
  defaults: CouponPageContent,
  saved: CouponPageContentOverride | null,
): CouponPageContent {
  if (!saved) return defaults;
  const details = {} as Record<CouponDetailKey, string>;
  for (const key of COUPON_DETAIL_KEYS) details[key] = saved.details[key] ?? defaults.details[key];
  return {
    intro: saved.intro ?? defaults.intro,
    details,
    steps: saved.steps && saved.steps.length > 0 ? saved.steps : defaults.steps,
    workingNote: saved.workingNote ?? defaults.workingNote,
  };
}

/** One step per line; blank lines are dropped. */
export function parseSteps(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

/**
 * Turns submitted text into what gets stored: blank, or unchanged from the
 * generated version, is saved as null so the page keeps tracking the vendor's
 * live coupon (a changed code or discount) instead of freezing today's wording.
 */
export function toCouponPageContentOverride(
  submitted: { intro: string; details: Record<CouponDetailKey, string>; steps: string[]; workingNote: string },
  defaults: CouponPageContent,
): CouponPageContentOverride {
  const stored = (value: string, generated: string | null): string | null => {
    const trimmed = value.trim();
    return trimmed === '' || trimmed === (generated ?? '').trim() ? null : trimmed;
  };
  const details = {} as Record<CouponDetailKey, string | null>;
  for (const key of COUPON_DETAIL_KEYS) details[key] = stored(submitted.details[key], defaults.details[key]);

  const sameSteps =
    submitted.steps.length === defaults.steps.length && submitted.steps.every((step, i) => step === defaults.steps[i]);
  return {
    intro: stored(submitted.intro, defaults.intro),
    details,
    steps: submitted.steps.length === 0 || sameSteps ? null : submitted.steps,
    workingNote: stored(submitted.workingNote, defaults.workingNote),
  };
}

export function isEmptyCouponOverride(override: CouponPageContentOverride): boolean {
  return (
    override.intro === null &&
    override.steps === null &&
    override.workingNote === null &&
    COUPON_DETAIL_KEYS.every((key) => override.details[key] === null)
  );
}
