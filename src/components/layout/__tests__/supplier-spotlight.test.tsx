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
    expect(screen.getByText(/Trustpilot 4\.1/)).toBeTruthy();
    const shop = screen.getByRole('link', { name: /Shop peptides now/ });
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
