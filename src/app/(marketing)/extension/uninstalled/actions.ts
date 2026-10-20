'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { HONEYPOT_FIELD, uninstallFeedbackSchema, uninstallReasonSchema } from '@/lib/extension/schema';
import { saveUninstallFeedback } from '@/lib/extension/store';
import { createRateLimiter } from '@/lib/rate-limit';

export interface UninstallFeedbackState {
  status: 'idle' | 'sent' | 'error';
  message: string | null;
}

const WINDOW_SECONDS = 600;

/** Set after an answer is saved, so the same browser can't send it again for 10 minutes. */
const SENT_COOKIE = 'pl_uninstall_feedback';

/**
 * Per visitor, by IP address held in memory only (never saved): a person
 * answers once, so three tries in 10 minutes is already generous.
 */
const allowSubmission = createRateLimiter({ limit: 3, windowMs: WINDOW_SECONDS * 1000 });

async function visitorKey(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown';
}

export async function submitUninstallFeedback(
  _previous: UninstallFeedbackState,
  formData: FormData,
): Promise<UninstallFeedbackState> {
  // Answered as if saved, so a bot learns nothing from the response.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').trim()) return { status: 'sent', message: null };

  const cookieStore = await cookies();
  if (cookieStore.has(SENT_COOKIE)) return { status: 'sent', message: null };
  if (!allowSubmission(await visitorKey())) {
    return { status: 'error', message: 'Too many answers sent from here. Please try again in a few minutes.' };
  }

  const reasonResult = uninstallReasonSchema.safeParse(formData.get('reason'));
  const detailsText = String(formData.get('details') ?? '').trim();
  const parsed = uninstallFeedbackSchema.safeParse({
    reason: reasonResult.success ? reasonResult.data : null,
    details: detailsText || null,
  });
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Please check your answer.' };
  }

  try {
    await saveUninstallFeedback(parsed.data.reason, parsed.data.details);
  } catch (error) {
    console.error('[extension] uninstall feedback was not saved:', error);
    return { status: 'error', message: 'Your answer could not be sent. Please try again in a moment.' };
  }
  cookieStore.set(SENT_COOKIE, '1', {
    maxAge: WINDOW_SECONDS,
    path: '/extension/uninstalled',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/admin/extension');
  return { status: 'sent', message: null };
}
