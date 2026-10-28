// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SupplierSpotlight, type SpotlightSupplier } from '../supplier-spotlight';

const supplier: SpotlightSupplier = {
  slug: 'american-peptides',
  name: 'American Peptides',
  logoUrl: null,
  shopUrl: 'https://www.americanpeptides.us/peplookup',
  coupon: { code: 'peplookup', percentOff: 10 },
  rating: { value: 4.1, reviewCountText: '54', sourceName: 'Trustpilot', url: 'https://www.trustpilot.com/review/americanpeptides.us' },
};

describe('SupplierSpotlight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('slides in after 3 seconds with the coupon, rating and a sponsored shop link', () => {
    render(<SupplierSpotlight supplier={supplier} />);
    expect(screen.queryByRole('complementary')).toBeNull();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Recommended Supplier')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy code peplookup' })).toBeTruthy();
    // The score names no platform on screen; it stays on hover, for screen readers and in the link.
    const score = screen.getByRole('link', { name: '4.1 · 54 reviews on Trustpilot' });
    expect(score.getAttribute('title')).toBe('Rating on Trustpilot');
    expect(score.getAttribute('href')).toBe(supplier.rating?.url);
    expect(screen.getByRole('link', { name: 'American Peptides' }).getAttribute('href')).toBe('/suppliers/american-peptides');
    const shop = screen.getByRole('link', { name: /Shop American Peptides/ });
    expect(shop.getAttribute('href')).toBe(supplier.shopUrl);
    expect(shop.getAttribute('rel')).toContain('sponsored');
  });

  it('stays closed on the next visit after being dismissed', () => {
    const { unmount } = render(<SupplierSpotlight supplier={supplier} />);
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByRole('button', { name: 'Close featured supplier' }));
    expect(screen.queryByRole('complementary')).toBeNull();
    unmount();

    render(<SupplierSpotlight supplier={supplier} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});
