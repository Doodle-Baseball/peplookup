// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { JumpToNav } from '../jump-to-nav';

describe('JumpToNav', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    // jsdom has neither; the nav only needs them to exist.
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, '', '/products/glow');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    scrollIntoView.mockReset();
  });

  it('scrolls to the section without adding a hash to the URL', () => {
    render(
      <>
        <JumpToNav items={[{ id: 'vendor-listings', label: 'Supplier Listings' }]} />
        <section id="vendor-listings" />
      </>,
    );

    const link = screen.getByRole('link', { name: 'Supplier Listings' });
    expect(link).toHaveAttribute('href', '#vendor-listings');

    fireEvent.click(link);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(window.location.pathname).toBe('/products/glow');
    expect(window.location.hash).toBe('');
  });
});
