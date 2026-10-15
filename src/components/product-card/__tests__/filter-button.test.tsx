// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FilterButton } from '../filter-button';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

describe('FilterButton', () => {
  afterEach(() => {
    cleanup();
    replace.mockReset();
  });

  it('is a button, not a crawlable link', () => {
    render(
      <FilterButton href="/products/bpc-157?form=capsule" isSelected={false} className="chip">
        Capsule
      </FilterButton>,
    );
    expect(screen.getByRole('button', { name: 'Capsule' })).toHaveAttribute('type', 'button');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('reports whether it is the active filter', () => {
    render(
      <>
        <FilterButton href="/products/bpc-157" isSelected className="chip">
          Vial
        </FilterButton>
        <FilterButton href="/products/bpc-157?form=capsule" isSelected={false} className="chip">
          Capsule
        </FilterButton>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Vial' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Capsule' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('swaps the URL in place without scrolling, so the filtered view stays shareable', () => {
    render(
      <FilterButton href="/products/bpc-157?form=capsule" isSelected={false} className="chip">
        Capsule
      </FilterButton>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Capsule' }));
    expect(replace).toHaveBeenCalledWith('/products/bpc-157?form=capsule', { scroll: false });
  });
});
