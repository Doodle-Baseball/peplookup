import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllOffers,
  getSupplier,
  getSuppliers,
  getOffersForSupplier,
  getProducts,
  getSupplierReviews,
} from '@/lib/repository';
import { shippingSteps } from '@/lib/format';
import { cn } from '@/lib/cn';
import { site } from '@/config/site';
import { pageMetadata, supplierSeoDefaults } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { Badge } from '@/components/ui/badge';
import { CopyCode } from '@/components/ui/copy-code';
import { Pagination } from '@/components/ui/pagination';
import { Popover } from '@/components/ui/popover';
import { ShareButton } from '@/components/ui/share-button';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { PatternBackdrop } from '@/components/layout/pattern-backdrop';
import { OfferCard } from '@/components/offer-card/offer-card';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { ShippingModalContent } from '@/components/supplier-card/shipping-modal-content';
import { PaymentModalContent } from '@/components/supplier-card/payment-modal-content';
import { SupplierTrustPanel } from '@/components/supplier-card/supplier-trust-panel';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BoxIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  DocumentIcon,
  ExternalIcon,
  FlaskIcon,
  SearchIcon,
  TagIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/icons/icons';
import type { Offer } from '@/lib/schema';
import { LiveSearchInput } from '@/components/ui/live-search-input';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { SupplierContentSections } from '@/components/supplier-content/supplier-content-sections';
import { getSupplierContent } from '@/lib/supplier-content-store';

/** Product Catalog tiles per page, 2 rows of the 3-column grid. */
const CATALOG_PAGE_SIZE = 6;
/** How many other vendors show in "Explore more vendors". */
const EXPLORE_VENDOR_COUNT = 6;

/** Store-detail cards lift and pick up the accent on hover, the same motion as the directory cards. */
const STORE_CARD_CLASS =
  'group flex h-full min-w-0 items-start gap-3 rounded-card border border-line bg-surface-raised p-5 text-left shadow-card transition-all duration-150 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift';

const POLICY_LINK_CLASS =
  'inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-bold uppercase text-content transition-colors hover:border-accent hover:text-accent-strong';

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
  return withSeo(`/suppliers/${supplier.slug}`, pageMetadata(supplierSeoDefaults(supplier)));
}

function StoreDetail({
  icon,
  label,
  children,
  action,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  action?: string;
}) {
  return (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong transition-transform duration-150 group-hover:scale-110">
        {icon}
      </span>
      <span className="block min-w-0 flex-1">
        <span className="eyebrow block">{label}</span>
        <span className="mt-1.5 block text-sm font-bold leading-6 text-content">{children}</span>
        {action ? (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent">
            {action}
            <ChevronRightIcon className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </span>
        ) : null}
      </span>
    </>
  );
}

/** Steps shown on the card before "View details"; the popup lists them all. */
const SHIPPING_CARD_STEPS = 1;

/** The shipping card's body: just the first step of the supplier's shipping note, then how many more the popup has. */
function ShippingSummary({ steps }: { steps: string[] }) {
  const shown = steps.slice(0, SHIPPING_CARD_STEPS);
  const more = steps.length - shown.length;
  return (
    <span className="block space-y-1">
      {shown.map((step) => (
        <span key={step} className="flex items-start gap-2 font-semibold">
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          {step}
        </span>
      ))}
      {more > 0 ? <span className="block text-xs font-semibold text-muted">+{more} more</span> : null}
    </span>
  );
}

