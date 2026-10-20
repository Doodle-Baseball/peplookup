import { z } from 'zod';

/** Matches the check constraint on affiliate_clicks.source. */
export const affiliateClickSourceSchema = z.enum(['extension', 'website']);
export type AffiliateClickSource = z.infer<typeof affiliateClickSourceSchema>;

/** A missing or unrecognised `src` counts as a website click: only the extension sends one. */
export function parseClickSource(raw: string | null): AffiliateClickSource {
  const result = affiliateClickSourceSchema.safeParse(raw?.trim().toLowerCase());
  return result.success ? result.data : 'website';
}

/** Matches the check constraint on extension_uninstall_feedback.reason. */
export const uninstallReasonSchema = z.enum(['codes_did_not_work', 'too_many_popups', 'not_useful', 'other']);
export type UninstallReason = z.infer<typeof uninstallReasonSchema>;

export const UNINSTALL_REASONS: readonly { value: UninstallReason; label: string }[] = [
  { value: 'codes_did_not_work', label: "The codes didn't work" },
  { value: 'too_many_popups', label: 'Too many popups' },
  { value: 'not_useful', label: 'Not useful for me' },
  { value: 'other', label: 'Other' },
];

export const UNINSTALL_DETAILS_MAX_LENGTH = 1000;

/** Hidden field on the uninstall form that a person never fills in; a bot filling every input does. */
export const HONEYPOT_FIELD = 'website';

export const uninstallFeedbackSchema = z
  .object({
    reason: uninstallReasonSchema.nullable(),
    details: z.string().trim().max(UNINSTALL_DETAILS_MAX_LENGTH).nullable(),
  })
  .refine((value) => value.reason !== null || (value.details ?? '').length > 0, {
    message: 'Pick a reason or write a note before sending.',
  });
