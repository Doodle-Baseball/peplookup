import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import {
  getOffersForSupplier,
  getProducts,
  getSupplier,
  getSupplierReviews,
  getSupplierSlugsWithReviews,
  getSuppliers,
  supplierHasReviews,
} from '@/lib/repository';
import { site } from '@/config/site';
import { formatRating, formatReviewCount } from '@/lib/format';
import { ratingSourceLabel, reviewsPageIndexable, reviewsPagePath, supplierSlugFromReviewsSegment } from '@/lib/review-pages';
import { pageMetadata, reviewsPageSeoDefaults } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { CopyCode } from '@/components/ui/copy-code';
import { ShareButton } from '@/components/ui/share-button';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { StarRating } from '@/components/ui/star-rating';
import { JumpToNav } from '@/components/product-card/jump-to-nav';
import { StoreDetailsSection } from '@/components/supplier-card/store-details-section';
import { SupplierCatalogSection } from '@/components/supplier-card/supplier-catalog-section';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { getReviewPageContent } from '@/lib/review-page-content-store';
import { ReviewListSection } from '@/components/reviews/review-list-section';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BoxIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ExternalIcon,
  StarIcon,
  TagIcon,
} from '@/components/icons/icons';

/**
 * The public address is /reviews/<vendor-slug>-reviews, so the route's `slug`
 * is that whole last segment, suffix included.
 */
