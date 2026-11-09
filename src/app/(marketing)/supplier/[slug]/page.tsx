import { supplierPath } from '@/lib/site-paths';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllOffers,
  getSupplier,
  getSuppliers,
  getOffersForSupplier,
  getProducts,
  getSupplierReviews,
  getSupplierSlugsWithReviews,
  supplierHasReviews,
} from '@/lib/repository';
import { couponPagePath } from '@/lib/coupon-pages';
import { reviewsPagePath } from '@/lib/review-pages';
import { formatDate } from '@/lib/format';
import type { Offer, Product } from '@/lib/schema';
import { cn } from '@/lib/cn';
import { supplierGoPath } from '@/lib/go-links';
import { site } from '@/config/site';
import { pageMetadata, supplierSeoDefaults } from '@/lib/seo-defaults';
import { cleanPageText, getSeoOverride, withSeo } from '@/lib/seo';
import { PageSeo } from '@/components/seo/page-seo';
import { Badge } from '@/components/ui/badge';
import { CopyCode } from '@/components/ui/copy-code';
import { ShareButton } from '@/components/ui/share-button';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { PatternBackdrop } from '@/components/layout/pattern-backdrop';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { SupplierTrustPanel } from '@/components/supplier-card/supplier-trust-panel';
import { StoreDetailsSection } from '@/components/supplier-card/store-details-section';
import { SupplierCatalogSection } from '@/components/supplier-card/supplier-catalog-section';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  ExternalIcon,
  FlaskIcon,
  TagIcon,
} from '@/components/icons/icons';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { SupplierContentSections } from '@/components/supplier-content/supplier-content-sections';
import { SupplierGlanceTable, SupplierPriceComparison } from '@/components/supplier-card/supplier-facts-sections';
import { supplierPageUsesContentV2 } from '@/lib/seo/protected';
import { getSupplierFacts } from '@/lib/supplier-facts-store';
import {
  isComparisonToolAnswer,
  supplierSpecificFaqs,
  supplierSummary,
  supplierTitleWithoutCompetingWords,
} from '@/lib/supplier-facts';
import { getFaqsForPath } from '@/lib/page-faqs';
import { getSupplierContent } from '@/lib/supplier-content-store';
import { SUPPLIER_PAGE_AUTHOR } from '@/config/site';
import {
  isRewrittenSupplierPage,
  rewriteFaqs,
  rewriteSeoDescription,
  rewriteSeoTitle,
  rewriteSummary,
} from '@/lib/supplier-page-rewrite';
import { getRewriteFacts } from '@/lib/supplier-page-rewrite-store';

/** How many other vendors show in "Explore more vendors". */
const EXPLORE_VENDOR_COUNT = 6;

/** The COA link a listing carries, with the same precedence /coas uses. */
function coaUrlOf(offer: Offer): string | null {
  return offer.labReport?.reportUrl ?? offer.labReport?.labUrl ?? offer.coaUrl ?? null;
}

/** What the supplier's title and description may state: how many products it prices and how many COAs we link. */
function supplierSeoFacts(offers: readonly Offer[], productsBySlug: ReadonlyMap<string, Product>) {
  const resolved = offers.filter((offer) => productsBySlug.has(offer.productSlug));
  const coaKeys = new Set(
    resolved.flatMap((offer) => {
      const url = coaUrlOf(offer);
      return url ? [`${offer.productSlug}|${url}`] : [];
    }),
  );
  return { productCount: new Set(resolved.map((offer) => offer.productSlug)).size, coaCount: coaKeys.size };
}

