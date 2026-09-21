import 'server-only';
import { getOffersForProduct, toListing } from '@/lib/repository';
import { CARD_ROW_LIMIT, rowCountKey } from '@/lib/product-filters';
import { effectivePrice, hasDiscount, pricePerMg, couponAdjustedPrice, pricePerMgFor } from '@/lib/price';
import type { Offer, Product, ProductForm, Supplier } from '@/lib/schema';

export interface ProductCardRow {
  supplierSlug: string;
  supplierName: string;
  supplierLogo: string | null;
  form: ProductForm;
  inStock: boolean;
  listPriceCents: number;
  priceCents: number;
  currency: Offer['currency'];
  discounted: boolean;
  perMg: number | null;
  doseLabel: string;
  vialSize: number;
  hasLabReport: boolean;
  couponCode: string | null;
  productUrl: string;
}

export interface ProductCardData {
  slug: string;
  name: string;
  category: string | null;
  summary: string | null;
  isCompound: boolean;
  forms: readonly ProductForm[];
  doseLabels: readonly string[];
  vendorCount: number;
  supplierSlugs: readonly string[];
  supplierCountries: readonly string[];
  hasCoupon: boolean;
  anyInStock: boolean;
  minPriceCents: number | null;
  /**
   * Only the listings a card can actually reach: the cheapest few per form and
   * dose (see `trimRowsForCard`), not every offer the product has. A popular
   * compound carries hundreds of offers and the card shows at most
   * `CARD_ROW_LIMIT` of them at a time, so shipping the rest to the browser is
   * pure page weight.
   */
  rows: readonly ProductCardRow[];
  /** Untrimmed row counts, so the card's "+N more" link stays truthful. */
  rowCounts: {
    byForm: Record<string, number>;
    byFormDose: Record<string, number>;
  };
  totalOffers: number;
}

/** The order the card puts listings in: in stock first, then cheapest. */
function byCardOrder(a: ProductCardRow, b: ProductCardRow): number {
  if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
  return a.priceCents - b.priceCents;
}

/**
 * Keeps the rows a reader can actually surface and drops the rest.
 *
 * The card only ever lists the top `CARD_ROW_LIMIT` for the selected form and
 * dose, so keeping that many per (form, dose) group is enough to render every
 * selection identically. It also covers the card's initial state, where no dose
 * is picked and the top rows for the whole form are shown: a row in the form's
 * global top five is beaten by at most four others, so it is in its own dose
 * group's top five too.
 */
function trimRowsForCard(rows: readonly ProductCardRow[]): ProductCardRow[] {
  const groups = new Map<string, ProductCardRow[]>();
  for (const row of rows) {
    const key = rowCountKey(row.form, row.doseLabel);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const kept: ProductCardRow[] = [];
  for (const group of groups.values()) {
    if (group.length > CARD_ROW_LIMIT) group.sort(byCardOrder);
    for (const row of group.slice(0, CARD_ROW_LIMIT)) kept.push(row);
  }
  return kept;
}

function doseLabelFor(offer: Offer): string {
  const mg = offer.vialSize / 1000;
  return offer.vialCount > 1 ? `${mg} mg · ${offer.vialCount} vials` : `${mg}mg`;
}

/**
 * Flattens a Product plus its live offers into plain, filterable/sortable data
 * for the client card and grid. One row per offer (not collapsed per vendor)
 * so the card's own form/dose selector can filter down to an exact SKU, the
 * same way the full product page does.
 *
 * `suppliersBySlug` is fetched once by the caller (e.g. the homepage, ahead
 * of a `Promise.all` over every product) rather than looked up here per
 * offer, with N products each carrying M offers that turned an N×M fan-out
 * of individual supplier fetches into a single upfront query.
 */
export async function getProductCardData(
  product: Product,
  suppliersBySlug: ReadonlyMap<string, Supplier>,
  offersOverride?: readonly Offer[],
): Promise<ProductCardData> {
  const offers = offersOverride ?? (await getOffersForProduct(product.slug));
  const resolvedOffers = offers.filter((o) => suppliersBySlug.has(o.supplierSlug));

  const rows: ProductCardRow[] = resolvedOffers.map((offer) => {
    const supplier = suppliersBySlug.get(offer.supplierSlug)!;
    const listing = toListing(offer);
    const observedPrice = effectivePrice(listing);
    const observedDiscount = hasDiscount(listing);
    // A coupon only steps in when there's no already-recorded sale price: a
    // scraped price is a fact, a coupon is a rule, and the fact wins.
    const couponPercentOff = !observedDiscount ? (supplier.coupon?.percentOff ?? null) : null;
    const priceCents = couponPercentOff !== null ? couponAdjustedPrice(observedPrice, couponPercentOff) : observedPrice;
    return {
      supplierSlug: supplier.slug,
      supplierName: supplier.name,
      supplierLogo: supplier.logoUrl ?? supplier.faviconUrl,
      form: offer.form,
      inStock: offer.inStock,
      listPriceCents: listing.listPrice,
      priceCents,
      currency: offer.currency,
      discounted: observedDiscount || couponPercentOff !== null,
      perMg: couponPercentOff !== null ? pricePerMgFor(priceCents, listing) : pricePerMg(listing),
      doseLabel: doseLabelFor(offer),
      vialSize: offer.vialSize,
      hasLabReport: offer.labReport !== null || !!offer.coaUrl,
      couponCode: supplier.coupon?.code ?? null,
      productUrl: offer.productUrl,
    };
  });

  const prices = rows.map((r) => r.priceCents);

  // Every aggregate below is derived from the full row set, before trimming,
  // so the filters, facets and counts describe the whole catalogue even though
  // only the reachable rows travel to the browser.
  const byForm: Record<string, number> = {};
  const byFormDose: Record<string, number> = {};
  for (const row of rows) {
    byForm[row.form] = (byForm[row.form] ?? 0) + 1;
    const key = rowCountKey(row.form, row.doseLabel);
    byFormDose[key] = (byFormDose[key] ?? 0) + 1;
  }

  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    // The admin form's Description; older rows may only have the short summary.
    summary: product.description ?? product.summary,
    isCompound: product.isCompound,
    forms: [...new Set(rows.map((r) => r.form))],
    doseLabels: [...new Set(rows.map((r) => r.doseLabel))],
    vendorCount: new Set(rows.map((r) => r.supplierSlug)).size,
    supplierSlugs: [...new Set(rows.map((r) => r.supplierSlug))],
    supplierCountries: [
      ...new Set(
        resolvedOffers
          .map((o) => suppliersBySlug.get(o.supplierSlug)!.country)
          .filter((c): c is string => c !== null),
      ),
    ],
    hasCoupon: rows.some((r) => r.couponCode !== null),
    anyInStock: rows.some((r) => r.inStock),
    minPriceCents: prices.length ? Math.min(...prices) : null,
    rows: trimRowsForCard(rows),
    rowCounts: { byForm, byFormDose },
    totalOffers: resolvedOffers.length,
  };
}

