'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import {
  addReviewToVendor,
  getReviewsForVendor,
  importVendorReviews,
  replaceReviewsForVendor,
  type ReviewImportOutcome,
} from '@/lib/admin/reviews';
import { parseVendorReviewsCsv } from '@/lib/review-import';
import { supplierReviewSchema } from '@/lib/schema';

export interface AddReviewState {
  error: string | null;
  success: string | null;
}

export interface ImportReviewsState {
  error: string | null;
  success: string | null;
  outcomes: ReviewImportOutcome[];
}

function revalidateReviewSurfaces(slug?: string) {
  // Both tags matter and neither is reached by revalidatePath: the review set
  // itself is cached under 'supplier-reviews', and the supplier directory
  // ranks vendors partly on whether they have reviews at all, so that list
  // has to be rebuilt too. Without these, a review added here took up to
  // 5 minutes to show on the vendor's page or affect its position.
  revalidateTag('supplier-reviews');
  revalidateTag('suppliers');
  revalidatePath('/admin/reviews');
  revalidatePath('/suppliers');
  if (slug) {
    revalidatePath(`/suppliers/${slug}`);
    revalidatePath(`/admin/vendors/${slug}/edit`);
  }
}

export async function addReviewAction(
  _prevState: AddReviewState,
  formData: FormData,
): Promise<AddReviewState> {
  const slug = String(formData.get('vendorSlug') ?? '').trim();
  if (!slug) return { error: 'Choose a vendor first.', success: null };

  const parsed = supplierReviewSchema.safeParse({
    author: String(formData.get('author') ?? '').trim(),
    rating: Number(formData.get('rating') ?? ''),
    body: String(formData.get('body') ?? '').trim(),
    reviewedAt: String(formData.get('reviewedAt') ?? '').trim() || null,
  });

  if (!parsed.success) {
    return {
      error: 'Enter a reviewer name, a message, and a rating between 1 and 5 in half-point steps.',
      success: null,
    };
  }

  try {
    const total = await addReviewToVendor(slug, parsed.data);
    revalidateReviewSurfaces(slug);
    return { error: null, success: `Review added. This vendor now has ${total}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to add the review.', success: null };
  }
}

export async function deleteReviewAction(
  slug: string,
  index: number,
): Promise<{ error: string | null }> {
  try {
    const existing = await getReviewsForVendor(slug);
    if (index < 0 || index >= existing.length) return { error: 'That review no longer exists.' };
    await replaceReviewsForVendor(
      slug,
      existing.filter((_, i) => i !== index),
    );
    revalidateReviewSurfaces(slug);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete the review.' };
  }
}

export async function importReviewsCsvAction(
  _prevState: ImportReviewsState,
  formData: FormData,
): Promise<ImportReviewsState> {
  const csvText = String(formData.get('csvText') ?? '').trim();
  if (!csvText) return { error: 'Upload a CSV file to import reviews.', success: null, outcomes: [] };

  try {
    const parsed = parseVendorReviewsCsv(csvText);
    if (parsed.length === 0) {
      return {
        error: 'No vendor rows were found. The sheet needs a header row and at least one vendor.',
        success: null,
        outcomes: [],
      };
    }

    const { outcomes, imported } = await importVendorReviews(parsed);
    const matched = outcomes.filter((o) => o.status === 'imported').length;
    const unmatched = outcomes.filter((o) => o.status === 'no-vendor').length;

    revalidateReviewSurfaces();
    for (const outcome of outcomes) {
      if (outcome.matchedSlug) revalidatePath(`/suppliers/${outcome.matchedSlug}`);
    }

    return {
      error: null,
      success:
        `Imported ${imported} review${imported === 1 ? '' : 's'} across ${matched} vendor${matched === 1 ? '' : 's'}.` +
        (unmatched > 0 ? ` ${unmatched} row${unmatched === 1 ? '' : 's'} had no matching vendor.` : ''),
      outcomes,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to import reviews.',
      success: null,
      outcomes: [],
    };
  }
}