export async function generateStaticParams() {
  const suppliers = await getSuppliers();
  return suppliers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supplier = await getSupplier(slug);
  if (!supplier) return { title: 'Supplier not found' };
  const [offers, products] = await Promise.all([getOffersForSupplier(supplier.slug), getProducts()]);
  const facts = supplierSeoFacts(offers, new Map(products.map((product) => [product.slug, product])));
  const metadata = await withSeo(`/supplier/${supplier.slug}`, pageMetadata(supplierSeoDefaults(supplier, facts)));
  if (isRewrittenSupplierPage(supplier.slug)) {
    // A rewritten page writes its own title and description from live numbers and outputs no meta keywords.
    const resolved = offers.filter((offer) => products.some((product) => product.slug === offer.productSlug));
    const { rewrite } = await getRewriteFacts(supplier, resolved);
    const text = await cleanPageText(`/supplier/${supplier.slug}`, {
      title: rewriteSeoTitle(rewrite),
      description: rewriteSeoDescription(rewrite),
    });
    const canonical = metadata.alternates?.canonical;
    return {
      ...metadata,
      title: { absolute: text.title },
      description: text.description,
      keywords: undefined,
      openGraph: {
        ...metadata.openGraph,
        title: text.title,
        description: text.description,
        ...(canonical ? { url: String(canonical) } : {}),
      },
    };
  }
  if (!supplierPageUsesContentV2(supplier.slug)) return metadata;
  // Content v2: the title drops "Review", "Coupon" and "Discount" so it stops
  // competing with this supplier's reviews and coupon pages. Rendering only;
  // the saved title is untouched.
  const title = titleOf(metadata.title);
  if (!title) return metadata;
  const v2Title = supplierTitleWithoutCompetingWords(title);
  return {
    ...metadata,
    title: { absolute: v2Title },
    ...(metadata.openGraph ? { openGraph: { ...metadata.openGraph, title: v2Title } } : {}),
  };
}

function titleOf(title: Metadata['title']): string | null {
  if (!title) return null;
  if (typeof title === 'string') return title;
  return 'absolute' in title && title.absolute ? title.absolute : null;
}

