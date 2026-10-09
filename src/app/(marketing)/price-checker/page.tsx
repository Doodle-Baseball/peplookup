import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { buildCatalogueCards } from '@/lib/product-summary';
import { ProductBrowser } from '@/components/product-card/product-browser';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { site } from '@/config/site';
import { AccentedHeading } from '@/components/ui/accented-heading';

const PAGE = staticSeoPage('/price-checker');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

/** Shared by every guide panel below the catalogue, matching the FAQ panel under them. */
const GUIDE_PANEL_CLASS = 'mt-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8';
const GUIDE_HEADING_CLASS = 'mt-3 text-3xl font-black leading-tight text-content sm:text-4xl';
const GUIDE_TEXT_CLASS = 'text-sm leading-7 text-muted sm:text-base';

/** "How to Use" steps; the filters named are the ones the Filter & Sort panel really has. */
const USAGE_STEPS: readonly { title: string; detail: string }[] = [
  {
    title: 'Search a compound.',
    detail: 'Type a name such as BPC-157, TB-500 or tirzepatide, or tap a popular shortcut.',
  },
  {
    title: 'Filter the list.',
    detail: 'Narrow by category, supplier, dose, stock status or price range.',
  },
  {
    title: 'Compare cost per mg.',
    detail:
      "Each supplier's listing is converted to price per mg so different vial sizes line up. Click through to the supplier's own site to see the current price.",
  },
];

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
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Live per-mg pricing
        </span>

        <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
          {seo?.h1 ? (
            <AccentedHeading text={seo.h1} />
          ) : (
            <>
              Price <span className="text-accent">Checker.</span>
            </>
          )}
        </h1>
        <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Compare peptide prices per mg across listed suppliers, normalized so you can compare like for like.
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

      <div className="mx-auto max-w-shell px-4">
        {/* Same panel, eyebrow and heading treatment as the homepage explainer and the FAQs below. */}
        <section
          aria-labelledby="price-checker-guide-heading"
          className="mt-14 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">How it works</p>
              <h2
                id="price-checker-guide-heading"
                className="mt-3 text-3xl font-black leading-tight text-content sm:text-4xl"
              >
                Peptide Price <span className="italic text-accent">Checker</span>
              </h2>
            </div>
            <p className="text-sm leading-7 text-muted sm:text-base lg:col-span-2">
              Search for any compound below to see its per-milligram pricing across every tracked
              supplier. Use the sort and filter controls to narrow results by form, stock status,
              or price range. Every price links to the supplier&rsquo;s own product page where you
              can verify availability and purchase directly. {site.name} never handles the order.
            </p>
          </div>
        </section>

        <section aria-labelledby="price-checker-usage-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Step by step</p>
              <h2 id="price-checker-usage-heading" className={GUIDE_HEADING_CLASS}>
                How to Use the Peptide Price <span className="italic text-accent">Checker</span>
              </h2>
            </div>
            <ol className="space-y-4 lg:col-span-2">
              {USAGE_STEPS.map(({ title, detail }, index) => (
                <li key={title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-accent-tint text-sm font-black text-accent-strong"
                  >
                    {index + 1}
                  </span>
                  <p className={GUIDE_TEXT_CLASS}>
                    <strong className="font-bold text-content">{title}</strong> {detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="price-per-mg-method-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Method</p>
              <h2 id="price-per-mg-method-heading" className={GUIDE_HEADING_CLASS}>
                How Price per mg Is <span className="italic text-accent">Calculated</span>
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <p className={GUIDE_TEXT_CLASS}>
                We divide each listed price by the total milligrams in the product. A 10 mg vial listed at $50 is{' '}
                <strong className="font-bold text-content">$5.00 per mg</strong>. Where a sitewide coupon applies, we
                show the original price struck through and the price after the discount. The code must be entered at
                the supplier&rsquo;s checkout.
              </p>
              <p className={GUIDE_TEXT_CLASS}>
                Price per mg compares the amount of compound you get for your money. It does not compare purity,
                testing or quality, so read the supplier&rsquo;s COA before you decide. Prices change as supplier
                catalogs change, and each listing shows when its price was last observed.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="price-differences-heading" className={GUIDE_PANEL_CLASS}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div>
              <p className="eyebrow">Price factors</p>
              <h2 id="price-differences-heading" className={GUIDE_HEADING_CLASS}>
                Why Peptide Prices Differ Between <span className="italic text-accent">Suppliers</span>
              </h2>
            </div>
            <p className={`${GUIDE_TEXT_CLASS} lg:col-span-2`}>
              The same compound can vary widely in price per mg. Common reasons include vial size (larger vials are
              often cheaper per mg), whether the supplier publishes a COA, shipping cost, stock status and active
              coupon codes. A low price per mg is a starting point, not a verdict. Compare shipping and the{' '}
              <Link href="/suppliers" className="font-bold text-brand hover:underline">
                supplier
              </Link>
              &rsquo;s published{' '}
              <Link href="/lab-reports" className="font-bold text-brand hover:underline">
                lab reports
              </Link>{' '}
              as well.
            </p>
          </div>
        </section>

        <PageFaqSection path="/price-checker" className="mt-14 mb-10" />
      </div>
    </>
  );
}
