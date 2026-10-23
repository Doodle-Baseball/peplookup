import type { Offer, Product, Supplier } from '@/lib/schema';
import { CATALOG_FORM_OPTIONS, isCatalogFormValue } from './catalog-form-options';
import { groupCatalogProducts } from './catalog-products';
import { SupplierCatalogBrowser } from './supplier-catalog-browser';

/** Same label the offer cards print, so a size reads identically in the filter and on the card. */
function formatVialSize(vialSizeMcg: number): string {
  return `${(vialSizeMcg / 1000).toLocaleString()} mg`;
}

/**
 * A vendor's "Products from X" catalogue: one card per product, form and pack
 * size, with sizes as options on the card. The supplier profile, coupon and
 * reviews pages share this section. Search, the Form and Size filters and
 * paging all happen in the browser and don't touch the URL; an old `?form=`,
 * `?size=` or `?pq=` link still opens filtered.
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
  /** Starting Form filter, from an old `?form=` link; anything other than a known form shows every form. */
  formParam?: string;
  /** Starting Size filter (micrograms per vial), from an old `?size=` link; a size this supplier doesn't list shows every size. */
  sizeParam?: string;
  className?: string;
}) {
  // Every per-vial size this supplier lists, smallest first; a multipack files under its vial size.
  const vialSizes = [...new Set(offers.map((o) => o.vialSize))].sort((a, b) => a - b);
  const initialSize = vialSizes.find((size) => String(size) === sizeParam);

  const heading = (
    <div>
      <p className="eyebrow">Product catalog</p>
      <h2 id="catalog-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
        Products from <span className="text-accent">{supplier.name}.</span>
      </h2>
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby="catalog-heading"
      className={`reveal scroll-mt-24 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8 ${className ?? ''}`}
    >
      {offers.length === 0 ? (
        <>
          {heading}
          <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
            No prices recorded for {supplier.name} yet. Listings appear here once the crawler reads
            them from the supplier&rsquo;s live product pages.
          </p>
        </>
      ) : (
        <SupplierCatalogBrowser
          heading={heading}
          listedCount={offers.length}
          products={groupCatalogProducts(offers, productsBySlug, supplier)}
          formOptions={CATALOG_FORM_OPTIONS.map((option) => ({
            ...option,
            count: offers.filter((o) => o.form === option.value).length,
          }))}
          sizeOptions={vialSizes.map((size) => ({
            value: String(size),
            label: formatVialSize(size),
            count: offers.filter((o) => o.vialSize === size).length,
          }))}
          initialForm={isCatalogFormValue(formParam) ? formParam : undefined}
          initialSize={initialSize === undefined ? undefined : String(initialSize)}
          supplierName={supplier.name}
          couponCode={supplier.coupon?.code ?? null}
          initialQuery={query}
          initialPage={Number(pageParam) || 1}
        />
      )}
    </section>
  );
}
