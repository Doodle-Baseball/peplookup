import { describe, expect, it } from 'vitest';
import { fillVendorCount, fillVendorCountDeep } from '../vendor-count';

describe('fillVendorCount', () => {
  it('replaces every placeholder with the live count', () => {
    expect(fillVendorCount('Compare {vendorCount} suppliers; all {vendorCount} are tracked.', 90)).toBe(
      'Compare 90 suppliers; all 90 are tracked.',
    );
  });

  it('forgives case and inner spaces', () => {
    expect(fillVendorCount('{ VendorCount } and {vendor count}', 1200)).toBe('1,200 and 1,200');
  });

  it('leaves text without a placeholder untouched', () => {
    expect(fillVendorCount('Compare 23 compounds', 90)).toBe('Compare 23 compounds');
  });

  it('takes a stand-in word when the count is unavailable', () => {
    expect(fillVendorCount('across {vendorCount} suppliers', 'all')).toBe('across all suppliers');
    expect(fillVendorCount('vs. {otherVendorCount} other suppliers', 'all')).toBe('vs. all other suppliers');
  });

  it('counts every supplier but the page’s own for the "other suppliers" placeholder', () => {
    expect(fillVendorCount('{vendorCount} listed, {otherVendorCount} others', 90)).toBe('90 listed, 89 others');
  });
});

describe('fillVendorCountDeep', () => {
  it('fills strings inside nested objects and arrays without touching other values', () => {
    const filled = fillVendorCountDeep(
      { title: '{vendorCount} vendors', keywords: ['top {vendorCount}'], robotsIndex: true, h1: null },
      7,
    );
    expect(filled).toEqual({ title: '7 vendors', keywords: ['top 7'], robotsIndex: true, h1: null });
  });
});
