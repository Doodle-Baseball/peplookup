import { z } from 'zod';

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

const websiteUrl = z
  .string()
  .trim()
  .min(1, 'Required')
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .refine((value) => {
    try {
      const { hostname } = new URL(value);
      return hostname.includes('.');
    } catch {
      return false;
    }
  }, 'Enter a valid website address');

export const vendorApplicationSchema = z.object({
  plan: z.enum(['basic', 'pro']),
  organizationName: z.string().trim().min(2, 'Enter your organisation name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(200),
  contactNumber: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d][\d\s().-]*$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  websiteUrl,
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
