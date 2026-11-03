import { describe, expect, it } from 'vitest';
import { starFills } from '@/components/ui/star-fill';

describe('starFills', () => {
  it('shows a 4.3 as four full stars and 30% of the fifth, never five', () => {
    expect(starFills(4.3)).toEqual([1, 1, 1, 1, 0.3]);
  });

  it('fills all five only at 5.0', () => {
    expect(starFills(5)).toEqual([1, 1, 1, 1, 1]);
    expect(starFills(4.9)).toEqual([1, 1, 1, 1, 0.9]);
  });

  it('clamps out-of-range and non-numeric scores', () => {
    expect(starFills(6)).toEqual([1, 1, 1, 1, 1]);
    expect(starFills(-2)).toEqual([0, 0, 0, 0, 0]);
    expect(starFills(Number.NaN)).toEqual([0, 0, 0, 0, 0]);
  });
});
