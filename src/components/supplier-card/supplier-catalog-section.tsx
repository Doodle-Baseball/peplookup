import type { Offer, Product, Supplier } from '@/lib/schema';
import { BoxIcon } from '@/components/icons/icons';
import { CatalogFilterSelect } from './catalog-filter-select';
import { CATALOG_FORM_OPTIONS, isCatalogFormValue } from './catalog-form-options';
import { groupCatalogProducts } from './catalog-products';
import { SupplierCatalogBrowser } from './supplier-catalog-browser';

/** Same label the offer cards print, so a size reads identically in the filter and on the card. */
function formatVialSize(vialSizeMcg: number): string {
  return `${(vialSizeMcg / 1000).toLocaleString()} mg`;
}

/**
 * A vendor's "Products from X" catalogue: one card per product, with its
 * forms, sizes and packs as options on the card. The supplier profile, coupon
 * and reviews pages share this section. Search and paging happen in the
 * browser and don't touch the URL; the Form and Size filters do, so a filtered
 * view can still be shared.
 */
export function SupplierCatalogSection({
  supplier,
  offers,
  productsBySlug,
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
  /** Anchor id, so a page can link to the catalogue (e.g. from a jump-to bar). */
  id?: string;
  /** Starting search text, from an old `?pq=` link. */
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
    (o) => (!selectedForm || o.form === selectedForm) && (selectedSize === undefined || o.vialSize === selectedSize),
  );
  const catalogueProducts = groupCatalogProducts(catalogueOffers, productsBySlug, supplier);
  const filterKey = `${selectedForm ?? 'all'}-${selectedSize ?? 'all'}`;
  const filterSuffix = `${selectedForm ? ` in ${selectedForm} form` : ''}${selectedSize !== undefined ? ` at ${formatVialSize(selectedSize)}` : ''}`;

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
        <SupplierCatalogBrowser
          // A narrower Form/Size filter starts the grid again from its first page.
          key={filterKey}
          products={catalogueProducts}
          supplierName={supplier.name}
          couponCode={supplier.coupon?.code ?? null}
          initialQuery={query}
          initialPage={Number(pageParam) || 1}
          noMatchSuffix={filterSuffix}
          emptyFilteredMessage={`No ${selectedForm ? `${selectedForm} ` : ''}products${selectedSize !== undefined ? ` at ${formatVialSize(selectedSize)}` : ''} listed for ${supplier.name}.`}
        />
      )}
    </section>
  );
}
