import type { Offer, Product, ProductForm, Supplier } from '@/lib/schema';
import { toListing } from '@/lib/listing';
import { couponAdjustedPrice, effectivePrice, hasDiscount, pricePerMg, pricePerMgFor } from '@/lib/price';
import { formatMoney, formatPerMg } from '@/lib/money';
import { isStale, seenAgo } from '@/lib/format';
import { SUPPLIER_CATALOG_OVERRIDES } from '@/config/supplier-catalog-overrides';

/**
 * One option (form, size or pack) of a product in a supplier's catalogue, with
 * every figure already formatted, so the card only switches between them and
 * no price math runs in the browser.
 */
export interface CatalogVariant {
  key: string;
  form: ProductForm;
  formLabel: string;
  /** Short chip label: "5mg", or "10mg × 10" for a pack. */
  optionLabel: string;
  /** The card's full size line, e.g. "10 mg · pack of 10 vials". */
  sizeLabel: string;
  imageUrl: string | null;
  inStock: boolean;
  priceText: string;
  /** The undiscounted price, shown struck through when a sale price or coupon applies. */
  listPriceText: string | null;
  /** True when the price shown has the supplier's coupon applied. */
  couponApplied: boolean;
  perMgText: string;
  seenText: string;
  stale: boolean;
  coaHref: string | null;
  buyHref: string;
}

export interface CatalogProduct {
  /** Unique per card: the product slug, or the listing's key when a supplier shows listings on separate cards. */
  key: string;
  slug: string;
  name: string;
  compareHref: string;
  /** Sorted by form, then size, then pack count. */
  variants: CatalogVariant[];
}

const FORM_LABELS: Record<ProductForm, string> = {
  vial: 'Vial',
  capsule: 'Capsule',
  spray: 'Spray',
  kit: 'Kit',
  pen: 'Pen',
  serum: 'Serum',
};

const FORM_ORDER: readonly ProductForm[] = ['vial', 'capsule', 'spray', 'kit', 'pen', 'serum'];

/** Capsules per bottle; a capsule listing above this is a multi-bottle pack. */
const CAPSULES_PER_BOTTLE = 60;

function mgLabel(vialSizeMcg: number): string {
  return `${(vialSizeMcg / 1000).toLocaleString()} mg`;
}

/**
 * The size line. A pack names its unit: sprays come in bottles, and capsule
 * listings store mg per capsule with `vialCount` capsules, so a multi-bottle
 * pack (e.g. 600) reads as 60 capsules × 10 bottles.
 */
function sizeLabel(offer: Offer): string {
  const size = mgLabel(offer.vialSize);
  if (offer.vialCount <= 1) return size;
  if (offer.form === 'spray') return `${size} · pack of ${offer.vialCount} bottles`;
  if (offer.form === 'capsule') {
    const bottleCount = offer.vialCount / CAPSULES_PER_BOTTLE;
    return bottleCount > 1 && Number.isInteger(bottleCount)
      ? `${size} × ${CAPSULES_PER_BOTTLE} capsules · pack of ${bottleCount} bottles`
      : `${size} · ${offer.vialCount} capsules`;
  }
  if (offer.form === 'vial') return `${size} · pack of ${offer.vialCount} vials`;
  return `${size} · ${offer.vialCount} vials`;
}

function optionLabel(offer: Offer): string {
  const size = `${(offer.vialSize / 1000).toLocaleString()}mg`;
  return offer.vialCount > 1 ? `${size} × ${offer.vialCount}` : size;
}

function toVariant(offer: Offer, supplier: Pick<Supplier, 'coupon'>, now: Date): CatalogVariant {
  const listing = toListing(offer);
  const observedPrice = effectivePrice(listing);
  const observedDiscount = hasDiscount(listing);
  // Same rule as OfferCard: a coupon only steps in when there's no recorded
  // sale price, since a scraped price is a fact and a coupon is a rule.
  const couponPercentOff = !observedDiscount ? (supplier.coupon?.percentOff ?? null) : null;
  const price = couponPercentOff !== null ? couponAdjustedPrice(observedPrice, couponPercentOff) : observedPrice;
  const perMg = couponPercentOff !== null ? pricePerMgFor(price, listing) : pricePerMg(listing);
  return {
    key: offer.id ?? `${offer.productSlug}-${offer.form}-${offer.vialSize}-${offer.vialCount}`,
    form: offer.form,
    formLabel: FORM_LABELS[offer.form],
    optionLabel: optionLabel(offer),
    sizeLabel: sizeLabel(offer),
    imageUrl: offer.imageUrl,
    inStock: offer.inStock,
    priceText: formatMoney(price, listing.currency),
    listPriceText: observedDiscount || couponPercentOff !== null ? formatMoney(listing.listPrice, listing.currency) : null,
    couponApplied: couponPercentOff !== null,
    perMgText: perMg !== null ? formatPerMg(perMg, listing.currency) : 'Price per mg unavailable',
    seenText: seenAgo(offer.scrapedAt, now),
    stale: isStale(offer.scrapedAt, now),
    coaHref: offer.labReport?.reportUrl ?? offer.labReport?.labUrl ?? offer.coaUrl ?? null,
    buyHref: `/go?to=${encodeURIComponent(offer.productUrl)}`,
  };
}

function byFormThenSize(a: Offer, b: Offer): number {
  return FORM_ORDER.indexOf(a.form) - FORM_ORDER.indexOf(b.form) || a.vialSize - b.vialSize || a.vialCount - b.vialCount;
}

/**
 * One entry per product, each holding all of that product's listings as
 * options, in the order the listings first appear so the catalogue keeps its
 * existing running order. A supplier in SUPPLIER_CATALOG_OVERRIDES can show
 * each listing on its own card instead, and/or rename a product on its cards.
 */
export function groupCatalogProducts(
  offers: readonly Offer[],
  productsBySlug: ReadonlyMap<string, Pick<Product, 'slug' | 'name'>>,
  supplier: Pick<Supplier, 'slug' | 'coupon'>,
  now: Date = new Date(),
): CatalogProduct[] {
  const override = SUPPLIER_CATALOG_OVERRIDES[supplier.slug];
  const bySlug = new Map<string, { product: Pick<Product, 'slug' | 'name'>; offers: Offer[] }>();
  for (const offer of offers) {
    const product = productsBySlug.get(offer.productSlug);
    if (!product) continue;
    const group = bySlug.get(product.slug) ?? { product, offers: [] };
    group.offers.push(offer);
    bySlug.set(product.slug, group);
  }
  return [...bySlug.values()].flatMap(({ product, offers: productOffers }) => {
    const card = {
      slug: product.slug,
      name: override?.productNames?.[product.slug] ?? product.name,
      compareHref: `/products/${product.slug}`,
    };
    const variants = [...productOffers].sort(byFormThenSize).map((offer) => toVariant(offer, supplier, now));
    if (override?.separateCards) {
      return variants.map((variant) => ({ ...card, key: variant.key, variants: [variant] }));
    }
    return [{ ...card, key: product.slug, variants }];
  });
}
