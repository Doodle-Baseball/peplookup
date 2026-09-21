import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { buildCatalogueCards } from '@/lib/product-summary';
import { BoltIcon } from '@/components/icons/icons';
import { ProductBrowser } from '@/components/product-card/product-browser';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

/** Ticker copy for the marquee strip. Rendered twice so the loop is seamless. */
const TICKER: readonly string[] = [
  'Research use only',
  'Cost per mg, normalised',
  'COA-verified vendors',
  'Live price tracking',
  'No sponsored rankings',
];

/** Curated quick-link chips shown above the search bar, with hand-written captions. */
const FEATURED_QUICK_LINKS: readonly { slug: string; caption: string }[] = [
  { slug: 'bpc-157', caption: 'Best BPC-157 prices' },
  { slug: 'tb-500', caption: 'TB-500 comparison (COA)' },
  { slug: 'semaglutide', caption: 'Semaglutide pricing' },
  { slug: 'tirzepatide', caption: 'Tirzepatide tracker' },
  { slug: 'retatrutide', caption: 'Retatrutide prices' },
];

export default async function HomePage() {
  // Fetched once and shared across every card below, the whole point being
  // that this replaces what used to be a separate supplier lookup per offer,
  // per product.
  const [products, suppliers, allOffers, seo] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getAllOffers(),
    getSeoOverride(PAGE.path),
  ]);
  const suppliersBySlug = new Map(suppliers.map((s) => [s.slug, s]));

  // Skips any slug that isn't in the catalog rather than showing a broken link.
  const featured = FEATURED_QUICK_LINKS.flatMap(({ slug, caption }) => {
    const product = products.find((p) => p.slug === slug);
    return product ? [{ product, caption }] : [];
  });

  const { cards: cardData, facets } = await buildCatalogueCards(products, suppliersBySlug, allOffers);

  return (
    <>
      <section className="relative overflow-hidden">
        {/* pt-11 (44px) on mobile: 20px less than the pt-16 it replaces. */}
        <div className="mx-auto max-w-shell px-4 pb-10 pt-11 text-center sm:pt-20">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Live peptide price tracking
          </span>

          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[0.95] text-content">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Peptide Pricing <span className="text-accent">Comparison.</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Peptide price tracking and supplier verification for the modern researcher, normalised to
            cost per mg.
          </p>

          {featured.length > 0 ? (
            <div className="animate-fade-up animate-delay-300 mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3 sm:items-start">
              {featured.map(({ product, caption }) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className={`${product.slug === 'retatrutide' ? 'hidden sm:flex' : 'flex'} group w-[calc(50%-0.375rem)] min-w-0 flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto`}
                >
                  <span className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-chip border border-line bg-surface-raised px-2 py-2 text-center text-sm font-bold text-content shadow-sm transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white sm:w-auto sm:px-4">
                    <BoltIcon className="h-3.5 w-3.5 shrink-0 text-promo transition-colors group-hover:text-white" />
                    <span className="min-w-0 break-words sm:whitespace-nowrap">{product.name}</span>
                  </span>
                  <span className="text-center text-xs text-faint sm:text-left">{caption}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-10">
        <div className="marquee panel-dark rounded-bar py-4 shadow-panel">
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {TICKER.map((item) => (
                  <span
                    key={`${copy}-${item}`}
                    className="flex items-center whitespace-nowrap px-8 font-mono text-sm font-bold uppercase tracking-[0.18em] text-white/90"
                  >
                    {item}
                    <span className="ml-8 text-white/25">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {cardData.length === 0 ? (
        <section className="mx-auto max-w-shell px-4 pb-4">
          <div className="rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No compounds listed yet.
          </div>
        </section>
      ) : (
        <ProductBrowser products={cardData} facets={facets} />
      )}

      <section className="mx-auto max-w-shell px-4 pb-12">
        <PageFaqSection path="/" />
      </section>
    </>
  );
}
