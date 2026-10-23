'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { BoxIcon, ExternalIcon } from '@/components/icons/icons';
import type { CatalogProduct, CatalogVariant } from '@/components/supplier-card/catalog-products';

/** The size a card opens on: the first one in stock, so a sold-out size never leads. */
function initialVariant(variants: readonly CatalogVariant[]): CatalogVariant {
  return variants.find((variant) => variant.inStock) ?? variants[0]!;
}

/**
 * One product in the "Buy peptides" rail: a floating vial, its sizes as
 * chips, and the chosen size's price with a button straight to that listing
 * on the supplier's site. `copy` marks the rail's second, duplicate loop,
 * which is hidden from assistive tech and the tab order.
 */
export function BuyPeptideCard({
  product,
  supplierName,
  couponPercentOff,
  copy = false,
}: {
  product: CatalogProduct;
  supplierName: string;
  couponPercentOff: number | null;
  copy?: boolean;
}) {
  const [selectedKey, setSelectedKey] = useState(() => initialVariant(product.variants).key);
  const variant = product.variants.find((candidate) => candidate.key === selectedKey) ?? product.variants[0]!;
  const tabIndex = copy ? -1 : undefined;

  return (
    <article className="card-3d group flex h-full flex-col rounded-card border border-line bg-surface-raised p-3">
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-chip bg-surface-sunken">
        <span className="absolute left-3 top-3 z-10 flex gap-1.5">
          {variant.couponApplied && couponPercentOff !== null ? (
            <span className="rounded-pill bg-brand px-2.5 py-1 font-mono text-micro font-bold uppercase tracking-wide text-surface">
              {couponPercentOff}% off
            </span>
          ) : null}
        </span>
        {variant.coaHref ? (
          <span className="absolute right-3 top-3 z-10 rounded-pill border border-accent/30 bg-accent-tint px-2.5 py-1 font-mono text-micro font-bold uppercase tracking-wide text-accent-strong">
            COA
          </span>
        ) : null}

        <div className="card-3d-layer relative flex h-full w-full items-center justify-center">
          {variant.imageUrl ? (
            <Image
              src={variant.imageUrl}
              alt={copy ? '' : `${product.name} from ${supplierName}`}
              width={200}
              height={200}
              className="vial-3d relative z-0 h-40 w-40 object-contain"
              unoptimized
              // Lazy loading misses images that slide into view on a moving track; there are only ten.
              loading="eager"
              referrerPolicy="no-referrer"
            />
          ) : (
            <BoxIcon className="vial-3d h-12 w-12 text-faint" />
          )}
          <span aria-hidden="true" className="vial-3d-shadow absolute bottom-2 h-3 w-28 rounded-pill" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-3">
        <h3 className="truncate text-lg font-black text-content">{product.name}</h3>

        {/* Every size on one line ("5mg · 10mg · 20mg"); each one switches the price and links below. */}
        <div
          role="group"
          aria-label={`${product.name} sizes`}
          className="scrollbar-hide mt-2 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-mono text-xs font-bold"
        >
          {product.variants.map((candidate, index) => {
            const isSelected = candidate.key === variant.key;
            return (
              <span key={candidate.key} className="flex shrink-0 items-center gap-1.5">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-faint">
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  tabIndex={tabIndex}
                  onClick={() => setSelectedKey(candidate.key)}
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-pill px-1.5 py-0.5 transition-colors',
                    isSelected ? 'bg-accent-tint text-accent-strong' : 'text-muted hover:text-accent-strong',
                    !candidate.inStock && !isSelected && 'text-faint line-through',
                  )}
                >
                  {candidate.optionLabel}
                  {candidate.inStock ? null : <span className="sr-only"> (out of stock)</span>}
                </button>
              </span>
            );
          })}
        </div>

        <div className="mt-auto border-t border-line pt-3">
          {variant.couponApplied ? (
            <p className="text-micro font-bold uppercase tracking-wide text-faint">Price after coupon</p>
          ) : null}
          <p className="text-xl font-black leading-tight text-content">{variant.priceText}</p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
            {variant.listPriceText ? <span className="text-faint line-through">{variant.listPriceText}</span> : null}
            <span className={cn('font-semibold', variant.inStock ? 'text-ok' : 'text-danger')}>
              {variant.inStock ? variant.perMgText : 'Out of stock'}
            </span>
          </p>
        </div>

        <div className={cn('mt-3 grid gap-2', variant.coaHref ? 'grid-cols-2' : 'grid-cols-1')}>
          <a
            href={variant.productUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            tabIndex={tabIndex}
            className="btn-3d inline-flex items-center justify-center gap-1.5 rounded-chip bg-brand px-3 py-2.5 text-sm font-bold text-surface"
          >
            Buy now
            <ExternalIcon className="h-3.5 w-3.5" />
            <span className="sr-only">
              : {product.name} {variant.optionLabel} at {supplierName} (affiliate link, opens in a new tab)
            </span>
          </a>
          {variant.coaHref ? (
            <a
              href={variant.coaHref}
              target="_blank"
              rel="nofollow noopener"
              tabIndex={tabIndex}
              className="inline-flex items-center justify-center rounded-chip border border-line bg-surface px-3 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
            >
              View COA
              <span className="sr-only">
                : {product.name} {variant.optionLabel} (opens in a new tab)
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
