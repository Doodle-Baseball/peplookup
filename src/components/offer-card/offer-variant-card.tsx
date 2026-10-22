'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { BoxIcon, ExternalIcon } from '@/components/icons/icons';
import { CopyCode } from '@/components/ui/copy-code';
import type { CatalogProduct, CatalogVariant } from '@/components/supplier-card/catalog-products';

/** The option a card opens on: the first one in stock, so a sold-out size never leads. */
function initialVariant(variants: readonly CatalogVariant[]): CatalogVariant {
  return variants.find((variant) => variant.inStock) ?? variants[0]!;
}

function OptionChips({
  label,
  options,
  selectedKey,
  onSelect,
}: {
  label: string;
  options: readonly { key: string; text: string; inStock: boolean }[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <p className="text-micro font-bold uppercase text-faint">{label}</p>
      <div role="group" aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = option.key === selectedKey;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelect(option.key)}
              aria-pressed={isSelected}
              className={cn(
                'rounded-chip px-3 py-1.5 text-xs font-bold transition-colors',
                isSelected
                  ? 'bg-brand text-surface'
                  : 'border border-line bg-surface-raised text-content hover:border-accent hover:text-accent-strong',
                !option.inStock && !isSelected && 'text-faint line-through',
              )}
            >
              {option.text}
              {option.inStock ? null : <span className="sr-only"> (out of stock)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One product in a supplier's catalogue, with each of its forms, sizes and
 * packs as a selectable option. Picking one swaps the price, size, image,
 * stock, COA and buy link to that listing's own.
 */
export function OfferVariantCard({
  product,
  supplierName,
  couponCode,
}: {
  product: CatalogProduct;
  supplierName: string;
  couponCode: string | null;
}) {
  const [selectedKey, setSelectedKey] = useState(() => initialVariant(product.variants).key);
  const variant = product.variants.find((candidate) => candidate.key === selectedKey) ?? product.variants[0]!;

  const forms = [...new Set(product.variants.map((candidate) => candidate.form))];
  const formVariants = product.variants.filter((candidate) => candidate.form === variant.form);

  const selectForm = (form: string) => {
    const inForm = product.variants.filter((candidate) => candidate.form === form);
    setSelectedKey(initialVariant(inForm).key);
  };

  return (
    <li className="tilt-card group flex flex-col gap-3 rounded-card border border-line bg-surface p-4 hover:border-accent/40">
      <span className="flex h-44 w-full items-center justify-center overflow-hidden rounded-chip bg-surface-raised">
        {variant.imageUrl ? (
          <Image
            src={variant.imageUrl}
            alt={`${product.name} from ${supplierName}`}
            width={320}
            height={320}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
            unoptimized
            // Some vendors (e.g. GenX) refuse image requests that name another site as the referrer.
            referrerPolicy="no-referrer"
          />
        ) : (
          <BoxIcon className="h-10 w-10 text-faint transition-transform duration-200 group-hover:-translate-y-1 group-hover:text-accent" />
        )}
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={product.compareHref}
            className="block truncate text-base font-bold text-content transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted">
            <span className="font-semibold text-content">Size</span> {variant.sizeLabel}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-block rounded-pill bg-accent-tint px-2.5 py-1 text-sm font-black text-accent-strong">
            {variant.priceText}
          </span>
          {variant.listPriceText ? (
            <span className="mt-1 block text-xs text-faint line-through">{variant.listPriceText}</span>
          ) : null}
        </div>
      </div>

      {forms.length > 1 ? (
        <OptionChips
          label="Form"
          options={forms.map((form) => {
            const inForm = product.variants.filter((candidate) => candidate.form === form);
            return { key: form, text: inForm[0]!.formLabel, inStock: inForm.some((candidate) => candidate.inStock) };
          })}
          selectedKey={variant.form}
          onSelect={selectForm}
        />
      ) : null}

      {formVariants.length > 1 ? (
        <OptionChips
          label="Size"
          options={formVariants.map((candidate) => ({
            key: candidate.key,
            text: candidate.optionLabel,
            inStock: candidate.inStock,
          }))}
          selectedKey={variant.key}
          onSelect={setSelectedKey}
        />
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className={cn('flex items-center gap-1 text-xs font-semibold', variant.inStock ? 'text-ok' : 'text-danger')}>
          <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-pill', variant.inStock ? 'bg-ok' : 'bg-danger')} />
          {variant.inStock ? 'In stock' : 'Out of stock'}
        </p>
        {variant.couponApplied && couponCode ? (
          <CopyCode code={couponCode} className="gap-1 px-1.5 py-0.5 text-micro" />
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-xs', variant.stale ? 'font-semibold text-warn' : 'text-muted')}>
          {variant.perMgText} · seen {variant.seenText}
        </p>
        {variant.coaHref ? (
          <a
            href={variant.coaHref}
            target="_blank"
            rel="nofollow noopener"
            className="shrink-0 font-display text-xs text-accent-strong underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            View COA
          </a>
        ) : null}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
        <a
          href={variant.buyHref}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="btn-3d inline-flex items-center justify-center gap-1.5 rounded-chip bg-brand px-3 py-2.5 text-sm font-bold text-surface"
        >
          Buy now
          <ExternalIcon className="h-3.5 w-3.5" />
        </a>
        <Link
          href={product.compareHref}
          className="inline-flex items-center justify-center rounded-chip border border-line bg-surface-raised px-3 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
        >
          Compare
        </Link>
      </div>
    </li>
  );
}
