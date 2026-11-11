import { describe, expect, it } from 'vitest';
import { reviewPageRedirect, singularPath } from '@/lib/site-paths';

describe('reviewPageRedirect', () => {
  it('sends a supplier reviews page to the supplier profile', () => {
    expect(reviewPageRedirect('/review/nura-peptide-reviews')).toBe('/supplier/nura-peptide');
    expect(reviewPageRedirect('/review/amino-club-reviews/')).toBe('/supplier/amino-club');
  });

  it('sends the bare /review/<supplier> guess to the profile too', () => {
    expect(reviewPageRedirect('/review/nura-peptide')).toBe('/supplier/nura-peptide');
  });

  it('handles the old plural root in the same hop', () => {
    const path = '/reviews/nura-peptide-reviews';
    expect(reviewPageRedirect(singularPath(path) ?? path)).toBe('/supplier/nura-peptide');
  });

  it('leaves the /review index and unrelated paths alone', () => {
    expect(reviewPageRedirect('/review')).toBeNull();
    expect(reviewPageRedirect('/review/')).toBeNull();
    expect(reviewPageRedirect('/supplier/nura-peptide')).toBeNull();
    expect(reviewPageRedirect('/review/a/b')).toBeNull();
  });
});
