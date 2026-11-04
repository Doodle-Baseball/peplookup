import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getOffersForSupplier,
  getProducts,
  getSupplierSlugsWithReviews,
  getSuppliers,
  supplierHasReviews,
} from '@/lib/repository';
import { site } from '@/config/site';
import { couponPagePath } from '@/lib/coupon-pages';
import { reviewsPagePath } from '@/lib/review-pages';
import { formatDate } from '@/lib/format';
import { loadCouponPageOrExit } from '@/lib/coupon-page-route';
import { supplierGoPath } from '@/lib/go-links';
import { COUPON_DETAIL_KEYS, COUPON_DETAIL_LABELS } from '@/lib/coupon-page-content';
import { getCouponPageContent } from '@/lib/coupon-page-content-store';
import { couponPageSeoDefaults, pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageSeo } from '@/components/seo/page-seo';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { CouponCopyBlock } from '@/components/coupons/coupon-copy-block';
import { JumpToNav } from '@/components/product-card/jump-to-nav';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BoxIcon,
  CalendarIcon,
  CheckBadgeIcon,
} from '@/components/icons/icons';
import { getSupplierTextContext } from '@/lib/seo/page-quality';
import { isContentV2 } from '@/lib/seo/protected';
import { getSupplierFacts } from '@/lib/supplier-facts-store';
import { CouponPriceTable } from '@/components/supplier-card/supplier-facts-sections';
import { qualifyClaims } from '@/lib/seo/text';

/**
 * The public address is /coupons/<vendor-slug>-coupon-code, so the route's
 * `slug` is that whole last segment, suffix included.
 */
export async function generateStaticParams() {
  const suppliers = await getSuppliers();
  return suppliers
    .filter((supplier) => supplier.coupon !== null)
    .map((supplier) => ({ slug: `${supplier.slug}-coupon-code` }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadCouponPageOrExit(slug);
  const defaults = couponPageSeoDefaults(found.supplier, found.coupon);
  // Indexing is decided by withSeo(), through the one rule in src/lib/seo/indexing.ts.
  return withSeo(defaults.path, pageMetadata(defaults));
}

/** Wraps each occurrence of the coupon code in a monospace chip, so edited text keeps the code visible. */
function WithCode({ text, code }: { text: string; code: string }) {
  if (!code) return <>{text}</>;
  const parts = text.split(code);
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? (
            <code className="rounded-chip bg-accent-tint px-1.5 py-0.5 font-mono text-[0.9em] font-bold text-accent-strong">
              {code}
            </code>
          ) : null}
        </span>
      ))}
    </>
  );
}

/**
 * A coupon page is about the coupon alone: the code, when it was last tested,
 * how to apply it, its conditions and coupon-only questions. The supplier's
 * catalogue, COAs and general FAQ live on its supplier page, linked below.
 */
