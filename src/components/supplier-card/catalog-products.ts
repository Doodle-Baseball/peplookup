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
  /** One vial (or capsule, or bottle), for the catalogue's Size filter. */
  vialMcg: number;
  /** Short chip label: "5mg", or "10mg × 10" for a pack. */
  optionLabel: string;
  /** Size-chip label naming the unit: "10mg", or "10 mg · 3 vials" (bottles, capsules) for a pack. */
  chipLabel: string;
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
  /** Through the site's /go redirect, which counts the click. */
  buyHref: string;
  /** The listing's own URL on the supplier's site, for places that link straight to it. */
  productUrl: string;
}

export interface CatalogProduct {
  /** Unique per card: product, form and pack size, or the listing's key when a supplier shows listings on separate cards. */
  key: string;
  slug: string;
  name: string;
  compareHref: string;
  /** One form and one pack size per card, sorted by size. */
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
  // A single vial needs no unit; a single spray, pen or serum names its form, since it has its own card.
  if (offer.vialCount <= 1) return offer.form === 'vial' ? size : `${size} · ${FORM_LABELS[offer.form].toLowerCase()}`;
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

/** The pack's count unit, as on the compound pages: spray bottles, capsules, otherwise vials. */
const PACK_UNITS: Partial<Record<ProductForm, string>> = { spray: 'bottles', capsule: 'capsules' };

function chipLabel(offer: Offer): string {
  if (offer.vialCount <= 1) return `${(offer.vialSize / 1000).toLocaleString()}mg`;
  return `${mgLabel(offer.vialSize)} · ${offer.vialCount} ${PACK_UNITS[offer.form] ?? 'vials'}`;
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
    vialMcg: offer.vialSize,
    optionLabel: optionLabel(offer),
    chipLabel: chipLabel(offer),
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
    productUrl: offer.productUrl,
  };
}

/** Form, then single units before packs, then size, then pack count. */
function byFormThenSize(a: Offer, b: Offer): number {
  return (
    FORM_ORDER.indexOf(a.form) - FORM_ORDER.indexOf(b.form) ||
    Number(a.vialCount > 1) - Number(b.vialCount > 1) ||
    a.vialSize - b.vialSize ||
    a.vialCount - b.vialCount
  );
}

/**
 * One card per product and form: a product's single vials and its multi-vial
 * packs (e.g. 3-, 5- and 10-vial kits) share a card with every size as an
 * option, while its sprays and capsules get cards of their own. Cards keep
 * the order their listings first appear in, so the catalogue keeps its
 * running order. A supplier in SUPPLIER_CATALOG_OVERRIDES can show each
 * listing on its own card instead, and/or rename a product on its cards.
 */
export function groupCatalogProducts(
  offers: readonly Offer[],
  productsBySlug: ReadonlyMap<string, Pick<Product, 'slug' | 'name'>>,
  supplier: Pick<Supplier, 'slug' | 'coupon'>,
  now: Date = new Date(),
): CatalogProduct[] {
  const override = SUPPLIER_CATALOG_OVERRIDES[supplier.slug];
  const byCard = new Map<string, { product: Pick<Product, 'slug' | 'name'>; offers: Offer[] }>();
  for (const offer of offers) {
    const product = productsBySlug.get(offer.productSlug);
    if (!product) continue;
    // Separate-card suppliers split per listing below, after sorting the whole product by size.
    const cardKey = override?.separateCards ? product.slug : `${product.slug}-${offer.form}`;
    const group = byCard.get(cardKey) ?? { product, offers: [] };
    group.offers.push(offer);
    byCard.set(cardKey, group);
  }
  return [...byCard.entries()].flatMap(([cardKey, { product, offers: cardOffers }]) => {
    const card = {
      slug: product.slug,
      name: override?.productNames?.[product.slug] ?? product.name,
      compareHref: `/products/${product.slug}`,
    };
    const variants = [...cardOffers].sort(byFormThenSize).map((offer) => toVariant(offer, supplier, now));
    if (override?.separateCards) {
      return variants.map((variant) => ({ ...card, key: variant.key, variants: [variant] }));
    }
    return [{ ...card, key: cardKey, variants }];
  });
}
