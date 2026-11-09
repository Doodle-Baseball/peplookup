import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  getProduct,
  getProducts,
  getOffersForProduct,
  getSuppliers,
  toListing,
} from '@/lib/repository';
import { effectivePrice, hasDiscount, rankByPricePerMg, couponAdjustedPrice } from '@/lib/price';
import { formatPerMg } from '@/lib/money';
import { formatDateTime, timeAgo, isStale } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ShareButton } from '@/components/ui/share-button';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { JumpToNav } from '@/components/product-card/jump-to-nav';
import {
  ProductListingsPanel,
  type ListingSupplier,
} from '@/components/product-card/product-listings-panel';
import { site } from '@/config/site';
import { recommendedSupplierFor } from '@/config/recommended-listings';
import { compoundImageSrc } from '@/config/compound-images';
import { compoundSeoDefaults, pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageSeo } from '@/components/seo/page-seo';
import { PRODUCT_OFFER_SCHEMA_ENABLED } from '@/config/features';
import { summarizeOffers } from '@/lib/structured-data/product-offers';
import type { Offer } from '@/lib/schema';
import { ArrowLeftIcon, ChevronDownIcon, ExternalIcon } from '@/components/icons/icons';
import { splitCategories } from '@/lib/categories';

/** Shared by the card and panel shells so every section on the page reads as one system. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return withSeo(`/product/${product.slug}`, pageMetadata(compoundSeoDefaults(product)));
}

type SearchParams = {
  form?: string;
  dose?: string;
  stock?: string;
  sort?: string;
  supplier?: string;
  view?: string;
  tab?: string;
};

/** Admin-written section titles get the same last-word accent as the built-in headings. */
function accentLastWord(title: string): ReactNode {
  const trimmed = title.trim();
  const splitAt = trimmed.lastIndexOf(' ');
  if (splitAt === -1) return <span className="text-accent">{trimmed}</span>;
  return (
    <>
      {trimmed.slice(0, splitAt)} <span className="text-accent">{trimmed.slice(splitAt + 1)}</span>
    </>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const seo = await getSeoOverride(`/product/${product.slug}`);

  const sp = await searchParams;

  // One query for every supplier up front instead of one round trip per
  // distinct vendor among this product's offers.
  const [offers, allSuppliers] = await Promise.all([
    getOffersForProduct(product.slug),
    getSuppliers(),
  ]);
  const suppliersBySlug = new Map(allSuppliers.map((s) => [s.slug, s]));
  // Offers whose supplier no longer resolves are dropped rather than shown
  // with missing vendor info.
  const resolvedOffers = offers.filter((o) => suppliersBySlug.has(o.supplierSlug));
  const hasOffers = resolvedOffers.length > 0;

  const lastUpdated = hasOffers
    ? resolvedOffers.reduce((latest, o) => (o.scrapedAt > latest ? o.scrapedAt : latest), resolvedOffers[0]!.scrapedAt)
    : null;

  // --- Headline stats, all derived from live offers ---
  const vendorCount = new Set(resolvedOffers.map((o) => o.supplierSlug)).size;
  const inStockCount = resolvedOffers.filter((o) => o.inStock).length;
  // A lab report with neither a report document nor the lab's own site has
  // nothing real to link to, so it doesn't count as a viewable COA.
  const offersWithReports = resolvedOffers.filter(
    (o) => o.labReport?.reportUrl || o.labReport?.labUrl || o.coaUrl,
  );
  // Ranking only happens within one currency: without a conversion rate a €
  // price must never "beat" a $ one. rankByPricePerMg drops out-of-stock first.
  const primaryCurrency = hasOffers ? toListing(resolvedOffers[0]!).currency : null;
  const lowestPerMg = (candidates: readonly Offer[]) =>
    rankByPricePerMg(
      candidates.map((o) => toListing(o)).filter((listing) => listing.currency === primaryCurrency),
    )[0] ?? null;
  const bestOverall = lowestPerMg(resolvedOffers);
  const bestOverallSupplier = bestOverall ? suppliersBySlug.get(bestOverall.listing.supplierSlug) : undefined;

  // Only what a listing row shows goes to the client-side filters, not whole supplier records.
  const listingSuppliers: ListingSupplier[] = [...new Set(resolvedOffers.map((o) => o.supplierSlug))].map((slug) => {
    const { name, logoUrl, faviconUrl, coupon } = suppliersBySlug.get(slug)!;
    return { slug, name, logoUrl, faviconUrl, coupon };
  });

  // The price each listing shows in its row below: a coupon only fills in
  // when there's no already-recorded sale price.
  const displayedOffers = resolvedOffers.map((offer) => {
    const listing = toListing(offer);
    const supplier = suppliersBySlug.get(offer.supplierSlug)!;
    const basePrice = effectivePrice(listing);
    const couponPercentOff = !hasDiscount(listing) ? (supplier.coupon?.percentOff ?? null) : null;
    const priceCents = couponPercentOff !== null ? couponAdjustedPrice(basePrice, couponPercentOff) : basePrice;
    return { priceCents, currency: listing.currency, inStock: offer.inStock };
  });
  const seoDefaults = compoundSeoDefaults(product);
  const offerSummary = PRODUCT_OFFER_SCHEMA_ENABLED
    ? summarizeOffers({ name: product.name, description: seo?.metaDescription ?? seoDefaults.description }, displayedOffers)
    : null;

  const research = product.research;

  // Built from this compound's own listings, so a page without written FAQs still
  // answers with facts about it rather than wording every compound would share.
  const singleVialSizes = [...new Set(resolvedOffers.filter((o) => o.vialCount === 1).map((o) => o.vialSize / 1000))].sort(
    (a, b) => a - b,
  );
  const kitCount = resolvedOffers.filter((o) => o.vialCount > 1).length;
  const aliases = product.aliases.slice(0, 2);
  const genericFaqs = [
    {
      q: `What is ${product.name}?`,
      a: `${product.name}${aliases.length > 0 ? ` (also listed as ${aliases.join(' or ')})` : ''} is a research compound${product.category ? ` that ${site.name} files under ${product.category}` : ''}. It is not approved for human use, and every listing on this page is sold for laboratory research only.`,
    },
    {
      q: `How many suppliers sell ${product.name}?`,
      a: hasOffers
        ? `We track ${resolvedOffers.length} ${product.name} ${resolvedOffers.length === 1 ? 'listing' : 'listings'} from ${vendorCount} ${vendorCount === 1 ? 'supplier' : 'suppliers'}, and ${inStockCount} ${inStockCount === 1 ? 'was' : 'were'} in stock at our last check.`
        : `None of the suppliers we track lists ${product.name} right now.`,
    },
    {
      q: `What sizes does ${product.name} come in?`,
      a:
        singleVialSizes.length > 0
          ? `Single vials on this page run ${singleVialSizes.length === 1 ? `at ${singleVialSizes[0]} mg` : `from ${singleVialSizes[0]} mg to ${singleVialSizes.at(-1)} mg`}${kitCount > 0 ? `, and ${kitCount} ${kitCount === 1 ? 'listing is a kit' : 'listings are kits'} of several vials` : ''}. Price per mg puts every size on the same scale, so a larger vial isn't automatically the better deal.`
          : `Sizes vary by supplier; each listing above shows its own amount, and price per mg puts them on the same scale.`,
    },
    {
      q: `Do ${product.name} listings come with COAs?`,
      a: `${offersWithReports.length} of the ${resolvedOffers.length} listings link a certificate of analysis. A COA covers one batch, so check that its lot number matches the vial you receive.`,
    },
    {
      q: `Where is ${product.name} cheapest?`,
      a: bestOverallSupplier
        ? `At our last check the lowest in-stock price per mg was at ${bestOverallSupplier.name}. Prices change often, so the table above, sorted by price per mg, shows the current order.`
        : `No supplier has ${product.name} in stock right now, so there is no lowest price to show.`,
    },
  ];
  // Admin-written FAQs replace the generic set entirely; the generic questions
  // only fill pages nobody has written FAQs for yet.
  const faqs =
    research.faq.length > 0 ? research.faq.map((item) => ({ q: item.question, a: item.answer })) : genericFaqs;

  const vialImage = compoundImageSrc(product.slug);

  return (
    <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
      <PageSeo seo={seoDefaults} dataDates={[lastUpdated]} product={offerSummary} />

      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-content"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to search
      </Link>

      {/* ---------------------------------------------------------------- Hero */}
      <header id="overview" className={cn(PANEL_CLASS, 'scroll-mt-24 overflow-x-clip p-5 sm:p-8')}>
        {/* Actions share the row with the pills, not the title block, beside
            the title they squeezed the summary into a narrow column on phones. */}
        <div className="flex items-start justify-between gap-4">
          <div className="animate-fade-up flex min-w-0 flex-wrap items-center gap-2">
            {splitCategories(product.category).map((category) => (
              <span key={category} className="rounded-pill bg-accent-tint px-3 py-1 text-xs font-bold text-accent-strong">
                {category}
              </span>
            ))}
            {lastUpdated ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1 text-micro font-bold uppercase',
                  isStale(lastUpdated) ? 'text-warn' : 'text-muted',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('h-1.5 w-1.5 rounded-pill', isStale(lastUpdated) ? 'bg-warn' : 'bg-ok')}
                />
                <time dateTime={lastUpdated} title={formatDateTime(lastUpdated)}>
                  {isStale(lastUpdated) ? 'Prices may be stale · ' : 'Prices updated '}
                  {timeAgo(lastUpdated)}
                </time>
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ShareButton
              title={product.name}
              url={`https://${site.domain}/product/${product.slug}`}
              className="h-10 w-10"
            />
            <FavoriteButton
              slug={product.slug}
              name={product.name}
              kind="product"
              className="h-10 w-10 border border-line bg-surface"
            />
          </div>
        </div>

        {/* With a vial image, the title, summary, stats and jump links share one
            left column and the vial is laid over the reserved right-hand column,
            so it can run down beside the stats and the jump links. */}
        <div className={cn(vialImage && 'relative xl:min-h-vial xl:pr-64')}>
          {vialImage ? (
            <div className="animate-fade-up animate-delay-200 mt-4 flex justify-center xl:absolute xl:right-0 xl:top-0 xl:mt-0 xl:w-72">
              <Image
                src={vialImage}
                alt={`${product.name} research vial`}
                width={336}
                height={336}
                priority
                className="pointer-events-none h-64 w-64 object-contain sm:h-80 sm:w-80 xl:h-vial xl:w-vial xl:max-w-none"
              />
            </div>
          ) : null}
          <h1 className="animate-fade-up animate-delay-100 mt-4 text-4xl font-black text-content sm:text-5xl">
            {seo?.h1 || product.name}
          </h1>
          {product.description ?? product.summary ? (
            <p className="animate-fade-up animate-delay-200 mt-3 max-w-4xl whitespace-pre-line text-base leading-7 text-muted">
              {product.description ?? product.summary}
            </p>
          ) : null}

          {hasOffers ? (
            <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                label="Lowest cost / mg"
                value={bestOverall ? formatPerMg(bestOverall.perMg, bestOverall.listing.currency) : 'N/A'}
                hint={bestOverallSupplier ? `at ${bestOverallSupplier.name}` : 'No in-stock listing'}
                emphasis
              />
              <Stat label="Suppliers listed" value={String(vendorCount)} />
              <Stat label="In stock" value={`${inStockCount} of ${resolvedOffers.length}`} hint="listings" />
              <Stat label="COA reports" value={String(offersWithReports.length)} />
            </dl>
          ) : null}
          <div className={cn('mt-6 flex items-center gap-3 pt-4', !vialImage && 'border-t border-line')}>
            <span className="eyebrow hidden shrink-0 sm:inline">Jump to</span>
            <JumpToNav
              items={[
                { id: 'overview', label: 'Overview' },
                { id: 'vendor-listings', label: 'Supplier Listings' },
                { id: 'benefits', label: 'Benefits' },
                { id: 'evidence', label: 'Evidence' },
                { id: 'interactions', label: 'Interactions' },
                { id: 'faq', label: 'FAQ' },
              ]}
            />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------ Price compare */}
      <ProductListingsPanel
        productName={product.name}
        offers={resolvedOffers}
        suppliers={listingSuppliers}
        initialFilters={sp}
        recommendedSupplierSlug={recommendedSupplierFor(product.slug)}
        className={cn(PANEL_CLASS, 'mt-6 scroll-mt-24 overflow-hidden')}
      />

      {/* ------------------------------------------------------ Research content */}
      <ContentSection
        id="about"
        eyebrow="Overview"
        title={
          <>
            What is <span className="text-accent">{product.name}</span>?
          </>
        }
      >
        <p className="mt-4 max-w-4xl whitespace-pre-line text-base leading-7 text-muted">
          {product.description ??
            product.summary ??
            `${product.name} is a research compound${
              product.category ? ` studied primarily in the context of ${product.category.toLowerCase()} research` : ''
            }.`}
        </p>
        {product.purposePills.length > 0 ? (
          <ul aria-label={`${product.name} research purposes`} className="mt-5 flex flex-wrap gap-2">
            {product.purposePills.map((pill) => (
              <li
                key={pill}
                className="rounded-pill border border-accent/30 bg-accent-tint px-3 py-1.5 text-sm font-bold text-accent-strong"
              >
                {pill}
              </li>
            ))}
          </ul>
        ) : null}
      </ContentSection>

      <ContentSection
        id="benefits"
        eyebrow="What the research reports"
        title={
          research.benefitsTitle ? (
            accentLastWord(research.benefitsTitle)
          ) : (
            <>
              Reported research <span className="text-accent">benefits.</span>
            </>
          )
        }
        intro={
          research.benefitsIntro ??
          'Outcomes described across the published literature and ongoing study, not promised results. Read each as research context, not a guarantee.'
        }
      >
        {research.benefits.length > 0 ? (
          <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {research.benefits.map((benefit, index) => (
              <li key={`${index}-${benefit.title}`} className="flex gap-3 rounded-card border border-line bg-surface p-4">
                <span className="font-mono text-sm font-bold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold leading-6 text-content">{benefit.title}</p>
                  {benefit.description ? (
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted">{benefit.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyNote>No research benefits have been published for {product.name} yet.</EmptyNote>
        )}
      </ContentSection>

      <ContentSection
        id="evidence"
        eyebrow="Clinical evidence"
        title={
          research.evidenceTitle ? (
            accentLastWord(research.evidenceTitle)
          ) : (
            <>
              What the studies actually <span className="text-accent">show.</span>
            </>
          )
        }
        intro={
          research.evidenceIntro ??
          'The published record, labeled by strength so you know what is established and what is still emerging.'
        }
      >
        {research.evidence.length > 0 ? (
          <div className="mt-6 divide-y divide-line border-t border-line">
            {research.evidence.map((item, index) => (
              <article key={`${index}-${item.title}`} className="py-5">
                <h3 className="text-lg font-black text-content">{item.title}</h3>
                {item.body ? (
                  <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-muted">{item.body}</p>
                ) : null}
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="nofollow noopener"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-accent transition-colors hover:text-content"
                  >
                    Source
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyNote>No evidence summaries have been published for {product.name} yet.</EmptyNote>
        )}
      </ContentSection>

      <ContentSection
        id="interactions"
        eyebrow="Interactions"
        title={
          research.interactionsTitle ? (
            accentLastWord(research.interactionsTitle)
          ) : (
            <>
              How it pairs with other <span className="text-accent">peptides.</span>
            </>
          )
        }
      >
        {research.interactions.length > 0 ? (
          <dl className="mt-6 divide-y divide-line border-t border-line">
            {research.interactions.map((item, index) => (
              <div key={`${index}-${item.pair}`} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-6">
                <dt className="text-sm font-black uppercase text-content">{item.pair}</dt>
                {item.note ? <dd className="text-sm leading-6 text-muted sm:col-span-2">{item.note}</dd> : null}
              </div>
            ))}
          </dl>
        ) : (
          <EmptyNote>No interaction data has been recorded for {product.name} yet.</EmptyNote>
        )}
      </ContentSection>

      <section id="faq" aria-labelledby="faq-heading" className={cn(PANEL_CLASS, 'reveal mt-6 scroll-mt-24 p-5 sm:p-8')}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 id="faq-heading" className="mt-3 text-4xl font-black leading-none text-content sm:text-5xl">
              Frequently asked <span className="italic text-accent">questions.</span>
            </h2>
          </div>

          <div className="space-y-3 lg:col-span-2">
            {faqs.map((item, index) => (
              <details
                key={`${index}-${item.q}`}
                open={index === 0}
                className="group rounded-card border border-line bg-surface transition-shadow open:bg-surface-raised open:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-left text-base font-bold text-content sm:p-5 sm:text-lg">
                  <span>{item.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-raised text-content transition-all group-open:rotate-180 group-open:border-brand group-open:bg-brand group-open:text-surface">
                    <ChevronDownIcon className="h-4 w-4" />
                  </span>
                </summary>
                <div className="whitespace-pre-line border-t border-line px-4 pb-4 pt-3 text-sm leading-7 text-muted sm:px-5 sm:pb-5 sm:text-base">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-card border p-3 sm:p-4',
        emphasis ? 'border-accent/30 bg-accent-tint' : 'border-line bg-surface',
      )}
    >
      <dt className="text-micro font-bold uppercase text-muted">{label}</dt>
      <dd className={cn('mt-1 truncate text-xl font-black sm:text-2xl', emphasis ? 'text-accent-strong' : 'text-content')}>
        {value}
      </dd>
      {hint ? <dd className="truncate text-xs text-muted">{hint}</dd> : null}
    </div>
  );
}

function ContentSection({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(PANEL_CLASS, 'reveal mt-6 scroll-mt-24 p-5 sm:p-8')}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="mt-3 text-3xl font-black text-content sm:text-4xl">
        {title}
      </h2>
      {intro ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">{intro}</p> : null}
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">{children}</p>
  );
}
