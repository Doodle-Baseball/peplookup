import { describe, expect, it } from 'vitest';
import { compareReviewVendors } from '../review-sort';

function vendor(name: string, over: Partial<{ rating: number | null; reviewCountValue: number; coaListingCount: number; productCount: number }> = {}) {
  return { name, rating: 4, reviewCountValue: 10, coaListingCount: 0, productCount: 10, ...over };
}

const names = (list: ReturnType<typeof vendor>[], sort: Parameters<typeof compareReviewVendors>[0]) =>
  [...list].sort(compareReviewVendors(sort)).map((item) => item.name);

describe('compareReviewVendors("coa")', () => {
  it('puts the highest share of COA-backed listings first, comparing exact fractions', () => {
    const list = [
      vendor('Half', { coaListingCount: 5, productCount: 10 }),
      vendor('Two thirds', { coaListingCount: 2, productCount: 3 }),
      vendor('All', { coaListingCount: 4, productCount: 4 }),
      // 667/1000 is a hair over 2/3, a difference rounding to a percent would hide.
      vendor('Just over two thirds', { coaListingCount: 667, productCount: 1000 }),
    ];
    expect(names(list, 'coa')).toEqual(['All', 'Just over two thirds', 'Two thirds', 'Half']);
  });

  it('sorts suppliers with no COA-backed listings last', () => {
    const list = [vendor('None', { rating: 5 }), vendor('Some', { rating: 3, coaListingCount: 1 })];
    expect(names(list, 'coa')).toEqual(['Some', 'None']);
  });

  it('breaks an equal share by rating, then review count, then name', () => {
    const list = [
      vendor('B', { coaListingCount: 10, rating: 4.5 }),
      vendor('A', { coaListingCount: 10, rating: 4.5 }),
      vendor('C', { coaListingCount: 10, rating: 4.9 }),
      vendor('D', { coaListingCount: 10, rating: 4.5, reviewCountValue: 99 }),
    ];
    expect(names(list, 'coa')).toEqual(['C', 'D', 'A', 'B']);
  });

  it('leaves the existing sorts unchanged', () => {
    const list = [vendor('Low', { rating: 3 }), vendor('High', { rating: 5 }), vendor('Unrated', { rating: null })];
    expect(names(list, 'rating')).toEqual(['High', 'Low', 'Unrated']);
    expect(names(list, 'name')).toEqual(['High', 'Low', 'Unrated']);
  });
});