export default async function SupplierPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pq?: string; page?: string }>;
}) {
  const { slug } = await params;
  // The SEO override is keyed by path, so it needs only the slug, fetching it
  // alongside the supplier saves a whole sequential round trip to the database.
  const [supplier, seo] = await Promise.all([getSupplier(slug), getSeoOverride(`/suppliers/${slug}`)]);
  if (!supplier) notFound();

  const { pq, page: pageParam } = await searchParams;
  const catalogueQuery = (pq ?? '').trim();

  // One query for every compound up front instead of one round trip per
  // distinct product among this vendor's offers.
  const [offers, allProducts, reviews, allSuppliers, marketOffers] = await Promise.all([
    getOffersForSupplier(supplier.slug),
    getProducts(),
    getSupplierReviews(supplier),
    getSuppliers(),
    getAllOffers(),
  ]);
  const supplierContent = await getSupplierContent(supplier, marketOffers);
  const productsBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  // Offers whose product no longer resolves are dropped rather than shown
  // with a missing name.
  const resolvedOffers = offers.filter((o) => productsBySlug.has(o.productSlug));
  const catalogueOffers = catalogueQuery
    ? resolvedOffers.filter((o) =>
        productsBySlug.get(o.productSlug)!.name.toLowerCase().includes(catalogueQuery.toLowerCase()),
      )
    : resolvedOffers;

  const pageCount = Math.max(1, Math.ceil(catalogueOffers.length / CATALOG_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(pageParam) || 1), pageCount);
  const pagedOffers = catalogueOffers.slice(
    (currentPage - 1) * CATALOG_PAGE_SIZE,
    currentPage * CATALOG_PAGE_SIZE,
  );

  const otherSuppliers = allSuppliers
    .filter((s) => s.slug !== supplier.slug)
    .slice(0, EXPLORE_VENDOR_COUNT);

  // The vendor's real COA record, derived from offers we already loaded rather
  // than a second query, this is the same data /lab-reports groups by vendor.
  const labTestedOffers = resolvedOffers.filter((o) => o.labReport !== null);
  const labSummary = {
    testCount: labTestedOffers.length,
    labName: supplier.coaLabName,
    productNames: [
      ...new Set(labTestedOffers.map((offer) => productsBySlug.get(offer.productSlug)!.name)),
    ],
  };

  const logo = supplier.logoUrl ?? supplier.faviconUrl;
  const hasShippingInfo = supplier.shippingCost.kind !== 'unknown' || supplier.shippingSpeed !== null;
  const hasPaymentInfo = supplier.paymentMethods.length > 0;
  const hasPolicies = Boolean(supplier.policyUrls.shipping || supplier.policyUrls.returns);
  const storeCardCount = [hasShippingInfo, hasPaymentInfo, hasPolicies].filter(Boolean).length;

  // Only facts we actually hold for this vendor, no placeholder scores.
  const glance: { label: string; value: string; hint?: string }[] = [
    { label: 'Products listed', value: String(resolvedOffers.length) },
    ...(supplier.labScore !== null ? [{ label: 'Lab score', value: `${supplier.labScore.toFixed(1)}/10` }] : []),
    ...(supplier.foundedYear !== null ? [{ label: 'Established', value: String(supplier.foundedYear) }] : []),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: supplier.name,
    url: supplier.affiliateUrl || supplier.homepageUrl,
    ...(supplier.foundedYear ? { foundingDate: String(supplier.foundedYear) } : {}),
  };

  return (
    <div className="relative isolate overflow-hidden">
      <PatternBackdrop mask="radial-gradient(ellipse at top, black 10%, transparent 55%)" />

      <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Link
          href="/suppliers"
          className="group animate-fade-up mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All vendors
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

                {supplier.description ? (
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{supplier.description}</p>
                ) : null}

                <div className="mt-6 flex items-center gap-2">
                  <a
                    href={`/go?to=${encodeURIComponent(supplier.affiliateUrl)}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="btn-3d group/cta inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-strong sm:flex-none"
                  >
                    {/* The name is already the heading right above; phones get the short label. */}
                    <span className="truncate">
                      <span className="sm:hidden">Visit Site</span>
                      <span className="hidden sm:inline">View {supplier.name}</span>
                    </span>
                    <ExternalIcon className="h-4 w-4 shrink-0 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                  </a>
                  <ShareButton
                    title={supplier.name}
                    url={`https://${site.domain}/suppliers/${supplier.slug}`}
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
              <CopyCode code={supplier.coupon.code} className="px-4 py-2.5" />
            </div>
          ) : null}
        </section>

        {/* ---------------------------------------------------- Store details */}
        {storeCardCount > 0 ? (
          <section aria-labelledby="store-details-heading" className="reveal mt-12">
            <p className="eyebrow">Before you order</p>
            <h2 id="store-details-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
              Shipping, payment <span className="text-accent">&amp; policies.</span>
            </h2>

            <div
              className={cn(
                'mt-5 grid grid-cols-1 gap-4',
                storeCardCount === 3 && 'md:grid-cols-3',
                storeCardCount === 2 && 'md:grid-cols-2',
              )}
            >
              {hasShippingInfo ? (
                <Popover
                  title="Shipping Information"
                  triggerClassName={STORE_CARD_CLASS}
                  trigger={
                    <StoreDetail icon={<TruckIcon className="h-5 w-5" />} label="Shipping" action="View details">
                      <ShippingSummary steps={shippingSteps(supplier.shippingSpeed)} />
                    </StoreDetail>
                  }
                >
                  <ShippingModalContent
                    supplierName={supplier.name}
                    affiliateUrl={supplier.affiliateUrl}
                    shippingCost={supplier.shippingCost}
                    shippingSpeed={supplier.shippingSpeed}
                  />
                </Popover>
              ) : null}

              {hasPaymentInfo ? (
                <Popover
                  title="Payment Methods"
                  triggerClassName={STORE_CARD_CLASS}
                  trigger={
                    <StoreDetail icon={<WalletIcon className="h-5 w-5" />} label="Payment methods" action="View details">
                      {supplier.paymentMethods.join(', ')}
                    </StoreDetail>
                  }
                >
                  <PaymentModalContent
                    supplierName={supplier.name}
                    affiliateUrl={supplier.affiliateUrl}
                    paymentMethods={supplier.paymentMethods}
                  />
                </Popover>
              ) : null}

              {hasPolicies ? (
                <div className={STORE_CARD_CLASS}>
                  <StoreDetail icon={<DocumentIcon className="h-5 w-5" />} label="Store policies">
                    <span className="mt-1 flex flex-wrap gap-2">
                      {supplier.policyUrls.shipping ? (
                        <a
                          href={supplier.policyUrls.shipping}
                          target="_blank"
                          rel="noopener"
                          className={POLICY_LINK_CLASS}
                        >
                          Shipping
                          <ExternalIcon className="h-3 w-3" />
                        </a>
                      ) : null}
                      {supplier.policyUrls.returns ? (
                        <a
                          href={supplier.policyUrls.returns}
                          target="_blank"
                          rel="noopener"
                          className={POLICY_LINK_CLASS}
                        >
                          Returns
                          <ExternalIcon className="h-3 w-3" />
                        </a>
                      ) : null}
                    </span>
                  </StoreDetail>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------- Catalog */}
        <section
          aria-labelledby="catalog-heading"
          className="reveal mt-12 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Product catalog</p>
              <h2 id="catalog-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
                Products from <span className="text-accent">{supplier.name}.</span>
              </h2>
            </div>
            {resolvedOffers.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-tint px-3 py-1.5 text-sm font-bold text-accent-strong">
                <BoxIcon className="h-4 w-4" />
                {resolvedOffers.length} listed
              </span>
            ) : null}
          </div>

          {resolvedOffers.length === 0 ? (
            <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
              No prices recorded for {supplier.name} yet. Listings appear here once the crawler reads
              them from the vendor&rsquo;s live product pages.
            </p>
          ) : (
            <>
              <form action={`/suppliers/${supplier.slug}`} className="mt-6">
                <label htmlFor="pq" className="sr-only">
                  Search within {supplier.name} catalog
                </label>
                <div className="search-field flex items-center gap-3 border px-4 py-3">
                  <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
                  <LiveSearchInput
                    id="pq"
                    name="pq"
                    defaultValue={catalogueQuery}
                    placeholder={`Search within ${supplier.name} catalog`}
                    className="min-w-0 flex-1 bg-transparent text-sm text-content outline-none placeholder:text-faint"
                  />
                </div>
              </form>

              {catalogueOffers.length === 0 ? (
                <p className="mt-4 rounded-card border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
                  No products match &ldquo;{catalogueQuery}&rdquo;.
                </p>
              ) : (
                <>
                  <ul key={`${catalogueQuery}-${currentPage}`} className="animate-fade-up mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pagedOffers.map((offer: Offer) => (
                      <OfferCard
                        key={offer.id ?? `${offer.productSlug}-${offer.form}-${offer.vialSize}-${offer.vialCount}`}
                        offer={offer}
                        product={productsBySlug.get(offer.productSlug)!}
                        supplier={supplier}
                        headingEntity="product"
                        layout="grid"
                      />
                    ))}
                  </ul>

                  <Pagination
                    label="Product catalog pages"
                    currentPage={currentPage}
                    pageCount={pageCount}
                    hrefForPage={(page) =>
                      `/suppliers/${supplier.slug}?${new URLSearchParams({
                        ...(catalogueQuery ? { pq: catalogueQuery } : {}),
                        page: String(page),
                      })}`
                    }
                  />
                </>
              )}
            </>
          )}
        </section>

        {/* Driven by what this vendor actually has, not a hardcoded slug. */}
        {reviews.length > 0 || supplier.reviewsUrl ? (
          <SupplierTrustPanel
            supplierName={supplier.name}
            supplierSlug={supplier.slug}
            reviews={reviews}
            reviewsUrl={supplier.reviewsUrl}
            reviewRating={supplier.reviewRating}
            labSummary={labSummary}
          />
        ) : null}

        {/* About / Why researchers choose / vs other suppliers, editable per
            vendor from the supplier's popup in /admin/seo. */}
        <SupplierContentSections vendorName={supplier.name} content={supplierContent} className="mt-12" />

        {/* FAQs for this vendor, generated from their own record until a set is
            saved for this path in /admin/seo. */}
        <PageFaqSection path={`/suppliers/${supplier.slug}`} className="mt-14" />

        {/* ---------------------------------------------------------- Explore */}
        {otherSuppliers.length > 0 ? (
          <section aria-labelledby="explore-heading" className="reveal mt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep comparing</p>
                <h2 id="explore-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
                  Explore more <span className="text-accent">vendors.</span>
                </h2>
              </div>
              <Link
                href="/suppliers"
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
                    href={`/suppliers/${other.slug}`}
                    // Plain hover lift rather than `.card-3d`: that class keeps a
                    // `perspective()` + `translateZ(0)` transform applied at rest
                    // (not just on hover), which composites the card onto its own
                    // GPU layer and visibly softens the logo and text on it.
                    className="group flex h-full flex-col items-center gap-3 rounded-card border border-line bg-surface-raised p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
                  >
                    <SupplierLogo
                      src={other.logoUrl ?? other.faviconUrl}
                      name={other.name}
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
