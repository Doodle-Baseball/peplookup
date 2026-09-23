import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons/icons';
import { moreThanFloor, type CatalogueStats } from '@/lib/catalogue-stats';
import { cn } from '@/lib/cn';

/** Same panel as the FAQ section it sits above. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';

/** Internal links, anchor text kept to the "[Compound] Price Comparison" pattern this section targets. */
const POPULAR_COMPARISONS: readonly { slug: string; note: string }[] = [
  { slug: 'bpc-157', note: 'healing and tissue repair research' },
  { slug: 'retatrutide', note: 'most-compared weight loss compound' },
  { slug: 'tirzepatide', note: 'GLP-1 research pricing' },
  { slug: 'tb-500', note: 'tissue repair research' },
  { slug: 'semaglutide', note: 'GLP-1 research pricing' },
];

const number = new Intl.NumberFormat('en-US');

function listingsPhrase(listingCount: number): string {
  const floor = moreThanFloor(listingCount);
  return floor === null
    ? `${number.format(listingCount)} listings`
    : `more than ${number.format(floor)} listings`;
}

/**
 * "Peptide Pricing Comparison, Explained": supporting copy between the
 * homepage compound grid and the FAQs. A Server Component so the text is in
 * the initial HTML. Counts come from the live catalogue, never hardcoded.
 */
export function PricingComparisonExplainer({
  stats,
  products,
  className,
}: {
  stats: CatalogueStats;
  /** The catalogue, used to link only compounds that actually have a page. */
  products: readonly { slug: string; name: string }[];
  className?: string;
}) {
  const nameBySlug = new Map(products.map((product) => [product.slug, product.name]));
  const popular = POPULAR_COMPARISONS.flatMap(({ slug, note }) => {
    const name = nameBySlug.get(slug);
    return name ? [{ slug, name, note }] : [];
  });

  return (
    <section
      id="pricing-comparison-explained"
      aria-labelledby="pricing-comparison-explained-heading"
      className={cn(PANEL_CLASS, 'scroll-mt-24 p-5 sm:p-8', className)}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
        <div>
          <p className="eyebrow">Explainer</p>
          <h2
            id="pricing-comparison-explained-heading"
            className="mt-3 text-3xl font-black leading-tight text-content break-words sm:text-4xl lg:text-5xl"
          >
            Peptide Pricing Comparison, <span className="italic text-accent">Explained</span>
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-7 text-muted sm:text-base lg:col-span-2">
          <p>
            A true peptide pricing comparison isn&rsquo;t just listing prices side by side &mdash; it&rsquo;s
            making them comparable. Vial sizes, forms, and packaging vary widely between suppliers, so PepLookup
            normalizes every price to cost per milligram before it appears in any comparison. This is what
            separates an accurate peptide pricing comparison from a simple price list.
          </p>
          <p>
            Our peptide pricing comparison currently spans{' '}
            <strong className="font-bold text-content">{number.format(stats.supplierCount)} verified suppliers</strong>{' '}
            and <strong className="font-bold text-content">{listingsPhrase(stats.listingCount)}</strong> across{' '}
            <strong className="font-bold text-content">
              {number.format(stats.compoundCount)} research compounds
            </strong>
            . Every comparison shows when a price was last observed, whether the supplier publishes a certificate
            of analysis, and any active discount code &mdash; everything needed to run a fair peptide pricing
            comparison before ordering.
          </p>
          <p>
            When you compare peptide prices on a single listing page, sort by cost per mg first &mdash; this is
            the number that actually reflects value, since a lower sticker price on a smaller vial can cost more
            per milligram than a higher-priced larger one.
          </p>
          <p className="font-semibold text-content">
            Explore individual peptide pricing comparison pages below for BPC-157, Retatrutide, Tirzepatide and
            more.
          </p>
        </div>
      </div>

      {popular.length > 0 ? (
        <div className="mt-8 border-t border-line pt-6 sm:mt-10 sm:pt-8">
          <h3 className="text-lg font-black text-content sm:text-xl">
            Popular Peptide Pricing <span className="text-accent">Comparisons</span>
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map(({ slug, name, note }) => (
              <li
                key={slug}
                // The link's ::after stretches over the card, so the whole card is
                // clickable while the anchor text stays just "[Compound] Price Comparison".
                className="group relative flex h-full min-w-0 items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 transition-all duration-150 focus-within:border-accent/40 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-raised hover:shadow-card"
              >
                <span className="min-w-0">
                  <Link
                    href={`/products/${slug}`}
                    className="block font-bold text-content outline-none transition-colors after:absolute after:inset-0 after:rounded-card group-hover:text-accent-strong focus-visible:after:ring-2 focus-visible:after:ring-accent"
                  >
                    {name} Price Comparison
                  </Link>
                  <span className="mt-0.5 block text-sm text-muted">{note}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-raised text-content transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-surface"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
