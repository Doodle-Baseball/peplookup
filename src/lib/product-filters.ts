import type { ProductCardData } from '@/lib/product-summary';
import type { ProductForm } from '@/lib/schema';
import type { FilterState, SortState } from '@/components/product-card/filter-sort-popup';

/**
 * Most listings a product card shows at once. Lives here rather than in
 * product-summary (which is server-only) because both the card that renders
 * the rows and the server that trims them have to agree on the number.
 */
export const CARD_ROW_LIMIT = 5;

/** Key for the untrimmed per-form-and-dose counts carried on card data. */
export function rowCountKey(form: ProductForm, doseLabel: string): string {
  return `${form}|${doseLabel}`;
}

export function matchesFilter(
  p: ProductCardData,
  filter: FilterState,
  likedSlugs: readonly string[],
): boolean {
  if (filter.inStockOnly && !p.anyInStock) return false;
  if (filter.blendsOnly && p.isCompound) return false;
  if (filter.likesOnly && !likedSlugs.includes(p.slug)) return false;
  if (filter.usOnly && !p.supplierCountries.includes('United States')) return false;
  if (filter.hasCoupon && !p.hasCoupon) return false;
  if (filter.categories.length > 0 && (!p.category || !filter.categories.includes(p.category))) return false;
  if (filter.suppliers.length > 0 && !p.supplierSlugs.some((s) => filter.suppliers.includes(s))) return false;
  if (filter.doses.length > 0 && !p.doseLabels.some((d) => filter.doses.includes(d))) return false;

  const min = filter.priceMin ? Math.round(Number(filter.priceMin) * 100) : null;
  const max = filter.priceMax ? Math.round(Number(filter.priceMax) * 100) : null;
  if (min !== null || max !== null) {
    if (p.minPriceCents === null) return false;
    if (min !== null && p.minPriceCents < min) return false;
    if (max !== null && p.minPriceCents > max) return false;
  }
  return true;
}

export function sortProducts(
  products: ProductCardData[],
  sortBy: SortState['sortBy'],
): ProductCardData[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'featured':
      // Already ordered by `position` upstream (see lib/display-order.ts);
      // re-sorting here would throw away the order set in the admin.
      break;
    case 'price-asc':
      sorted.sort((a, b) => (a.minPriceCents ?? Infinity) - (b.minPriceCents ?? Infinity));
      break;
    case 'price-desc':
      sorted.sort((a, b) => (b.minPriceCents ?? -Infinity) - (a.minPriceCents ?? -Infinity));
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
  return sorted;
}

export function countActiveFilters(filter: FilterState): number {
  return (
    Number(filter.inStockOnly) +
    Number(filter.blendsOnly) +
    Number(filter.likesOnly) +
    Number(filter.usOnly) +
    Number(filter.hasCoupon) +
    filter.categories.length +
    filter.suppliers.length +
    filter.doses.length +
    Number(Boolean(filter.priceMin)) +
    Number(Boolean(filter.priceMax))
  );
}
