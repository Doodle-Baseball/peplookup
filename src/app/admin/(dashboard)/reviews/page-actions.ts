'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getReviewPageEditData, saveReviewPageContent, saveReviewSummary } from '@/lib/admin/review-pages';
import { findMostSimilarSupplierText } from '@/lib/admin/seo';
import { QUALITY_THRESHOLDS } from '@/config/seo-quality';
import { REVIEW_CONTENT_CACHE_TAG } from '@/lib/review-page-content-store';
import { REVIEW_TEXT_MAX, toReviewPageContentOverride } from '@/lib/review-page-content';
import { reviewsPagePath } from '@/lib/review-pages';

export interface ReviewPageFormState {
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
  revalidateTag(REVIEW_CONTENT_CACHE_TAG);
  revalidatePath(reviewsPagePath(slug));
  revalidatePath('/admin/reviews');
}

export async function saveReviewPageContentAction(
  slug: string,
  _prev: ReviewPageFormState,
  formData: FormData,
): Promise<ReviewPageFormState> {
  await assertAdmin();

  const intro = field(formData, 'intro');
  const ratingNote = field(formData, 'ratingNote');
  const reviewsNote = field(formData, 'reviewsNote');
  if ([intro, ratingNote, reviewsNote].some((value) => value.length > REVIEW_TEXT_MAX)) {
    return { error: `Each field can be at most ${REVIEW_TEXT_MAX.toLocaleString('en-US')} characters.`, savedAt: null };
  }

  try {
    const data = await getReviewPageEditData(slug);
    if (!data) return { error: 'That supplier does not exist.', savedAt: null };
    await saveReviewPageContent(slug, toReviewPageContentOverride({ intro, ratingNote, reviewsNote }, data.defaults));
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save this page.', savedAt: null };
  }

  refresh(slug);
  return { error: null, savedAt: Date.now() };
}

/** Puts every section of one reviews page back on generated text. */
export async function resetReviewPageContentAction(slug: string): Promise<{ error: string | null }> {
  await assertAdmin();
  try {
    await saveReviewPageContent(slug, { intro: null, ratingNote: null, reviewsNote: null });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to reset this page.' };
  }
  refresh(slug);
  return { error: null };
}

export interface ReviewSummaryFormState {
  error: string | null;
  /** Saved, but more than 70% similar to another supplier's summary (B3). */
  warning: string | null;
  savedAt: number | null;
}

/** Long enough for six full sentences; the page shows it as one paragraph. */
const REVIEW_SUMMARY_MAX = 2000;

export async function saveReviewSummaryAction(
  slug: string,
  _prev: ReviewSummaryFormState,
  formData: FormData,
): Promise<ReviewSummaryFormState> {
  await assertAdmin();
  const summary = field(formData, 'reviewSummary').trim();
  if (summary.length > REVIEW_SUMMARY_MAX) {
    return { error: `The summary can be at most ${REVIEW_SUMMARY_MAX.toLocaleString('en-US')} characters.`, warning: null, savedAt: null };
  }

  let warning: string | null = null;
  try {
    await saveReviewSummary(slug, summary || null);
    if (summary) {
      const closest = await findMostSimilarSupplierText('review_summary', slug, summary);
      if (closest && closest.score > QUALITY_THRESHOLDS.maxSimilarity) {
        warning = `Saved. This summary is ${Math.round(closest.score * 100)}% similar to ${closest.name}'s. The page fails the quality check until it is written in this supplier's own terms.`;
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save the summary.', warning: null, savedAt: null };
  }

  // The summary lives on the supplier record, which every supplier read caches under 'suppliers'.
  revalidateTag('suppliers');
  refresh(slug);
  return { error: null, warning, savedAt: Date.now() };
}
