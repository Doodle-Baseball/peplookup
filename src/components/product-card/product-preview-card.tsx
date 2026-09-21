'use client';

import Link from 'next/link';
import type { Product } from '@/lib/schema';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { ArrowRightIcon } from '@/components/icons/icons';
import { splitCategories } from '@/lib/categories';

/**
 * Lightweight product card for client-rendered contexts (the watchlist page)
 * that can't call the server-only repository to fetch live offers the way
 * the full ProductCard does. Links through to the full page for pricing.
 */
export function ProductPreviewCard({ product }: { product: Product }) {
  const blurb = product.description ?? product.summary;
  return (
    <article className="card-3d flex h-full flex-col gap-3 rounded-card border border-line bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/products/${product.slug}`} className="text-lg font-black text-content hover:text-brand">
            {product.name}
          </Link>
          {product.category ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {splitCategories(product.category).map((category) => (
                <span
                  key={category}
                  className="block w-fit rounded-pill border border-line bg-surface px-2.5 py-0.5 text-xs font-bold text-content"
                >
                  {category}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <FavoriteButton slug={product.slug} name={product.name} kind="product" />
      </div>

      {blurb ? <p className="line-clamp-2 text-sm text-muted">{blurb}</p> : null}

      <Link
        href={`/products/${product.slug}`}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-strong"
      >
        View prices
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
