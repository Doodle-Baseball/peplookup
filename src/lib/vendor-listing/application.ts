import { z } from 'zod';
import { MAX_SCREENSHOT_BYTES, SCREENSHOT_TYPES } from '@/config/vendor-listing';

/**
 * Shared by the browser form (inline errors) and the server action (the
 * authoritative check), so the two can never disagree about what is valid.
 */

const percent = z
  .string()
  .trim()
  .min(1, 'Required')
  .regex(/^\d{1,3}(\.\d{1,2})?$/, 'Enter a number such as 10 or 12.5')
  .transform(Number)
  .refine((value) => value >= 0 && value <= 100, 'Must be between 0 and 100');

function link(message: string) {
  return z
    .string()
    .trim()
    .min(1, 'Required')
    .max(500)
    .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
    .refine((value) => {
      try {
        const { hostname } = new URL(value);
        return hostname.includes('.');
      } catch {
        return false;
      }
    }, message);
}

/** Step 1, brand details. */
export const vendorApplicationSchema = z.object({
  plan: z.enum(['basic']),
  organizationName: z.string().trim().min(2, 'Enter your brand name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(200),
  contactNumber: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d][\d\s().-]*$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  websiteUrl: link('Enter a valid website address'),
  affiliateSignupUrl: link('Enter a valid link to your affiliate program sign-up'),
  coaPageUrl: link('Enter a valid link to your COA page'),
  commissionPercent: percent,
  customerDiscountPercent: percent,
  message: z
    .string()
    .trim()
    .max(1000, 'Keep it under 1,000 characters')
    .optional()
    // A blank box means no message, not an empty one.
    .transform((value) => value || undefined),
});

export type VendorApplication = z.infer<typeof vendorApplicationSchema>;

export type VendorApplicationField = keyof VendorApplication;

export type VendorApplicationFieldErrors = Partial<Record<VendorApplicationField, string>>;

/** Step 2, payment. */
export const paymentMethodSchema = z.enum(['btc', 'paypal'], {
  errorMap: () => ({ message: 'Choose how you paid' }),
});

export type SubmitFieldErrors = VendorApplicationFieldErrors &
  Partial<Record<'paymentMethod' | 'paymentScreenshot', string>>;

export function fieldErrorsFrom(error: z.ZodError): VendorApplicationFieldErrors {
  const errors: VendorApplicationFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in errors)) {
      errors[key as VendorApplicationField] = issue.message;
    }
  }
  return errors;
}

/** Why a payment screenshot can't be accepted, or null when it can. Checks what the browser reports about the file. */
export function screenshotProblem(file: { size: number; type: string } | null): string | null {
  if (!file || file.size === 0) return 'Upload a screenshot of your completed payment';
  if (!(SCREENSHOT_TYPES as readonly string[]).includes(file.type)) return 'Upload a PNG, JPG or WebP image';
  if (file.size > MAX_SCREENSHOT_BYTES) return `The screenshot must be under ${MAX_SCREENSHOT_BYTES / (1024 * 1024)} MB`;
  return null;
}

/**
 * Whether the file's first bytes are really the image type it claims to be,
 * so a renamed file of another kind is refused on the server.
 */
export function matchesImageSignature(bytes: Uint8Array, type: string): boolean {
  const starts = (signature: readonly number[], offset = 0) =>
    bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte);
  if (type === 'image/png') return starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (type === 'image/jpeg') return starts([0xff, 0xd8, 0xff]);
  // "RIFF" .... "WEBP"
  if (type === 'image/webp') return starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8);
  return false;
}
