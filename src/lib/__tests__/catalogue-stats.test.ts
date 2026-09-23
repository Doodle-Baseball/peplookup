import { describe, expect, it } from 'vitest';
import { catalogueStats, moreThanFloor } from '../catalogue-stats';

describe('catalogueStats', () => {
  it('counts only listings from suppliers still in the directory', () => {
    const stats = catalogueStats(
      [{ slug: 'alpha' }, { slug: 'beta' }],
      [
        { supplierSlug: 'alpha', productSlug: 'bpc-157' },
        { supplierSlug: 'alpha', productSlug: 'tb-500' },
        { supplierSlug: 'beta', productSlug: 'bpc-157' },
        { supplierSlug: 'delisted', productSlug: 'nad' },
      ],
    );
    expect(stats).toEqual({ supplierCount: 2, listingCount: 3, compoundCount: 2 });
  });
});

describe('moreThanFloor', () => {
  it('always returns a number strictly below the count', () => {
    expect(moreThanFloor(2830)).toBe(2800);
    expect(moreThanFloor(2800)).toBe(2700);
    expect(moreThanFloor(2801)).toBe(2800);
    expect(moreThanFloor(455)).toBe(450);
    expect(moreThanFloor(450)).toBe(440);
  });

  it('states small counts exactly', () => {
    expect(moreThanFloor(0)).toBeNull();
    expect(moreThanFloor(20)).toBeNull();
  });
});
