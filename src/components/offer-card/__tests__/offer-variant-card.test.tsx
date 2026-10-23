// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OfferVariantCard } from '../offer-variant-card';
import type { CatalogProduct, CatalogVariant } from '@/components/supplier-card/catalog-products';

function variant(over: Partial<CatalogVariant>): CatalogVariant {
  return {
    key: 'v',
    form: 'vial',
    formLabel: 'Vial',
    vialMcg: 5000,
    optionLabel: '5mg',
    sizeLabel: '5 mg',
    imageUrl: null,
    inStock: true,
    priceText: '$54.00',
    listPriceText: '$60.00',
    couponApplied: true,
    perMgText: '$10.800/mg',
    seenText: '2d ago',
    stale: false,
    coaHref: 'https://lab.example/5mg.pdf',
    buyHref: '/go?to=5mg',
    productUrl: 'https://vendor.example/5mg',
    ...over,
  };
}

const PRODUCT: CatalogProduct = {
  key: 'bpc-157',
  slug: 'bpc-157',
  name: 'BPC-157',
  compareHref: '/products/bpc-157',
  variants: [
    variant({ key: 'a', optionLabel: '5mg' }),
    variant({
      key: 'b',
      optionLabel: '10mg × 10',
      sizeLabel: '10 mg · pack of 10 vials',
      priceText: '$620.00',
      listPriceText: '$720.00',
      perMgText: '$6.20/mg',
      coaHref: 'https://lab.example/10mg.pdf',
      buyHref: '/go?to=kit',
    }),
    variant({ key: 'c', optionLabel: '15mg', inStock: false, priceText: '$90.00', coaHref: null, buyHref: '/go?to=15mg' }),
    variant({ key: 'd', form: 'spray', formLabel: 'Spray', optionLabel: '5mg', sizeLabel: '5 mg', priceText: '$70.00', buyHref: '/go?to=spray' }),
  ],
};

function renderCard(product: CatalogProduct = PRODUCT) {
  render(
    <ul>
      <OfferVariantCard product={product} supplierName="Acme" couponCode="PEPLOOKUP" />
    </ul>,
  );
}

describe('OfferVariantCard', () => {
  afterEach(cleanup);

  it('shows one card with the first in-stock option selected', () => {
    renderCard();
    expect(screen.getByText('$54.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5mg' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /buy now/i })).toHaveAttribute('href', '/go?to=5mg');
  });

  it('switches price, size, COA and buy link to the chosen option', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: '10mg × 10' }));
    expect(screen.getByText('$620.00')).toBeInTheDocument();
    expect(screen.getByText('$720.00')).toBeInTheDocument();
    expect(screen.getByText('10 mg · pack of 10 vials')).toBeInTheDocument();
    expect(screen.getByText(/\$6\.20\/mg · seen 2d ago/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View COA' })).toHaveAttribute('href', 'https://lab.example/10mg.pdf');
    expect(screen.getByRole('link', { name: /buy now/i })).toHaveAttribute('href', '/go?to=kit');
  });

  it('says when the chosen option is out of stock and hides a COA it does not have', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /15mg/ }));
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View COA' })).not.toBeInTheDocument();
  });

  it('switches form and shows only that form’s sizes', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Spray' }));
    expect(screen.getByText('$70.00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /buy now/i })).toHaveAttribute('href', '/go?to=spray');
    // A single spray size needs no size chips.
    expect(screen.queryByRole('group', { name: 'Size' })).not.toBeInTheDocument();
  });

  it('shows no option chips for a product with a single listing', () => {
    renderCard({ ...PRODUCT, variants: [PRODUCT.variants[0]!] });
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });
});
