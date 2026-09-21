// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WatchlistContent } from '../watchlist-content';

/**
 * Reproduces "I favorited a compound but it doesn't show on /watchlist":
 * seeds localStorage exactly as FavoriteButton would, mocks the two fetches
 * WatchlistContent makes, and asserts the saved compound actually renders.
 */
describe('WatchlistContent', () => {
  const product = {
    slug: 'bpc-157',
    name: 'BPC-157',
    category: 'Healing',
    summary: null,
    aliases: [],
    forms: [],
    intakeTypes: [],
    typicalDose: null,
    cycle: null,
    storage: null,
    images: [],
    isCompound: true,
    description: null,
    purposePills: [],
    research: {
      benefitsTitle: null,
      benefitsIntro: null,
      benefits: [],
      dosageTitle: null,
      dosageIntro: null,
      route: null,
      exampleRange: null,
      frequency: null,
      timing: null,
      evidenceTitle: null,
      evidenceIntro: null,
      evidence: [],
      interactionsTitle: null,
      interactions: [],
      faq: [],
    },
    primarySupplierSlug: null,
    coaUrl: null,
  };

  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('peplookup:watchlist', JSON.stringify([{ kind: 'product', slug: 'bpc-157' }]));
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        // Only a product is saved, so the component should never ask for
        // suppliers at all, a request there would be a real regression.
        if (url.startsWith('/api/suppliers')) throw new Error(`Unexpected fetch: ${url}`);
        if (url.startsWith('/api/products?slugs=bpc-157')) return new Response(JSON.stringify([product]));
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a compound saved from the product page', async () => {
    render(<WatchlistContent />);

    await waitFor(() => expect(screen.getByText('BPC-157')).toBeInTheDocument());
    expect(screen.queryByText('Your watchlist is empty')).not.toBeInTheDocument();
  });
});
