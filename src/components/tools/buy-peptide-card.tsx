'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    <article className="card-3d group flex h-full flex-col rounded-card border border-line bg-surface p-3">
      {/* About two thirds of the card: a white stage the vial fills, as on a product page. */}
      <div className="relative h-96 overflow-hidden rounded-chip bg-surface-raised">
        {/* Top padding leaves room for the vial cap as it floats up. */}
        <div className="card-3d-layer relative flex h-full w-full items-center justify-center pb-2 pt-5">
          {variant.imageUrl ? (
            <Image
              src={variant.imageUrl}
              alt={copy ? '' : `${product.name} from ${supplierName}`}
              width={320}
              height={320}
              className="vial-3d relative z-0 h-full w-full object-cover"
              unoptimized
              // Lazy loading misses images that slide into view on a moving track; there are only ten.
              loading="eager"
              referrerPolicy="no-referrer"
            />
          ) : (
            <BoxIcon className="vial-3d h-12 w-12 text-faint" />
          )}
          <span aria-hidden="true" className="vial-3d-shadow absolute bottom-3 h-3 w-32 rounded-pill" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="truncate text-lg font-black text-content">{product.name}</h3>

        {product.variants.length > 1 ? (
          // One row that scrolls sideways, so a product with many sizes doesn't make every card in the rail taller.
          <div role="group" aria-label={`${product.name} sizes`} className="scrollbar-hide mt-2 flex gap-1.5 overflow-x-auto">
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
                    'shrink-0 rounded-pill border px-2.5 py-1 font-mono text-xs font-bold transition-colors',
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
          <p className="mt-2 font-mono text-xs font-bold text-muted">{variant.optionLabel}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span className="text-xl font-black leading-tight text-content">{variant.priceText}</span>
              {variant.couponApplied && couponPercentOff !== null ? (
                <span className="rounded-pill bg-brand px-2 py-0.5 font-mono text-micro font-bold uppercase tracking-wide text-surface">
                  {couponPercentOff}% off
                </span>
              ) : null}
            </p>
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
              {variant.listPriceText ? <span className="text-faint line-through">{variant.listPriceText}</span> : null}
              <span className={cn('font-semibold', variant.inStock ? 'text-ok' : 'text-danger')}>
                {variant.inStock ? variant.perMgText : 'Out of stock'}
              </span>
            </p>
          </div>
          {variant.coaHref ? (
            <a
              href={variant.coaHref}
              target="_blank"
              rel="nofollow noopener"
              tabIndex={tabIndex}
              aria-label={`View the ${product.name} ${variant.optionLabel} COA`}
              className="shrink-0 rounded-pill border border-accent/30 bg-accent-tint px-2.5 py-1 font-mono text-micro font-bold uppercase tracking-wide text-accent-strong transition-colors hover:border-accent"
            >
              View COA
            </a>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={variant.buyHref}
            target="_blank"
            rel="nofollow sponsored noopener"
            tabIndex={tabIndex}
            aria-label={`Buy now: ${product.name} ${variant.optionLabel} at ${supplierName}`}
            className="btn-3d inline-flex items-center justify-center gap-1.5 rounded-chip bg-brand px-3 py-2.5 text-sm font-bold text-surface"
          >
            Buy now
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
          <Link
            href={product.compareHref}
            tabIndex={tabIndex}
            aria-label={`Compare ${product.name} prices across suppliers`}
            className="inline-flex items-center justify-center rounded-chip border border-line bg-surface-raised px-3 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            Compare
          </Link>
        </div>
      </div>
    </article>
  );
}
