'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { BoxIcon, SearchIcon } from '@/components/icons/icons';
import { OfferVariantCard } from '@/components/offer-card/offer-variant-card';
import { CatalogFilterSelect, type CatalogFilterOption } from './catalog-filter-select';
import { CatalogPager } from './catalog-pager';
import type { CatalogProduct } from './catalog-products';

/** Product Catalog tiles per page, 3 rows of the 3-column grid. */
const CATALOG_PAGE_SIZE = 9;

/**
 * The catalogue's heading row, Form and Size filters, search box and product
 * grid. Every filter runs in the browser and never touches the address bar.
 * A Size filter keeps only that size's options on each card; a card with none
 * left drops out.
 */
export function SupplierCatalogBrowser({
  heading,
  listedCount,
  products,
  formOptions,
  sizeOptions,
  initialForm,
  initialSize,
  supplierName,
  couponCode,
  initialQuery,
  initialPage,
}: {
  /** The section's eyebrow and h2, rendered on the server. */
  heading: ReactNode;
  listedCount: number;
  products: readonly CatalogProduct[];
  formOptions: readonly CatalogFilterOption[];
  /** Values are micrograms per vial. */
  sizeOptions: readonly CatalogFilterOption[];
  initialForm: string | undefined;
  initialSize: string | undefined;
  supplierName: string;
  couponCode: string | null;
  /** From an old `?pq=` link, so those still open filtered. */
  initialQuery: string;
  initialPage: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [form, setForm] = useState(initialForm);
  const [size, setSize] = useState(initialSize);
  const trimmedQuery = query.trim();

  const matching = useMemo(() => {
    const needle = trimmedQuery.toLowerCase();
    const sizeMcg = size === undefined ? undefined : Number(size);
    return products
      .map((product) => ({
        ...product,
        variants: product.variants.filter(
          (variant) => (!form || variant.form === form) && (sizeMcg === undefined || variant.vialMcg === sizeMcg),
        ),
      }))
      .filter((product) => product.variants.length > 0 && (!needle || product.name.toLowerCase().includes(needle)));
  }, [products, trimmedQuery, form, size]);

  const pageCount = Math.max(1, Math.ceil(matching.length / CATALOG_PAGE_SIZE));
  // An old `?page=` link only applies to the list it was made for, not after a new search or filter.
  const isInitialView = trimmedQuery === initialQuery.trim() && form === initialForm && size === initialSize;
  const startPage = isInitialView ? Math.min(Math.max(1, initialPage), pageCount) : 1;
  const viewKey = `${trimmedQuery}|${form ?? 'all'}|${size ?? 'all'}`;

  const formName = form ? formOptions.find((option) => option.value === form)?.label.toLowerCase() : undefined;
  const sizeName = size ? sizeOptions.find((option) => option.value === size)?.label : undefined;
  const filterSuffix = `${formName ? ` in ${formName} form` : ''}${sizeName ? ` at ${sizeName}` : ''}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        {heading}
        <div className="flex flex-wrap items-center gap-3">
          <CatalogFilterSelect label="Form" paramName="form" options={formOptions} value={form} onChange={setForm} />
          <CatalogFilterSelect label="Size" paramName="size" options={sizeOptions} value={size} onChange={setSize} />
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-tint px-3 py-1.5 text-sm font-bold text-accent-strong">
            <BoxIcon className="h-4 w-4" />
            {listedCount} listed
          </span>
        </div>
      </div>

      <form className="mt-6" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="pq" className="sr-only">
          Search within {supplierName} catalog
        </label>
        <div className="search-field flex items-center gap-3 border px-4 py-3">
          <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
          <input
            id="pq"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search within ${supplierName} catalog`}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-content outline-none placeholder:text-faint"
          />
        </div>
      </form>

      {matching.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
          {trimmedQuery ? (
            <>
              No products match &ldquo;{trimmedQuery}&rdquo;{filterSuffix}.
            </>
          ) : (
            `No ${formName ? `${formName} ` : ''}products${sizeName ? ` at ${sizeName}` : ''} listed for ${supplierName}.`
          )}
        </p>
      ) : (
        <CatalogPager
          key={viewKey}
          label="Product catalog pages"
          initialPage={startPage}
          pages={Array.from({ length: pageCount }, (_, pageIndex) => (
            <ul
              key={`${viewKey}-${pageIndex + 1}`}
              className="animate-fade-up mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {matching.slice(pageIndex * CATALOG_PAGE_SIZE, (pageIndex + 1) * CATALOG_PAGE_SIZE).map((product) => (
                <OfferVariantCard
                  // Keyed on the options too, so a narrower filter re-picks the card's opening option.
                  key={`${product.key}|${product.variants.length}`}
                  product={product}
                  supplierName={supplierName}
                  couponCode={couponCode}
                />
              ))}
            </ul>
          ))}
        />
      )}
    </>
  );
}
