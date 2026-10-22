'use client';

import { useMemo, useState } from 'react';
import { SearchIcon } from '@/components/icons/icons';
import { OfferVariantCard } from '@/components/offer-card/offer-variant-card';
import { CatalogPager } from './catalog-pager';
import type { CatalogProduct } from './catalog-products';

/** Product Catalog tiles per page, 3 rows of the 3-column grid. */
const CATALOG_PAGE_SIZE = 9;

/**
 * The catalogue's search box and product grid. Searching filters in the
 * browser and never touches the address bar; the Form and Size filters above
 * still narrow `products` on the server through the URL.
 */
export function SupplierCatalogBrowser({
  products,
  supplierName,
  couponCode,
  initialQuery,
  initialPage,
  noMatchSuffix,
  emptyFilteredMessage,
}: {
  products: readonly CatalogProduct[];
  supplierName: string;
  couponCode: string | null;
  /** From an old `?pq=` link, so those still open filtered. */
  initialQuery: string;
  initialPage: number;
  /** Appended to "No products match …", naming the active Form/Size filters. */
  noMatchSuffix: string;
  /** Shown when the Form/Size filters leave nothing, before any search. */
  emptyFilteredMessage: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const trimmedQuery = query.trim();
  const matching = useMemo(() => {
    const needle = trimmedQuery.toLowerCase();
    return needle ? products.filter((product) => product.name.toLowerCase().includes(needle)) : products;
  }, [products, trimmedQuery]);

  const pageCount = Math.max(1, Math.ceil(matching.length / CATALOG_PAGE_SIZE));
  // An old `?page=` link only applies to the list it was made for, not after a new search.
  const startPage = trimmedQuery === initialQuery.trim() ? Math.min(Math.max(1, initialPage), pageCount) : 1;

  return (
    <>
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
              No products match &ldquo;{trimmedQuery}&rdquo;{noMatchSuffix}.
            </>
          ) : (
            emptyFilteredMessage
          )}
        </p>
      ) : (
        <CatalogPager
          key={trimmedQuery}
          label="Product catalog pages"
          initialPage={startPage}
          pages={Array.from({ length: pageCount }, (_, pageIndex) => (
            <ul
              key={`${trimmedQuery}-${pageIndex + 1}`}
              className="animate-fade-up mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {matching.slice(pageIndex * CATALOG_PAGE_SIZE, (pageIndex + 1) * CATALOG_PAGE_SIZE).map((product) => (
                <OfferVariantCard
                  key={product.slug}
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