export default async function CouponCodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supplier, coupon } = await loadCouponPageOrExit(slug);

  const path = couponPagePath(supplier.slug);
  const [seo, offers, allProducts, content, slugsWithReviews] = await Promise.all([
    getSeoOverride(path),
    getOffersForSupplier(supplier.slug),
    getProducts(),
    getCouponPageContent(supplier, coupon),
    getSupplierSlugsWithReviews(),
  ]);

  const productsBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  // Offers whose product no longer resolves are dropped rather than shown with a missing name.
  const resolvedOffers = offers.filter((o) => productsBySlug.has(o.productSlug));

  const logo = supplier.logoUrl ?? supplier.faviconUrl;
  const defaults = couponPageSeoDefaults(supplier, coupon);
  const shopHref = supplierGoPath(supplier.slug, 'website');
  const profilePath = `/suppliers/${supplier.slug}`;

  // Only facts we actually hold for this vendor, no placeholder figures.
  const productCount = resolvedOffers.length;
  // Shown only when someone has actually tested the code; never "verified" without a date.
  const lastTested = supplier.couponVerifiedAt ?? null;
  const reviewsPage = supplierHasReviews(supplier, slugsWithReviews) ? reviewsPagePath(supplier.slug) : null;
  // Content v2: what the code does to this supplier's real prices, a table no other page carries.
  const couponRows = isContentV2() ? (await getSupplierFacts(supplier)).couponRows : [];
  // Purity, testing and same-day wording follows the same rules as the supplier page (A7).
  const claimContext = await getSupplierTextContext(path);
  const intro = content.intro && claimContext ? qualifyClaims(content.intro, claimContext) : content.intro;

  return (
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
        <PageSeo
          seo={defaults}
          supplier={supplier}
          dataDates={resolvedOffers.map((offer) => offer.scrapedAt)}
        />

        <Link
          href="/coupons"
          className="group animate-fade-up mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All coupon codes
        </Link>

        {/* ------------------------------------------------------------ Hero */}
        <section id="overview" className="animate-fade-up animate-delay-100 relative scroll-mt-24 overflow-hidden rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6 xl:pb-[10px]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16">
            <div className="animate-drift h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8">
            {/* Logo on the left with the text beside it; stacked on phones. */}
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative ml-2.5 mt-2.5 w-fit shrink-0">
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
                <span className="eyebrow mt-2.5 block">Coupon code</span>
                <h1 className="mt-1.5 text-3xl font-black text-content sm:text-5xl">
                  {seo?.h1 ? (
                    seo.h1
                  ) : (
                    <>
                      {supplier.name} <span className="text-accent">Coupon Code</span>
                    </>
                  )}
                </h1>
                {intro ? (
                  <p className="mt-2.5 max-w-2xl text-base leading-7 text-muted">{intro}</p>
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
              </div>
            </div>

            {/* The offer itself: percentage first, then the code to copy. */}
            <aside
              aria-label={`${supplier.name} coupon`}
              className="animate-fade-up animate-delay-300 relative z-10 self-start rounded-panel border border-line bg-surface-raised p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift"
            >
              <p className="relative flex w-fit items-center gap-2 rounded-pill bg-brand px-2.5 py-1 text-xs font-bold text-white">
                <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-accent motion-safe:animate-pulse" />
                Listed by {site.name}
              </p>
              <p className="mt-3 flex items-end gap-2">
                <span className="text-6xl font-black leading-none tracking-tight text-accent">{coupon.percentOff}%</span>
                <span className="pb-1.5 text-sm font-black uppercase text-content">Off</span>
              </p>
              {lastTested ? (
                <p className="mt-3 text-xs font-semibold text-muted">
                  Last tested: <time dateTime={lastTested}>{formatDate(lastTested)}</time>
                </p>
              ) : null}
              <p className="mt-4 text-xs font-bold text-content">{supplier.name} discount code</p>
              <CouponCopyBlock code={coupon.code} className="mt-1.5" />
              <a
                href={shopHref}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="btn-3d group/shop mt-3 flex w-full items-center justify-center gap-2 rounded-chip bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
              >
                Shop {supplier.name}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/shop:translate-x-1" />
              </a>
              <p className="mt-3 text-xs leading-4 text-muted">
                Final eligibility and savings are determined by the supplier at checkout. Some links to {supplier.name} are
                affiliate links: {site.name} may earn a commission, at no extra cost to you.
              </p>
            </aside>
          </div>

          {/* Same "Jump to" bar as the compound pages, scoped to this page's sections. */}
          <div className="relative mb-10 ml-2.5 mt-4 flex items-center gap-3 xl:mb-0 xl:ml-[120px] xl:-mt-[30px]">
            <span className="eyebrow hidden shrink-0 sm:inline">Jump to</span>
            <JumpToNav
              items={[
                { id: 'overview', label: 'Overview' },
                { id: 'coupon-details', label: 'Coupon Details' },
                { id: 'how-to-use', label: 'How to Use' },
                { id: 'faq', label: 'FAQ' },
              ]}
            />
          </div>
        </section>

        {/* --------------------------------------------------- Offer details */}
        <section id="coupon-details" aria-labelledby="offer-details-heading" className="mt-12 scroll-mt-24">
          <p className="eyebrow">Offer details</p>
          <h2 id="offer-details-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
            {supplier.name} <span className="text-accent">Coupon Details</span>
          </h2>

          <dl className="mt-5 overflow-hidden rounded-card border border-line border-t-accent bg-surface-raised shadow-card">
            {COUPON_DETAIL_KEYS.map((key, index) => (
              <div
                key={key}
                className="animate-fade-up group grid grid-cols-1 gap-1 border-b border-line px-5 py-3.5 transition-colors last:border-b-0 hover:bg-accent-tint sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6 sm:px-6 sm:py-4"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <dt className="flex items-start gap-2.5 text-sm font-black text-content sm:text-base">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-accent transition-transform duration-150 group-hover:scale-150"
                  />
                  {COUPON_DETAIL_LABELS[key]}
                </dt>
                <dd className="min-w-0 pl-4 text-sm leading-7 text-muted sm:pl-0 sm:text-base">
                  <WithCode text={content.details[key]} code={coupon.code} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------------------------------- How to use */}
        <section
          id="how-to-use"
          aria-labelledby="how-to-heading"
          className="mt-12 scroll-mt-24 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6"
        >
          <p className="eyebrow">Step by step</p>
          <h2 id="how-to-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
            How to use the {supplier.name} <span className="text-accent">promo code</span>
          </h2>

          <ol className="mt-5 space-y-3">
            {content.steps.map((step, index) => (
              <li
                key={index}
                className="animate-fade-up flex items-start gap-4"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand text-sm font-black text-white shadow-card">
                  {index + 1}
                </span>
                <p className="min-w-0 pt-1.5 text-sm leading-7 text-muted sm:text-base">
                  <WithCode text={step} code={coupon.code} />
                </p>
              </li>
            ))}
          </ol>

          <p className="animate-fade-up mt-6 rounded-card border border-accent/30 bg-accent-tint p-4 text-sm leading-6 text-accent-strong">
            <span className="font-black">Working note:</span> <WithCode text={content.workingNote} code={coupon.code} />
          </p>
        </section>

        <CouponPriceTable supplierName={supplier.name} percentOff={coupon.percentOff} rows={couponRows} className="mt-12" />

        {/* ------------------------------------------- Where to go next */}
        <nav aria-label={`More about ${supplier.name}`} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={profilePath}
            className="group/profile inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            See all {supplier.name} products and prices
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/profile:translate-x-1" />
          </Link>
          {reviewsPage ? (
            <Link
              href={reviewsPage}
              className="group/reviews inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
            >
              Read {supplier.name} reviews
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/reviews:translate-x-1" />
            </Link>
          ) : null}
        </nav>

        <p className="mt-6 text-center text-xs leading-5 text-faint">
          {site.name} lists this code for research-use comparison. Codes are set by {supplier.name}, not by {site.name},
          and may change or be withdrawn at any time.
        </p>

        {/* ------------------------------------------------------------- FAQ */}
        <PageFaqSection path={path} className="mt-10" />
      </div>
    </div>
  );
}
