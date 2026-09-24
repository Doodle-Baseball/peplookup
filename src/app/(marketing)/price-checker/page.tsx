import type { Metadata } from 'next';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { buildCatalogueCards } from '@/lib/product-summary';
import { ProductBrowser } from '@/components/product-card/product-browser';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { site } from '@/config/site';

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
        <div className="mx-auto mt-6 max-w-2xl rounded-card border border-line bg-surface-raised p-5 shadow-card sm:p-6">
          <h2 className="text-center text-lg font-black text-content">
            Peptide <span className="text-accent">Price Checker</span>
          </h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted sm:text-base">
            Search for any compound below to see its per-milligram pricing across every tracked
            supplier. Use the sort and filter controls to narrow results by form, stock status,
            or price range. Every price links to the vendor&rsquo;s own product page where you
            can verify availability and purchase directly. {site.name} never handles the order.
          </p>
        </div>
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

      <div className="mx-auto max-w-shell px-4">
        <PageFaqSection path="/price-checker" className="mt-14 mb-10" />
      </div>
    </>
  );
}
