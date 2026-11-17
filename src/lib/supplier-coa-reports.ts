import type { Offer, Product } from '@/lib/schema';

/** The COA link a listing carries, with the same precedence /coas uses. */
export function coaUrlOf(offer: Offer): string | null {
  return offer.labReport?.reportUrl ?? offer.labReport?.labUrl ?? offer.coaUrl ?? null;
}

export interface SupplierCoaReport {
  key: string;
  productName: string;
  url: string;
  sizes: string[];
}

/**
 * The vendor's real COA documents, derived from its offers, with the same link
 * precedence /coas uses. Sizes sharing one document collapse into a single
 * entry. Offers whose product no longer resolves are skipped.
 */
export function supplierCoaReports(
  offers: readonly Offer[],
  productsBySlug: ReadonlyMap<string, Pick<Product, 'name'>>,
): SupplierCoaReport[] {
  const coaReportsByKey = new Map<
    string,
    { productName: string; url: string; sizes: Map<string, { vialSize: number; vialCount: number }> }
  >();
  for (const offer of offers) {
    const url = coaUrlOf(offer);
    const product = productsBySlug.get(offer.productSlug);
    if (!url || !product) continue;
    const key = `${offer.productSlug}|${url}`;
    const mg = offer.vialSize / 1000;
    const sizeLabel = offer.vialCount > 1 ? `${mg} mg × ${offer.vialCount}` : `${mg}mg`;
    const entry = coaReportsByKey.get(key) ?? { productName: product.name, url, sizes: new Map() };
    entry.sizes.set(sizeLabel, { vialSize: offer.vialSize, vialCount: offer.vialCount });
    coaReportsByKey.set(key, entry);
  }
  return [...coaReportsByKey.entries()]
    .map(([key, entry]) => ({
      key,
      productName: entry.productName,
      url: entry.url,
      sizes: [...entry.sizes.entries()]
        .sort(([, a], [, b]) => a.vialSize - b.vialSize || a.vialCount - b.vialCount)
        .map(([label]) => label),
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName));
}

/**
 * One COA per product. A link several different products share is the
 * vendor's general COA page, not a report on any one compound, so a product's
 * own report is preferred; among its own reports, the one covering the most
 * listed sizes. A product with only the general page keeps that link, as it
 * is still the only COA we hold for that compound.
 */
export function oneCoaPerProduct<T extends { productName: string; url: string; sizes: readonly string[] }>(
  reports: readonly T[],
): T[] {
  const productsByUrl = new Map<string, Set<string>>();
  for (const report of reports) {
    const products = productsByUrl.get(report.url) ?? new Set<string>();
    products.add(report.productName);
    productsByUrl.set(report.url, products);
  }
  const isGeneralPage = (url: string) => (productsByUrl.get(url)?.size ?? 0) > 1;
  const chosen = new Map<string, T>();
  for (const report of reports) {
    const current = chosen.get(report.productName);
    const isBetter =
      current === undefined ||
      (isGeneralPage(current.url) && !isGeneralPage(report.url)) ||
      (isGeneralPage(current.url) === isGeneralPage(report.url) && report.sizes.length > current.sizes.length);
    if (isBetter) chosen.set(report.productName, report);
  }
  // Kept in the incoming (alphabetical) order.
  return reports.filter((report) => chosen.get(report.productName) === report);
}
