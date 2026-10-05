import { site } from '@/config/site';
import type { Supplier } from '@/lib/schema';

/**
 * The editable text on a vendor's reviews page: the intro, the small print under
 * the rating box and the note under the review cards.
 *
 * Until someone edits it in /admin/reviews, each piece is generated here from
 * the vendor's own record, so every sentence is one we can back up.
 *
 * Pure and client-safe: no database access, so the admin form and the tests can
 * call it directly.
 */

export const REVIEW_TEXT_MAX = 1000;

export type ReviewPageTextKey = 'intro' | 'ratingNote' | 'reviewsNote';

export const REVIEW_TEXT_LABELS: Record<ReviewPageTextKey, string> = {
  intro: 'Intro text',
  ratingNote: 'Rating box note',
  reviewsNote: 'Reviews note',
};

export interface ReviewPageContent {
  /** Null when the vendor has no description and none was written. */
  intro: string | null;
  ratingNote: string;
  reviewsNote: string;
}

/** What an admin has saved. Null in a field means "use the generated text". */
export interface ReviewPageContentOverride {
  intro: string | null;
  ratingNote: string | null;
  reviewsNote: string | null;
}

type ReviewVendor = Pick<Supplier, 'name' | 'description'>;

export function defaultReviewPageContent(supplier: ReviewVendor, sourceLabel: string): ReviewPageContent {
  return {
    intro: supplier.description,
    ratingNote: `Ratings are read from ${sourceLabel} and are not verified by ${site.name}.`,
    reviewsNote: `Reviews are summarised from ${sourceLabel} and linked to their source. They are not verified or edited by the site, and they describe customer experience, not product testing.`,
  };
}

/** Saved text where there is some, generated text everywhere else. */
export function resolveReviewPageContent(
  defaults: ReviewPageContent,
  saved: ReviewPageContentOverride | null,
): ReviewPageContent {
  if (!saved) return defaults;
  return {
    intro: saved.intro ?? defaults.intro,
    ratingNote: saved.ratingNote ?? defaults.ratingNote,
    reviewsNote: saved.reviewsNote ?? defaults.reviewsNote,
  };
}

/**
 * Turns submitted text into what gets stored: blank, or unchanged from the
 * generated version, is saved as null so the page keeps tracking the vendor's
 * live record (its source, its name) instead of freezing today's wording.
 */
export function toReviewPageContentOverride(
  submitted: { intro: string; ratingNote: string; reviewsNote: string },
  defaults: ReviewPageContent,
): ReviewPageContentOverride {
  const stored = (value: string, generated: string | null): string | null => {
    const trimmed = value.trim();
    return trimmed === '' || trimmed === (generated ?? '').trim() ? null : trimmed;
  };
  return {
    intro: stored(submitted.intro, defaults.intro),
    ratingNote: stored(submitted.ratingNote, defaults.ratingNote),
    reviewsNote: stored(submitted.reviewsNote, defaults.reviewsNote),
  };
}

export function isEmptyReviewOverride(override: ReviewPageContentOverride): boolean {
  return override.intro === null && override.ratingNote === null && override.reviewsNote === null;
}
