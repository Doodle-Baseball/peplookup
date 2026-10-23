import Link from 'next/link';
import { getAllOffers, getOffersForSupplier, getProducts, getSupplier } from '@/lib/repository';
import { groupCatalogProducts } from '@/components/supplier-card/catalog-products';
import { ArrowRightIcon } from '@/components/icons/icons';
import { RESEARCH_USE_NOTICE } from '@/config/site';
import { BuyPeptideCard } from './buy-peptide-card';

/** Products shown in the rail. */
const PRODUCT_COUNT = 10;

/**
 * "Buy peptides": a supplier's ten most widely stocked compounds (the ones
 * the most suppliers on the site carry) as a scrolling row of product cards,
 * each linking to that listing on the supplier's own site. Renders nothing
 * when the supplier is missing, inactive or has nothing in stock.
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
  const cards = groupCatalogProducts(offers, productsBySlug, supplier)
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
    <section
      aria-labelledby="buy-peptides-heading"
      className={`overflow-hidden rounded-panel border border-line bg-surface-raised py-5 shadow-card sm:py-8 ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
        <div className="min-w-0">
          <p className="eyebrow">Buy peptides</p>
          <h2 id="buy-peptides-heading" className="mt-3 text-3xl font-black leading-tight text-content sm:text-4xl">
            Buy Peptides from <span className="italic text-accent">{supplier.name}</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            Its most popular research peptides, with live prices
            {supplier.coupon ? ` (the ${supplier.coupon.code} code already applied)` : ''} and the price per mg for
            each size.
          </p>
        </div>
        <Link
          href={`/suppliers/${supplier.slug}`}
          className="group/all inline-flex shrink-0 items-center gap-1.5 border-b border-content pb-1 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
        >
          View all products
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/all:translate-x-0.5" />
        </Link>
      </div>

      <div className="product-rail mt-4">
        <ul className="product-rail-track">
          {[false, true].flatMap((copy) =>
            cards.map((product) => (
              <li key={`${copy ? 'copy' : 'main'}-${product.key}`} className="product-rail-item" aria-hidden={copy || undefined}>
                <BuyPeptideCard
                  product={product}
                  supplierName={supplier.name}
                  couponPercentOff={couponPercentOff}
                  copy={copy}
                />
              </li>
            )),
          )}
        </ul>
      </div>

      <p className="mt-2 px-5 text-xs leading-6 text-faint sm:px-8">
        Buttons open the product on {supplier.name}&rsquo;s site through an affiliate link; we may earn a commission at
        no extra cost to you. {RESEARCH_USE_NOTICE}
      </p>
    </section>
  );
}
