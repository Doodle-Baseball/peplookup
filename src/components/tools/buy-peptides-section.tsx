import Link from 'next/link';
import { getAllOffers, getOffersForSupplier, getProducts, getSupplier } from '@/lib/repository';
import { groupCatalogProducts } from '@/components/supplier-card/catalog-products';
import { ArrowRightIcon, ExternalIcon } from '@/components/icons/icons';
import { StarRating } from '@/components/ui/star-rating';
import { CopyCode } from '@/components/ui/copy-code';
import { formatRating } from '@/lib/format';
import { ratingSourceLabel } from '@/lib/review-pages';
import { BuyPeptideCard } from './buy-peptide-card';

/** Products shown in the rail. */
const PRODUCT_COUNT = 10;

/** Compounds left out of the rail. */
const EXCLUDED_PRODUCT_SLUGS: ReadonlySet<string> = new Set(['nad']);

/**
 * "Buy peptides": a supplier's ten most widely stocked compounds (the ones
 * the most suppliers on the site carry), single vials only, as a full-width
 * scrolling row of product cards that link straight to each listing on the
 * supplier's own site. Renders nothing when the supplier is missing,
 * inactive or has nothing in stock.
 */
export async function BuyPeptidesSection({ supplierSlug, className }: { supplierSlug: string; className?: string }) {
  const [supplier, offers, products, marketOffers] = await Promise.all([
    getSupplier(supplierSlug),
    getOffersForSupplier(supplierSlug),
    getProducts(),
    getAllOffers(),
  ]);
  if (!supplier?.isActive) return null;

  const suppliersPerProduct = new Map<string, Set<string>>();
  for (const offer of marketOffers) {
    const sellers = suppliersPerProduct.get(offer.productSlug) ?? new Set<string>();
    sellers.add(offer.supplierSlug);
    suppliersPerProduct.set(offer.productSlug, sellers);
  }

  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  // Single vials only: no capsules, sprays or multi-vial kits.
  const singleVials = offers.filter(
    (offer) => offer.form === 'vial' && offer.vialCount === 1 && !EXCLUDED_PRODUCT_SLUGS.has(offer.productSlug),
  );
  const cards = groupCatalogProducts(singleVials, productsBySlug, supplier)
    .filter((product) => product.variants.some((variant) => variant.inStock))
    .sort(
      (a, b) =>
        (suppliersPerProduct.get(b.slug)?.size ?? 0) - (suppliersPerProduct.get(a.slug)?.size ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, PRODUCT_COUNT);
  if (cards.length === 0) return null;

  const couponPercentOff = supplier.coupon?.percentOff ?? null;

  return (
    <section aria-labelledby="buy-peptides-heading" className={`overflow-hidden py-5 sm:py-8 ${className ?? ''}`}>
      <div className="mx-auto flex max-w-shell flex-wrap items-end justify-between gap-4 px-4">
        <div className="min-w-0">
          <p className="eyebrow">Buy peptides</p>
          <h2 id="buy-peptides-heading" className="mt-3 text-2xl font-black leading-tight text-content sm:text-3xl lg:text-4xl">
            Buy Peptides from <span className="italic text-accent">{supplier.name}</span>
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {supplier.reviewRating !== null ? (
              <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-3 py-1.5 text-sm font-bold text-content">
                <StarRating rating={supplier.reviewRating} starClassName="h-4 w-4" />
                {formatRating(supplier.reviewRating)}
                <span className="font-semibold text-muted">on {ratingSourceLabel(supplier.reviewsUrl)}</span>
              </span>
            ) : null}
            {supplier.coupon ? (
              <span className="inline-flex items-center gap-2 text-sm font-bold text-content">
                {supplier.coupon.percentOff}% off with code
                <CopyCode code={supplier.coupon.code} className="px-3 py-1.5" />
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
          <a
            href={supplier.affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="btn-3d inline-flex items-center justify-center gap-1.5 rounded-chip bg-brand px-4 py-2.5 text-sm font-bold text-surface"
          >
            Shop {supplier.name}
            <ExternalIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">(affiliate link, opens in a new tab)</span>
          </a>
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="group/all inline-flex items-center justify-center gap-1.5 rounded-chip border border-line bg-surface-raised px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            View profile
            <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform group-hover/all:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Side padding, with a blur that fades the cards out as they reach each edge. */}
      <div className="relative mt-4 px-4 sm:px-8 lg:px-12">
        <div className="product-rail">
          <ul className="product-rail-track">
            {[false, true].flatMap((copy) =>
              cards.map((product) => (
                <li key={`${copy ? 'copy' : 'main'}-${product.key}`} className="product-rail-item" aria-hidden={copy || undefined}>
                  <BuyPeptideCard
                    product={product}
                    supplierName={supplier.name}
                    couponCode={supplier.coupon?.code ?? null}
                    couponPercentOff={couponPercentOff}
                    copy={copy}
                  />
                </li>
              )),
            )}
          </ul>
        </div>
        <span aria-hidden="true" className="product-rail-edge product-rail-edge-left" />
        <span aria-hidden="true" className="product-rail-edge product-rail-edge-right" />
      </div>
    </section>
  );
}