export async function generateStaticParams() {
  const [suppliers, storedSlugs] = await Promise.all([getSuppliers(), getSupplierSlugsWithReviews()]);
  return suppliers
    .filter((supplier) => supplierHasReviews(supplier, storedSlugs))
    .map((supplier) => ({ slug: `${supplier.slug}-reviews` }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supplierSlug = supplierSlugFromReviewsSegment(slug);
  const supplier = supplierSlug ? await getSupplier(supplierSlug) : null;
  if (!supplier || !supplierHasReviews(supplier, await getSupplierSlugsWithReviews())) return { title: 'Supplier not found' };
  const defaults = reviewsPageSeoDefaults(supplier);
  const [metadata, seo] = await Promise.all([withSeo(defaults.path, pageMetadata(defaults)), getSeoOverride(defaults.path)]);
  // Hidden from search engines until its SEO details are saved and indexing is
  // switched on for it in /admin/seo.
  if (reviewsPageIndexable(seo)) return metadata;
  return { ...metadata, robots: { index: false, follow: seo?.robotsFollow ?? true } };
}

export default async function VendorReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pq?: string; page?: string; form?: string; size?: string }>;
}) {
  const { slug } = await params;
  const supplierSlug = supplierSlugFromReviewsSegment(slug);
  const supplier = supplierSlug ? await getSupplier(supplierSlug) : null;
  const storedSlugs = await getSupplierSlugsWithReviews();
  // A vendor with no reviews has no reviews page.
  if (!supplier || !supplierHasReviews(supplier, storedSlugs)) {
    // /reviews/<vendor> (no suffix) is a natural guess; send it to the page's real address.
    const bare = await getSupplier(slug);
    if (bare && supplierHasReviews(bare, storedSlugs)) permanentRedirect(reviewsPagePath(bare.slug));
    notFound();
  }

  const path = reviewsPagePath(supplier.slug);
  const [seo, offers, allProducts, reviews, content] = await Promise.all([
    getSeoOverride(path),
    getOffersForSupplier(supplier.slug),
    getProducts(),
    getSupplierReviews(supplier),
    getReviewPageContent(supplier),
  ]);
  const { pq, page: pageParam, form: formParam, size: sizeParam } = await searchParams;
  const catalogueQuery = (pq ?? '').trim();

  const productsBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  // Offers whose product no longer resolves are dropped rather than shown with a missing name.
  const resolvedOffers = offers.filter((o) => productsBySlug.has(o.productSlug));

  const logo = supplier.logoUrl ?? supplier.faviconUrl;
  const defaults = reviewsPageSeoDefaults(supplier);
  const shopHref = `/go?to=${encodeURIComponent(supplier.affiliateUrl)}`;
  const reviewCountText = formatReviewCount(supplier.reviewCount);
  const sourceLabel = ratingSourceLabel(supplier.reviewsUrl);
  const rating = supplier.reviewRating;

  // Only facts we actually hold for this vendor, no placeholder figures.
  const productCount = resolvedOffers.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${site.domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Reviews', item: `https://${site.domain}/reviews` },
      { '@type': 'ListItem', position: 3, name: defaults.h1, item: `https://${site.domain}${path}` },
    ],
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Link
          href="/reviews"
          className="group animate-fade-up mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All supplier reviews
        </Link>

        {/* ------------------------------------------------------------ Hero */}
        <section id="overview" className="animate-fade-up animate-delay-100 relative scroll-mt-24 overflow-hidden rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8 xl:pb-[18px]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16">
            <div className="animate-drift h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative w-fit shrink-0">
                  <SupplierLogo
                    src={logo}
                    name={supplier.name}
                    alt={`${supplier.name} logo`}
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
                  <span className="eyebrow">Reviews</span>
                  <h1 className="mt-2 text-3xl font-black text-content sm:text-5xl">
                    {seo?.h1 ? (
                      seo.h1
                    ) : (
                      <>
                        {supplier.name} <span className="text-accent">Reviews</span>
                      </>
                    )}
                  </h1>
                  {content.intro ? (
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{content.intro}</p>
                  ) : null}

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {supplier.foundedYear !== null ? (
                      <li className="animate-fade-up animate-delay-200 inline-flex items-center gap-1.5 rounded-pill border border-accent/20 bg-accent-tint px-3 py-1.5 text-xs font-bold text-accent-strong">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        Est. {supplier.foundedYear}
                      </li>
                    ) : null}
                    <li className="animate-fade-up animate-delay-300 inline-flex items-center gap-1.5 rounded-pill border border-accent/20 bg-accent-tint px-3 py-1.5 text-xs font-bold text-accent-strong">
                      <BoxIcon className="h-3.5 w-3.5" />
                      {productCount} {productCount === 1 ? 'Product' : 'Products'}
                    </li>
                  </ul>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <a
                      href={shopHref}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      className="btn-3d group/cta inline-flex min-w-0 basis-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-strong sm:basis-auto"
                    >
                      <span className="truncate">Shop {supplier.name}</span>
                      <ExternalIcon className="h-4 w-4 shrink-0 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                    </a>
                    <ShareButton
                      title={`${supplier.name} reviews`}
                      url={`https://${site.domain}${path}`}
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

            </div>

            {/* The overall rating: the number first, then the stars, then where to read more. */}
            <aside
              aria-label={`${supplier.name} overall rating`}
              className="animate-fade-up animate-delay-300 relative z-10 self-start overflow-hidden rounded-panel border border-accent/30 bg-gradient-to-b from-accent-tint to-surface p-5 shadow-card sm:p-6"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/15 blur-2xl motion-safe:animate-pulse" />
              <p className="relative inline-flex items-center gap-2 rounded-pill bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
                <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-accent motion-safe:animate-pulse" />
                {rating !== null ? `Rated on ${sourceLabel}` : 'Overall rating'}
              </p>

              {rating !== null ? (
                <>
                  <p className="mt-4 flex items-end gap-2">
                    <span className="text-6xl font-black leading-none tracking-tight text-accent sm:text-7xl">
                      {formatRating(rating)}
                    </span>
                    <span className="pb-2 text-sm font-black uppercase text-accent-strong">/ 5</span>
                  </p>
                  <p className="mt-4 flex flex-wrap items-center gap-2">
                    <StarRating rating={rating} starClassName="h-5 w-5" />
                    <span className="text-sm font-semibold text-muted">
                      {reviewCountText ? `${reviewCountText} reviews` : 'Review count not listed'}
                    </span>
                  </p>
                </>
              ) : (
                <div className="mt-4 rounded-card border border-dashed border-accent/30 bg-surface-raised p-5">
                  <p className="flex items-center gap-2 text-lg font-black text-content">
                    <StarIcon className="h-5 w-5 text-line" />
                    Not rated yet
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    We don&rsquo;t hold a rating for {supplier.name} yet, so none is shown rather than an estimate.
                  </p>
                </div>
              )}

              {supplier.reviewsUrl ? (
                <a
                  href={supplier.reviewsUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="group/src mt-5 inline-flex w-full items-center justify-center gap-2 rounded-chip border border-accent/40 bg-surface px-5 py-3 text-sm font-bold text-accent-strong transition-colors hover:border-accent hover:bg-accent-tint"
                >
                  Read all reviews on {sourceLabel}
                  <ExternalIcon className="h-4 w-4 transition-transform group-hover/src:-translate-y-0.5 group-hover/src:translate-x-0.5" />
                </a>
              ) : null}
              <a
                href={shopHref}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="btn-3d group/shop mt-3 flex w-full items-center justify-center gap-2 rounded-chip bg-accent px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
              >
                Shop {supplier.name}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/shop:translate-x-1" />
              </a>
              <p className="mt-4 text-xs leading-5 text-muted">{content.ratingNote}</p>
            </aside>
          </div>

          {/* Same "Jump to" bar as the compound pages, scoped to this page's sections. */}
          <div className="relative mb-10 ml-2.5 mt-4 flex items-center gap-3 xl:mb-0 xl:ml-[120px] xl:-mt-[30px]">
            <span className="eyebrow hidden shrink-0 sm:inline">Jump to</span>
            <JumpToNav
              items={[
                { id: 'overview', label: 'Overview' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'policies', label: 'Policies' },
                { id: 'products', label: 'Products' },
                { id: 'faq', label: 'FAQ' },
              ]}
            />
          </div>
        </section>

        {/* ------------------------------------------------------- Coupon banner */}
        {supplier.coupon ? (
          <div className="animate-fade-up relative mt-6 flex flex-col gap-4 rounded-card border-2 border-dashed border-coupon/50 bg-coupon-tint p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-coupon text-coupon-ink motion-safe:animate-pulse">
                <TagIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-micro font-bold uppercase tracking-wide text-coupon-ink">Exclusive {supplier.name} offer</p>
                <p className="text-lg font-black text-coupon-ink">{supplier.coupon.percentOff}% off with coupon</p>
              </div>
            </div>
            {/* Roomier than CopyCode's default chip padding: it is this banner's main call to action. */}
            <CopyCode code={supplier.coupon.code} className="px-4 py-2.5" />
          </div>
        ) : null}

        {/* ---------------------------------------------------------- Reviews */}
        <ReviewListSection
          supplierName={supplier.name}
          reviews={reviews}
          rating={rating}
          reviewCountText={reviewCountText}
          sourceLabel={sourceLabel}
          reviewsUrl={supplier.reviewsUrl}
          note={content.reviewsNote}
          className="mt-12"
        />

        {/* ------------------------------------------- Shipping, payment, policies */}
        <div id="policies" className="scroll-mt-24">
          <StoreDetailsSection supplier={supplier} className="mt-12" />
        </div>

        {/* ---------------------------------------------------------- Catalog */}
        <SupplierCatalogSection
          supplier={supplier}
          offers={resolvedOffers}
          productsBySlug={productsBySlug}
          id="products"
          basePath={path}
          query={catalogueQuery}
          pageParam={pageParam}
          formParam={formParam}
          sizeParam={sizeParam}
          className="mt-12"
        />

        {/* ------------------------------------------------------------- FAQ */}
        <PageFaqSection path={path} className="mt-12" />
      </div>
    </div>
  );
}
