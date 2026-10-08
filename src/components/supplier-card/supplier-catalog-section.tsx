import type { Offer, Product, Supplier } from '@/lib/schema';
import { OfferCard } from '@/components/offer-card/offer-card';
import { Pagination } from '@/components/ui/pagination';
import { LiveSearchInput } from '@/components/ui/live-search-input';
import { BoxIcon, SearchIcon } from '@/components/icons/icons';
import { CatalogFilterSelect } from './catalog-filter-select';
import { CATALOG_FORM_OPTIONS, isCatalogFormValue } from './catalog-form-options';

/** Product Catalog tiles per page, 2 rows of the 3-column grid. */
const CATALOG_PAGE_SIZE = 6;

/** Same label the offer cards print, so a size reads identically in the filter and on the card. */
function formatVialSize(vialSizeMcg: number): string {
  return `${(vialSizeMcg / 1000).toLocaleString()} mg`;
}

/**
 * A vendor's "Products from X" catalogue with in-page search and pagination.
 * `basePath` is the page it renders on, so the search form and page links stay
 * on that page, the supplier profile and its coupon page share this section.
 */
export function SupplierCatalogSection({
  supplier,
  offers,
  productsBySlug,
  basePath,
  id,
  query,
  pageParam,
  formParam,
  sizeParam,
  className,
}: {
  supplier: Supplier;
  /** Offers whose product resolves; the caller drops the rest. */
  offers: readonly Offer[];
  productsBySlug: ReadonlyMap<string, Product>;
  basePath: string;
  /** Anchor id, so a page can link to the catalogue (e.g. from a jump-to bar). */
  id?: string;
  query: string;
  pageParam: string | undefined;
  /** The `form` URL param; anything other than a known form shows every form. */
  formParam?: string;
  /** The `size` URL param, in micrograms per vial; a size this supplier doesn't list shows every size. */
  sizeParam?: string;
  className?: string;
}) {
  const selectedForm = isCatalogFormValue(formParam) ? formParam : undefined;
  // Every per-vial size this supplier lists, smallest first; a multipack files under its vial size.
  const vialSizes = [...new Set(offers.map((o) => o.vialSize))].sort((a, b) => a - b);
  const selectedSize = vialSizes.find((size) => String(size) === sizeParam);
  const catalogueOffers = offers.filter(
    (o) =>
      (!selectedForm || o.form === selectedForm) &&
      (selectedSize === undefined || o.vialSize === selectedSize) &&
      (!query || productsBySlug.get(o.productSlug)!.name.toLowerCase().includes(query.toLowerCase())),
  );

  const pageCount = Math.max(1, Math.ceil(catalogueOffers.length / CATALOG_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(pageParam) || 1), pageCount);
  const pagedOffers = catalogueOffers.slice((currentPage - 1) * CATALOG_PAGE_SIZE, currentPage * CATALOG_PAGE_SIZE);

  return (
    <section
      id={id}
      aria-labelledby="catalog-heading"
      className={`reveal scroll-mt-24 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8 ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Product catalog</p>
          <h2 id="catalog-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
            Products from <span className="text-accent">{supplier.name}.</span>
          </h2>
        </div>
        {offers.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <CatalogFilterSelect
              label="Form"
              paramName="form"
              options={CATALOG_FORM_OPTIONS.map((option) => ({
                ...option,
                count: offers.filter((o) => o.form === option.value).length,
              }))}
              value={selectedForm}
            />
            <CatalogFilterSelect
              label="Size"
              paramName="size"
              options={vialSizes.map((size) => ({
                value: String(size),
                label: formatVialSize(size),
                count: offers.filter((o) => o.vialSize === size).length,
              }))}
              value={selectedSize === undefined ? undefined : String(selectedSize)}
            />
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-tint px-3 py-1.5 text-sm font-bold text-accent-strong">
              <BoxIcon className="h-4 w-4" />
              {offers.length} listed
            </span>
          </div>
        ) : null}
      </div>

      {offers.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
          No prices recorded for {supplier.name} yet. Listings appear here once the crawler reads
          them from the supplier&rsquo;s live product pages.
        </p>
      ) : (
        <>
          <form action={basePath} className="mt-6">
            {selectedForm ? <input type="hidden" name="form" value={selectedForm} /> : null}
            {selectedSize !== undefined ? <input type="hidden" name="size" value={selectedSize} /> : null}
            <label htmlFor="pq" className="sr-only">
              Search within {supplier.name} catalog
            </label>
            <div className="search-field flex items-center gap-3 border px-4 py-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
              <LiveSearchInput
                id="pq"
                name="pq"
                defaultValue={query}
                placeholder={`Search within ${supplier.name} catalog`}
                className="min-w-0 flex-1 bg-transparent text-sm text-content outline-none placeholder:text-faint"
              />
            </div>
          </form>

          {catalogueOffers.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
              {query
                ? <>No products match &ldquo;{query}&rdquo;{selectedForm ? ` in ${selectedForm} form` : ''}{selectedSize !== undefined ? ` at ${formatVialSize(selectedSize)}` : ''}.</>
                : <>No {selectedForm} products{selectedSize !== undefined ? ` at ${formatVialSize(selectedSize)}` : ''} listed for {supplier.name}.</>}
            </p>
          ) : (
            <>
              <ul key={`${query}-${selectedForm ?? 'all'}-${selectedSize ?? 'all'}-${currentPage}`} className="animate-fade-up mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pagedOffers.map((offer: Offer) => (
                  <OfferCard
                    key={offer.id ?? `${offer.productSlug}-${offer.form}-${offer.vialSize}-${offer.vialCount}`}
                    offer={offer}
                    product={productsBySlug.get(offer.productSlug)!}
                    supplier={supplier}
                    headingEntity="product"
                    layout="grid"
                  />
                ))}
              </ul>

              <Pagination
                label="Product catalog pages"
                currentPage={currentPage}
                pageCount={pageCount}
                hrefForPage={(page) =>
                  `${basePath}?${new URLSearchParams({
                    ...(query ? { pq: query } : {}),
                    ...(selectedForm ? { form: selectedForm } : {}),
                    ...(selectedSize !== undefined ? { size: String(selectedSize) } : {}),
                    page: String(page),
                  })}`
                }
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
