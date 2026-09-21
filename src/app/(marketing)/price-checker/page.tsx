import type { Metadata } from 'next';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { buildCatalogueCards } from '@/lib/product-summary';
import { ProductBrowser } from '@/components/product-card/product-browser';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';

const PAGE = staticSeoPage('/price-checker');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

/**
 * Same catalogue and comparison UI as the homepage's browser, given its own
 * URL and heading, the "Price Checker" this site links to from the navbar
 * and footer, and the target of the nav dropdown's per-compound links.
 */
export default async function PriceCheckerPage() {
  const [products, suppliers, allOffers, seo] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getAllOffers(),
    getSeoOverride(PAGE.path),
  ]);
  const suppliersBySlug = new Map(suppliers.map((s) => [s.slug, s]));

  const { cards: cardData, facets } = await buildCatalogueCards(products, suppliersBySlug, allOffers);

  return (
    <>
      <div className="mx-auto max-w-shell px-4 pb-4 pt-12 text-center sm:pt-16">
        <h1 className="text-3xl font-black text-content sm:text-4xl">
          {seo?.h1 ? (
            seo.h1
          ) : (
            <>
              Price <span className="text-accent">Checker.</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Live per-mg pricing for every compound, normalised across every verified supplier so you
          can compare like for like.
        </p>
      </div>

      {cardData.length === 0 ? (
        <section className="mx-auto max-w-shell px-4 pb-10">
          <div className="rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No compounds listed yet.
          </div>
        </section>
      ) : (
        <ProductBrowser products={cardData} facets={facets} />
      )}
    </>
  );
}
