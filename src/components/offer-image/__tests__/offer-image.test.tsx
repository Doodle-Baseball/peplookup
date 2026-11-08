// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OfferImage } from '../offer-image';
import { offerImageAlt } from '../offer-image-alt';

afterEach(cleanup);

const PLACEHOLDER = <span data-testid="placeholder">No image</span>;

describe('OfferImage', () => {
  it('shows the picture, with its alt text, while it loads fine', () => {
    render(<OfferImage src="https://cdn.example/a.webp" alt="BPC-157 20 mg from IDUN Peptides" width={320} height={320} unoptimized fallback={PLACEHOLDER} />);
    expect(screen.getByRole('img', { name: 'BPC-157 20 mg from IDUN Peptides' })).toBeTruthy();
    expect(screen.queryByTestId('placeholder')).toBeNull();
  });

  it('swaps in the placeholder when the picture fails to load', () => {
    render(<OfferImage src="https://cdn.example/broken.webp" alt="BPC-157 20 mg from IDUN Peptides" width={320} height={320} unoptimized fallback={PLACEHOLDER} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('placeholder')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('gives a different picture its own chance after another one failed', () => {
    const { rerender } = render(<OfferImage src="https://cdn.example/broken.webp" alt="a" width={320} height={320} unoptimized fallback={PLACEHOLDER} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('placeholder')).toBeTruthy();

    rerender(<OfferImage src="https://cdn.example/other.webp" alt="b" width={320} height={320} unoptimized fallback={PLACEHOLDER} />);
    expect(screen.getByRole('img', { name: 'b' })).toBeTruthy();
    expect(screen.queryByTestId('placeholder')).toBeNull();
  });
});

describe('offerImageAlt', () => {
  it('reads "{product} {size} from {supplier}"', () => {
    expect(offerImageAlt('BPC-157 + TB-500', '20 mg', 'IDUN Peptides')).toBe('BPC-157 + TB-500 20 mg from IDUN Peptides');
  });
});
