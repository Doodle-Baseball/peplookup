'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getCouponPageEditData, saveCouponPageContent } from '@/lib/admin/coupon-pages';
import { couponPagePath } from '@/lib/coupon-pages';
import { COUPON_CONTENT_CACHE_TAG } from '@/lib/coupon-page-content-store';
import {
  COUPON_DETAIL_KEYS,
  COUPON_STEPS_MAX,
  COUPON_STEP_MAX,
  COUPON_TEXT_MAX,
  parseSteps,
  toCouponPageContentOverride,
  type CouponDetailKey,
} from '@/lib/coupon-page-content';

export interface CouponPageFormState {
  error: string | null;
  /** Changes on every successful save, so the form can show a confirmation. */
  savedAt: number | null;
}

/** The middleware already guards /admin, but these actions write page content, so they check the session themselves too. */
async function assertAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) throw new Error('Not signed in.');
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function refresh(slug: string) {
  revalidateTag(COUPON_CONTENT_CACHE_TAG);
  revalidatePath(couponPagePath(slug));
  revalidatePath('/admin/coupon-pages');
}

export async function saveCouponPageContentAction(
  slug: string,
  _prev: CouponPageFormState,
  formData: FormData,
): Promise<CouponPageFormState> {
  await assertAdmin();

  const steps = parseSteps(field(formData, 'steps'));
  if (steps.length > COUPON_STEPS_MAX) {
    return { error: `Use at most ${COUPON_STEPS_MAX} steps (one per line).`, savedAt: null };
  }
  if (steps.some((step) => step.length > COUPON_STEP_MAX)) {
    return { error: `Each step can be at most ${COUPON_STEP_MAX} characters.`, savedAt: null };
  }

  const intro = field(formData, 'intro');
  const workingNote = field(formData, 'workingNote');
  const details = {} as Record<CouponDetailKey, string>;
  for (const key of COUPON_DETAIL_KEYS) details[key] = field(formData, `detail_${key}`);

  const tooLong = [intro, workingNote, ...Object.values(details)].some((value) => value.length > COUPON_TEXT_MAX);
  if (tooLong) {
    return { error: `Each field can be at most ${COUPON_TEXT_MAX.toLocaleString('en-US')} characters.`, savedAt: null };
  }

  try {
    const data = await getCouponPageEditData(slug);
    if (!data) return { error: 'This supplier has no coupon, so it has no coupon page to edit.', savedAt: null };
    await saveCouponPageContent(slug, toCouponPageContentOverride({ intro, details, steps, workingNote }, data.defaults));
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save this page.', savedAt: null };
  }

  refresh(slug);
  return { error: null, savedAt: Date.now() };
}

/** Puts every section of one coupon page back on generated text. */
export async function resetCouponPageContentAction(slug: string): Promise<{ error: string | null }> {
  await assertAdmin();
  try {
    await saveCouponPageContent(slug, {
      intro: null,
      details: Object.fromEntries(COUPON_DETAIL_KEYS.map((key) => [key, null])) as Record<CouponDetailKey, null>,
      steps: null,
      workingNote: null,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to reset this page.' };
  }
  refresh(slug);
  return { error: null };
}