export interface CatalogueFacet {
  value: string;
  label: string;
  count: number;
}

export interface CatalogueFacets {
  categoryFacets: CatalogueFacet[];
  supplierFacets: CatalogueFacet[];
  doseFacets: CatalogueFacet[];
}

/**
 * Card data for a whole catalogue, plus the filter facets that go with it.
 *
 * Offers are bucketed by product in a single pass rather than re-scanning the
 * full offer list once per product, and the facets are counted here, on the
 * server, where the untrimmed rows still exist. The browser then receives
 * finished facets instead of recomputing them from data it no longer holds.
 */
export async function buildCatalogueCards(
  products: readonly Product[],
  suppliersBySlug: ReadonlyMap<string, Supplier>,
  allOffers: readonly Offer[],
): Promise<{ cards: ProductCardData[]; facets: CatalogueFacets }> {
  const offersByProduct = new Map<string, Offer[]>();
  for (const offer of allOffers) {
    const bucket = offersByProduct.get(offer.productSlug);
    if (bucket) bucket.push(offer);
    else offersByProduct.set(offer.productSlug, [offer]);
  }

  const categoryCounts = new Map<string, number>();
  const supplierCounts = new Map<string, { name: string; count: number }>();
  const doseCounts = new Map<string, number>();

  const cards = await Promise.all(
    products.map(async (product) => {
      const offers = offersByProduct.get(product.slug) ?? [];
      const card = await getProductCardData(product, suppliersBySlug, offers);

      if (card.category) categoryCounts.set(card.category, (categoryCounts.get(card.category) ?? 0) + 1);
      for (const dose of card.doseLabels) doseCounts.set(dose, (doseCounts.get(dose) ?? 0) + 1);
      // Counted per offer, from the untrimmed set, matching what this facet has
      // always shown: how many listings a vendor has, not how many compounds.
      for (const offer of offers) {
        const supplier = suppliersBySlug.get(offer.supplierSlug);
        if (!supplier) continue;
        const existing = supplierCounts.get(supplier.slug);
        supplierCounts.set(supplier.slug, { name: supplier.name, count: (existing?.count ?? 0) + 1 });
      }

      return card;
    }),
  );

  const byCount = (a: CatalogueFacet, b: CatalogueFacet) => b.count - a.count;
  return {
    cards,
    facets: {
      categoryFacets: [...categoryCounts.entries()]
        .map(([value, count]) => ({ value, label: value, count }))
        .sort(byCount),
      supplierFacets: [...supplierCounts.entries()]
        .map(([value, { name, count }]) => ({ value, label: name, count }))
        .sort(byCount),
      doseFacets: [...doseCounts.entries()]
        .map(([value, count]) => ({ value, label: value, count }))
        .sort(byCount),
    },
  };
}
