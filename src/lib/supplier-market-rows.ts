import { effectivePrice } from '@/lib/price';
import type { Cents, Currency } from '@/lib/money';
import type { Offer } from '@/lib/schema';
import { toListing } from '@/lib/supplier-facts';
import { compoundOrderIndex } from '@/config/compound-order';
import { NON_PEPTIDE_SLUGS } from '@/lib/dataset-export';

/**
 * One compound in "{Name} vs other suppliers": the supplier's single vial of
 * one size against other suppliers' single vials of exactly that size. Same
 * compound, same mg, same currency, so the vial prices compare directly.
 */
export interface SupplierMarketRow {
  productSlug: string;
  productName: string;
  /** "10mg". */
  sizeLabel: string;
  /** Micrograms in the vial, so size sorts by amount rather than by label. */
  vialMcg: number;
  /** The supplier's cheapest in-stock vial of this size, sale price when it has one. */
  price: Cents;
  currency: Currency;
  /** Median of each other supplier's cheapest in-stock vial of the same size, cents. */
  othersMedianPrice: number;
  /** Other suppliers selling this exact vial, the median's sample size. */
  othersCount: number;
}

/**
 * One vial, priced in mg: a multipack, a capsule bottle or a spray is a
 * different purchase and would not compare like for like.
 */
function isSingleMgVial(offer: Offer): boolean {
  return offer.inStock && offer.form === 'vial' && offer.vialCount === 1 && !NON_PEPTIDE_SLUGS.has(offer.productSlug);
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

/** Each supplier's cheapest price among the given listings. */
function cheapestPerSupplier(offers: readonly Offer[]): Map<string, Cents> {
  const cheapest = new Map<string, Cents>();
  for (const offer of offers) {
    const price = effectivePrice(toListing(offer));
    const current = cheapest.get(offer.supplierSlug);
    if (current === undefined || price < current) cheapest.set(offer.supplierSlug, price);
  }
  return cheapest;
}

/**
 * For each compound the supplier sells as a single in-stock vial, the vial
 * size the most other active suppliers also sell (the fairest comparison),
 * priced against those suppliers' vials of exactly that size. A size no other
 * supplier sells is never compared against a different size; a compound with
 * no matching vial anywhere else is left out. Ordered most-wanted first.
 */
export function supplierMarketRows({
  supplierSlug,
  marketOffers,
  activeSupplierSlugs,
  productNames,
}: {
  supplierSlug: string;
  marketOffers: readonly Offer[];
  activeSupplierSlugs: ReadonlySet<string>;
  productNames: ReadonlyMap<string, string>;
}): SupplierMarketRow[] {
  const comparable = marketOffers.filter(
    (offer) =>
      isSingleMgVial(offer) &&
      productNames.has(offer.productSlug) &&
      (offer.supplierSlug === supplierSlug || activeSupplierSlugs.has(offer.supplierSlug)),
  );
  const own = comparable.filter((offer) => offer.supplierSlug === supplierSlug);

  const rows: SupplierMarketRow[] = [];
  for (const productSlug of new Set(own.map((offer) => offer.productSlug))) {
    let best: SupplierMarketRow | null = null;
    const ownVials = own.filter((offer) => offer.productSlug === productSlug);
    for (const variant of new Set(ownVials.map((offer) => `${offer.vialSize}|${offer.currency}`))) {
      const ownOfSize = ownVials.filter((offer) => `${offer.vialSize}|${offer.currency}` === variant);
      const { vialSize, currency } = ownOfSize[0]!;
      const others = cheapestPerSupplier(
        comparable.filter(
          (offer) =>
            offer.supplierSlug !== supplierSlug &&
            offer.productSlug === productSlug &&
            offer.vialSize === vialSize &&
            offer.currency === currency,
        ),
      );
      if (others.size === 0) continue;
      const candidate: SupplierMarketRow = {
        productSlug,
        productName: productNames.get(productSlug)!,
        sizeLabel: `${vialSize / 1000}mg`,
        vialMcg: vialSize,
        price: cheapestPerSupplier(ownOfSize).get(supplierSlug)!,
        currency,
        othersMedianPrice: median([...others.values()]),
        othersCount: others.size,
      };
      const isBetter =
        best === null ||
        candidate.othersCount > best.othersCount ||
        (candidate.othersCount === best.othersCount && candidate.vialMcg < best.vialMcg);
      if (isBetter) best = candidate;
    }
    if (best) rows.push(best);
  }

  return rows.sort(
    (a, b) => compoundOrderIndex(a.productSlug) - compoundOrderIndex(b.productSlug) || a.productName.localeCompare(b.productName),
  );
}
