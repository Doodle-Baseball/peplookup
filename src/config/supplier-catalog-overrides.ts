/**
 * Per-supplier exceptions to how the "Products from X" catalogue groups and
 * names listings. By default every product gets one card with its sizes and
 * packs as options; a supplier listed here can instead show each listing on
 * its own card, and/or show a product under its own brand name.
 */
export interface SupplierCatalogOverride {
  /** One card per listing instead of one card per product. */
  separateCards?: boolean;
  /** Product slug → the name this supplier's cards show for it. */
  productNames?: Readonly<Record<string, string>>;
}

export const SUPPLIER_CATALOG_OVERRIDES: Readonly<Record<string, SupplierCatalogOverride>> = {
  // Sells one product in five pack sizes, each its own item on the vendor's site.
  'hospira-bacteriostatic-water': {
    separateCards: true,
    productNames: { 'bacteriostatic-water': 'Hospira Bacteriostatic Water' },
  },
};
