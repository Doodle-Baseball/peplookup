import { parseStoreDomains } from '@/lib/extension/domains';

/** What the admin supplier form shows and saves for the Chrome extension. */
export interface VendorExtensionFields {
  storeDomains: string[];
  showInExtension: boolean;
  /** YYYY-MM-DD: when the supplier rating ("Trust factor") was last checked. */
  ratingUpdatedAt: string | null;
  /** YYYY-MM-DD: when the coupon code was last tested. Admin only, never in the public feed. */
  couponVerifiedAt: string | null;
}

/** Marks a submission that carried the extension fields, so an absent checkbox reads as "off", not "not on this form". */
export const EXTENSION_FIELDS_MARKER = 'extensionFieldsPresent';

export interface VendorExtensionSubmission {
  fields: VendorExtensionFields;
  /** The supplier's review count, stored in the existing review_count columns. Null clears it. */
  reviewCount: number | null;
}

/** The subset of FormData this reads, so tests can pass a plain stand-in. */
interface FormValues {
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
  has(name: string): boolean;
}

function text(form: FormValues, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function optionalDate(form: FormValues, name: string, label: string): string | null {
  const value = text(form, name);
  if (!value) return null;
  if (!isCalendarDate(value)) throw new VendorExtensionInputError(`${label} must be a date.`);
  return value;
}

export class VendorExtensionInputError extends Error {}

/**
 * Reads and validates the extension fields of the supplier form. Returns null
 * when the form didn't carry them (the 0029 migration hasn't run), so nothing
 * is saved. Throws VendorExtensionInputError with an admin-facing message.
 */
export function parseVendorExtensionForm(
  form: FormValues,
  { affiliateUrl }: { affiliateUrl: string },
): VendorExtensionSubmission | null {
  // The extension's offer link redirects here, so it is checked even before 0029 has run.
  if (!affiliateUrl.startsWith('https://')) {
    throw new VendorExtensionInputError('Affiliate Website Link must start with https://.');
  }
  if (!form.has(EXTENSION_FIELDS_MARKER)) return null;

  // No code is allowed: the feed simply leaves the supplier out, and /admin/extension says why.
  const showInExtension = form.get('showInExtension') === 'on';

  const domains = parseStoreDomains(
    form.getAll('storeDomains').filter((value): value is string => typeof value === 'string'),
  );
  if (!domains.ok) throw new VendorExtensionInputError(`Store domains: ${domains.error}`);

  const reviewCountText = text(form, 'reviewCountValue');
  const reviewCount = reviewCountText ? Number(reviewCountText) : null;
  if (reviewCount !== null && (!Number.isInteger(reviewCount) || reviewCount < 0)) {
    throw new VendorExtensionInputError('Review count must be a whole number of 0 or more.');
  }

  return {
    fields: {
      storeDomains: domains.domains,
      showInExtension,
      ratingUpdatedAt: optionalDate(form, 'ratingUpdatedAt', 'Rating last updated'),
      couponVerifiedAt: optionalDate(form, 'couponVerifiedAt', 'Coupon last verified'),
    },
    reviewCount,
  };
}
