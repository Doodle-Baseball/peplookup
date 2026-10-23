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
 * One product in the "Buy peptides" rail: a floating vial, its sizes as a
 * segmented control, and the chosen size's price with buttons straight to
 * that listing and its COA on the supplier's site. `copy` marks the rail's
 * second, duplicate loop, hidden from assistive tech and the tab order.
 */
export function BuyPeptideCard({
  product,
  supplierName,
  couponCode,
  couponPercentOff,
  copy = false,
}: {
  product: CatalogProduct;
  supplierName: string;
  couponCode: string | null;
  couponPercentOff: number | null;
  copy?: boolean;
}) {
  const [selectedKey, setSelectedKey] = useState(() => initialVariant(product.variants).key);
  const variant = product.variants.find((candidate) => candidate.key === selectedKey) ?? product.variants[0]!;
  const tabIndex = copy ? -1 : undefined;

  return (
    <article className="card-3d group flex h-full flex-col rounded-card border border-line bg-surface-raised p-3">
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-chip bg-surface-sunken">
        {variant.couponApplied && couponPercentOff !== null ? (
          <span className="absolute left-3 top-3 z-10 rounded-pill bg-brand px-2.5 py-1 font-mono text-micro font-bold uppercase tracking-wide text-surface">
            {couponPercentOff}% off
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

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="truncate text-lg font-black text-content">{product.name}</h3>

        {/* Sizes as a segmented control on one line; it scrolls sideways if a product has many. */}
        <div
          role="group"
          aria-label={`${product.name} sizes`}
          className="scrollbar-hide mt-2 flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-pill bg-surface-sunken p-0.5"
        >
          {product.variants.map((candidate) => {
            const isSelected = candidate.key === variant.key;
            return (
              <button
                key={candidate.key}
                type="button"
                tabIndex={tabIndex}
                onClick={() => setSelectedKey(candidate.key)}
                aria-pressed={isSelected}
                className={cn(
                  'shrink-0 rounded-pill px-2.5 py-1 font-mono text-xs font-bold transition-colors',
                  isSelected ? 'bg-surface-raised text-content shadow-card' : 'text-muted hover:text-content',
                  !candidate.inStock && !isSelected && 'text-faint line-through',
                )}
              >
                {candidate.optionLabel}
                {candidate.inStock ? null : <span className="sr-only"> (out of stock)</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-3">
          <div className="border-t border-line pt-3">
            {variant.couponApplied && couponCode ? (
              <p className="text-micro font-bold uppercase tracking-wide text-faint">With code {couponCode}</p>
            ) : null}
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span className="text-xl font-black leading-tight text-content">{variant.priceText}</span>
              {variant.listPriceText ? <span className="text-sm text-faint line-through">{variant.listPriceText}</span> : null}
            </p>
            <p className={cn('mt-0.5 text-xs font-semibold', variant.inStock ? 'text-ok' : 'text-danger')}>
              {variant.inStock ? variant.perMgText : 'Out of stock'}
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
      </div>
    </article>
  );
}