export default async function SupplierPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pq?: string; page?: string; form?: string; size?: string }>;
}) {
  const { slug } = await params;
  // The SEO override is keyed by path, so it needs only the slug, fetching it
  // alongside the supplier saves a whole sequential round trip to the database.
  const [supplier, seo] = await Promise.all([getSupplier(slug), getSeoOverride(`/supplier/${slug}`)]);
  if (!supplier) notFound();

  const { pq, page: pageParam, form: formParam, size: sizeParam } = await searchParams;
  const catalogueQuery = (pq ?? '').trim();

  // One query for every compound up front instead of one round trip per
  // distinct product among this vendor's offers.
  const [offers, allProducts, reviews, allSuppliers, marketOffers, slugsWithReviews] = await Promise.all([
    getOffersForSupplier(supplier.slug),
    getProducts(),
    getSupplierReviews(supplier),
    getSuppliers(),
    getAllOffers(),
    getSupplierSlugsWithReviews(),
  ]);
  const supplierContent = await getSupplierContent(supplier, marketOffers);
  // Content v2 (CONTENT_V2=true, never on the hand-written protected pages):
  // facts true only for this supplier replace the text it shares with others.
  const contentV2 = supplierPageUsesContentV2(supplier.slug);
  const v2 = contentV2 ? await getSupplierFacts(supplier) : null;
  const v2Summary = v2 ? supplierSummary(v2.facts) : '';
  // The "comparison tool" answer moves from the FAQ to the bottom of the page, word for word.
  const comparisonToolNote = contentV2
    ? ((await getFaqsForPath(`/supplier/${supplier.slug}`)).find((faq) => isComparisonToolAnswer(faq.answer))?.answer ?? null)
    : null;
  const productsBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  // Offers whose product no longer resolves are dropped rather than shown
  // with a missing name.
  const resolvedOffers = offers.filter((o) => productsBySlug.has(o.productSlug));

  const otherSuppliers = allSuppliers
    .filter((s) => s.slug !== supplier.slug)
    .slice(0, EXPLORE_VENDOR_COUNT);

  // The vendor's real COA documents, derived from offers we already loaded
  // rather than a second query, with the same link precedence /coas
  // uses. Sizes sharing one document collapse into a single entry.
  const coaReportsByKey = new Map<
    string,
    { productName: string; url: string; sizes: Map<string, { vialSize: number; vialCount: number }> }
  >();
  for (const offer of resolvedOffers) {
    const url = coaUrlOf(offer);
    if (!url) continue;
    const productName = productsBySlug.get(offer.productSlug)!.name;
    const key = `${offer.productSlug}|${url}`;
    const mg = offer.vialSize / 1000;
    const sizeLabel = offer.vialCount > 1 ? `${mg} mg × ${offer.vialCount}` : `${mg}mg`;
    const entry = coaReportsByKey.get(key) ?? { productName, url, sizes: new Map() };
    entry.sizes.set(sizeLabel, { vialSize: offer.vialSize, vialCount: offer.vialCount });
    coaReportsByKey.set(key, entry);
  }
  const coaReports = [...coaReportsByKey.entries()]
    .map(([key, entry]) => ({
      key,
      productName: entry.productName,
      url: entry.url,
      sizes: [...entry.sizes.entries()]
        .sort(([, a], [, b]) => a.vialSize - b.vialSize || a.vialCount - b.vialCount)
        .map(([label]) => label),
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName));

  const logo = supplier.logoUrl ?? supplier.faviconUrl;
  // A rewritten page (one-page test): its own text, every number read live.
  const rewritten = isRewrittenSupplierPage(supplier.slug) ? await getRewriteFacts(supplier, resolvedOffers) : null;
  const rewrite = rewritten?.rewrite ?? null;
  const baseSeoDefaults = supplierSeoDefaults(supplier, supplierSeoFacts(offers, productsBySlug));
  const seoDefaults = rewrite
    ? { ...baseSeoDefaults, title: rewriteSeoTitle(rewrite), description: rewriteSeoDescription(rewrite) }
    : baseSeoDefaults;
  const reviewsPage = supplierHasReviews(supplier, slugsWithReviews) ? reviewsPagePath(supplier.slug) : null;

  // Only facts we actually hold for this vendor, no placeholder scores.
  const glance: { label: string; value: string; hint?: string }[] = [
    { label: 'Products listed', value: String(resolvedOffers.length) },
    ...(supplier.labScore !== null ? [{ label: 'Lab score', value: `${supplier.labScore.toFixed(1)}/10` }] : []),
    ...(supplier.foundedYear !== null ? [{ label: 'Established', value: String(supplier.foundedYear) }] : []),
  ];

  return (
    <div className="relative isolate overflow-hidden">
      {/* Supplier profiles keep the soft colour washes but drop the dot grid. */}
      <PatternBackdrop dots={false} />

      <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
        <PageSeo
          seo={seoDefaults}
          ignoreSavedText={rewrite !== null}
          supplier={supplier}
          dataDates={[supplier.inventoryRefreshedAt, ...resolvedOffers.map((offer) => offer.scrapedAt)]}
        />

        <Link
          href="/supplier"
          className="group animate-fade-up mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All suppliers
        </Link>

        {/* ------------------------------------------------------------ Hero */}
        <section className="animate-fade-up animate-delay-100 relative overflow-hidden rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16">
            <div className="animate-drift h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Stacked on phones: beside a large logo the name and description
                were squeezed into a column a few words wide. */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start lg:col-span-2">
              <div className="relative w-fit shrink-0">
                <SupplierLogo
                  src={logo}
                  name={supplier.name}
                  alt={`${seo?.h1 || supplier.name} logo`}
                  size={96}
                  className="h-20 w-20 rounded-card bg-surface shadow-lift sm:h-24 sm:w-24"
                  initialClassName="text-2xl sm:text-3xl"
                />
                {supplier.labVerified ? (
                  <span
                    title="Laboratory verified"
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-pill border-2 border-surface-raised bg-accent text-surface shadow-card"
                  >
                    <CheckBadgeIcon className="h-4 w-4" />
                    <span className="sr-only">Laboratory verified</span>
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow">Supplier profile</span>
                  {supplier.tier ? <Badge tone="tier">{supplier.tier}</Badge> : null}
                  {supplier.labVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-accent-tint px-2.5 py-1 text-micro font-bold uppercase text-accent-strong">
                      <FlaskIcon className="h-3 w-3" />
                      Lab verified
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-2 text-3xl font-black text-content sm:text-5xl">{seo?.h1 || supplier.name}</h1>

                {supplier.updatedAt ? (
                  <p className="mt-2 text-sm text-muted">
                    Last checked <time dateTime={supplier.updatedAt}>{formatDate(supplier.updatedAt)}</time> by{' '}
                    <Link href={SUPPLIER_PAGE_AUTHOR.href} className="font-bold text-accent-strong hover:underline">
                      {SUPPLIER_PAGE_AUTHOR.name}
                    </Link>
                  </p>
                ) : null}

                {rewrite ? (
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{rewriteSummary(rewrite)}</p>
                ) : (
                  <>
                    {v2Summary ? (
                      <p id="supplier-summary" className="mt-3 max-w-2xl text-base leading-7 text-content">
                        {v2Summary}
                      </p>
                    ) : null}

                    {supplier.description ? (
                      <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{supplier.description}</p>
                    ) : null}
                  </>
                )}

                <div className="mt-6 flex items-center gap-2">
                  <a
                    href={supplierGoPath(supplier.slug, 'website')}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="btn-3d group/cta inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-strong sm:flex-none"
                  >
                    {/* The name is already the heading right above; phones get the short label. */}
                    <span className="truncate">
                      <span className="sm:hidden">Visit Site</span>
                      <span className="hidden sm:inline">Shop {supplier.name}</span>
                    </span>
                    <ExternalIcon className="h-4 w-4 shrink-0 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                  </a>
                  <ShareButton
                    title={supplier.name}
                    url={`https://${site.domain}${supplierPath(supplier.slug)}`}
                    className="h-11 w-11 hover:border-accent hover:text-accent"
                  />
                  <FavoriteButton
                    slug={supplier.slug}
                    name={supplier.name}
                    className="h-11 w-11 rounded-chip border border-line bg-surface p-0 hover:border-accent"
                  />
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
              {glance.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    'animate-fade-up rounded-card border p-4',
                    index === 0 ? 'border-accent/30 bg-accent-tint' : 'border-line bg-surface',
                  )}
                  style={{ animationDelay: `${200 + index * 80}ms` }}
                >
                  <dt className="eyebrow">{item.label}</dt>
                  <dd className={cn('mt-1 text-2xl font-black', index === 0 ? 'text-accent-strong' : 'text-content')}>
                    {item.value}
                  </dd>
                  {item.hint ? <dd className="text-xs text-muted">{item.hint}</dd> : null}
                </div>
              ))}
            </dl>
          </div>

          {supplier.coupon ? (
            <div className="relative mt-8 flex flex-col gap-4 rounded-card border-2 border-dashed border-coupon/50 bg-coupon-tint p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-coupon text-coupon-ink motion-safe:animate-pulse">
                  <TagIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-micro font-bold uppercase tracking-wide text-coupon-ink">
                    Exclusive {supplier.name} offer
                  </p>
                  <p className="text-lg font-black text-coupon-ink">{supplier.coupon.percentOff}% off with coupon</p>
                </div>
              </div>
              {/* Roomier than CopyCode's default px-2.5 py-1, since this one is
                  the banner's main call to action rather than a chip tucked
                  onto a card. Scoped here: the compact copies on product and
                  offer cards keep their own tighter padding. */}
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <CopyCode code={supplier.coupon.code} className="px-4 py-2.5" />
                <Link
                  href={couponPagePath(supplier.slug)}
                  className="text-sm font-bold text-coupon-ink underline-offset-2 hover:underline"
                >
                  How to use the {supplier.name} coupon code
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        {v2 ? <SupplierGlanceTable facts={v2.facts} className="mt-8" /> : null}

        {/* ---------------------------------------------------- Store details */}
        <StoreDetailsSection supplier={supplier} className="mt-12" />

        {/* ---------------------------------------------------------- Catalog */}
        <SupplierCatalogSection
          supplier={supplier}
          offers={resolvedOffers}
          productsBySlug={productsBySlug}
          query={catalogueQuery}
          pageParam={pageParam}
          formParam={formParam}
          sizeParam={sizeParam}
          className="mt-12"
        />

        {/* Reviews appear only when this vendor has some; the COA box always shows. */}
        <SupplierTrustPanel
          supplierName={supplier.name}
          supplierSlug={supplier.slug}
          reviews={reviews}
          reviewsUrl={supplier.reviewsUrl}
          reviewRating={supplier.reviewRating}
          reviewCount={supplier.reviewCount}
          reviewsPagePath={reviewsPage}
          labName={supplier.coaLabName}
          coaReports={coaReports}
        />

        {/* About / Why researchers choose / vs other suppliers, editable per
            vendor from the supplier's popup in /admin/seo. */}
        {v2 ? (
          <>
            {/* Content v2: the About box stays; "Why researchers choose" is hidden and
                "vs other suppliers" becomes a price table. */}
            <SupplierContentSections vendorName={supplier.name} content={supplierContent} keys={['about']} className="mt-12" />
            <SupplierPriceComparison facts={v2.facts} title={supplierContent.compare.title} className="mt-4 sm:mt-6" />
          </>
        ) : (
          <SupplierContentSections vendorName={supplier.name} content={supplierContent} className="mt-12" />
        )}

        {/* FAQs for this vendor, generated from their own record until a set is
            saved for this path in /admin/seo. */}
        <PageFaqSection
          path={`/supplier/${supplier.slug}`}
          className="mt-14"
          items={rewrite ? rewriteFaqs(rewrite) : undefined}
          pick={
            contentV2
              ? (faqs) => supplierSpecificFaqs(faqs.filter((faq) => !isComparisonToolAnswer(faq.answer)), supplier)
              : undefined
          }
        />

        {comparisonToolNote ? (
          <p className="mt-8 rounded-card border border-line bg-surface-raised px-5 py-4 text-sm leading-6 text-muted">
            {comparisonToolNote}
          </p>
        ) : null}

        {/* ---------------------------------------------------------- Explore */}
        {otherSuppliers.length > 0 ? (
          <section aria-labelledby="explore-heading" className="reveal mt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep comparing</p>
                <h2 id="explore-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
                  Explore more <span className="text-accent">suppliers.</span>
                </h2>
              </div>
              <Link
                href="/supplier"
                className="btn-3d group/all inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
              >
                View all suppliers
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/all:translate-x-1" />
              </Link>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {otherSuppliers.map((other) => (
                <li key={other.slug} className="min-w-0">
                  <Link
                    href={supplierPath(other.slug)}
                    // Plain hover lift rather than `.card-3d`: that class keeps a
                    // `perspective()` + `translateZ(0)` transform applied at rest
                    // (not just on hover), which composites the card onto its own
                    // GPU layer and visibly softens the logo and text on it.
                    className="group flex h-full flex-col items-center gap-3 rounded-card border border-line bg-surface-raised p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
                  >
                    <SupplierLogo
                      src={other.logoUrl ?? other.faviconUrl}
                      name={other.name}
                      alt={`${other.name} logo`}
                      size={56}
                      className="h-14 w-14 rounded-chip shadow-sm transition-transform duration-200 group-hover:scale-105"
                      initialClassName="text-lg"
                    />
                    <span className="line-clamp-2 text-sm font-bold text-content transition-colors group-hover:text-accent-strong">
                      {other.name}
                    </span>
                    {other.tier ? (
                      <span className="rounded-pill bg-brand px-2 py-0.5 text-micro font-bold uppercase text-surface">
                        {other.tier}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
