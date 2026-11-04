import { describe, expect, it } from 'vitest';
import {
  defaultReviewPageContent,
  isEmptyReviewOverride,
  resolveReviewPageContent,
  toReviewPageContentOverride,
} from '@/lib/review-page-content';

const VENDOR = { name: 'IDUN Peptides', description: 'A U.S. research peptide supplier.' };

describe('defaultReviewPageContent', () => {
  it('names the source in both notes and uses the vendor description as the intro', () => {
    const content = defaultReviewPageContent(VENDOR, 'Trustpilot');
    expect(content.intro).toBe('A U.S. research peptide supplier.');
    expect(content.ratingNote).toContain('Trustpilot');
    expect(content.reviewsNote).toContain('Trustpilot');
  });
});

describe('toReviewPageContentOverride', () => {
  const defaults = defaultReviewPageContent(VENDOR, 'Trustpilot');
  const unchanged = { intro: defaults.intro ?? '', ratingNote: defaults.ratingNote, reviewsNote: defaults.reviewsNote };

  it('stores nothing when every field is unchanged, so the page keeps tracking the vendor record', () => {
    expect(isEmptyReviewOverride(toReviewPageContentOverride(unchanged, defaults))).toBe(true);
  });

  it('stores only the fields that were edited', () => {
    const override = toReviewPageContentOverride({ ...unchanged, ratingNote: 'Custom note', reviewsNote: '   ' }, defaults);
    expect(override).toEqual({ intro: null, ratingNote: 'Custom note', reviewsNote: null });
  });
});

describe('resolveReviewPageContent', () => {
  const defaults = defaultReviewPageContent(VENDOR, 'Trustpilot');

  it('uses generated text when nothing is saved', () => {
    expect(resolveReviewPageContent(defaults, null)).toEqual(defaults);
  });

  it('layers saved text over the generated text field by field', () => {
    const resolved = resolveReviewPageContent(defaults, { intro: 'Custom intro', ratingNote: null, reviewsNote: null });
    expect(resolved.intro).toBe('Custom intro');
    expect(resolved.ratingNote).toBe(defaults.ratingNote);
  });
});

