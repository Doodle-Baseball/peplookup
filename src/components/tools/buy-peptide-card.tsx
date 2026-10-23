'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ArrowRightIcon, BoxIcon } from '@/components/icons/icons';
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
      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-chip bg-surface-sunken">
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
              width={180}
              height={180}
              className="vial-3d relative z-0 h-36 w-36 object-contain"
              unoptimized
              // Lazy loading misses images that slide into view on a moving track; there are only ten.
              loading="eager"
              referrerPolicy="no-referrer"
            />
          ) : (
            <BoxIcon className="vial-3d h-12 w-12 text-faint" />
          )}
          <span aria-hidden="true" className="vial-3d-shadow absolute bottom-5 h-4 w-28 rounded-pill" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <h3 className="truncate text-lg font-black text-content">{product.name}</h3>

        {product.variants.length > 1 ? (
          <div role="group" aria-label={`${product.name} sizes`} className="mt-3 flex flex-wrap gap-1.5">
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
                    'rounded-pill border px-2.5 py-1 font-mono text-xs font-bold transition-colors',
                    isSelected
                      ? 'border-accent/40 bg-accent-tint text-accent-strong'
                      : 'border-line bg-surface text-muted hover:border-accent hover:text-accent-strong',
                    !candidate.inStock && !isSelected && 'text-faint line-through',
                  )}
                >
                  {candidate.optionLabel}
                  {candidate.inStock ? null : <span className="sr-only"> (out of stock)</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 font-mono text-xs font-bold text-muted">{variant.optionLabel}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              {variant.listPriceText ? (
                <span className="text-xs text-faint line-through">{variant.listPriceText}</span>
              ) : null}
              <span className="text-xl font-black text-content">{variant.priceText}</span>
            </p>
            <p className={cn('text-xs font-semibold', variant.inStock ? 'text-ok' : 'text-danger')}>
              {variant.inStock ? variant.perMgText : 'Out of stock'}
            </p>
          </div>
          <a
            href={variant.buyHref}
            target="_blank"
            rel="nofollow sponsored noopener"
            tabIndex={tabIndex}
            aria-label={`Buy ${product.name} ${variant.optionLabel} at ${supplierName}`}
            className="btn-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-brand text-surface"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
