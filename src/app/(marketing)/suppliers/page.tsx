import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getSuppliers,
  getAllOffers,
  countProductsForSupplier,
  getSupplierSlugsWithReviews,
  orderSuppliersForDisplay,
} from '@/lib/repository';
import { cn } from '@/lib/cn';
import { SupplierCard } from '@/components/supplier-card/supplier-card';
import { CountUp } from '@/components/ui/count-up';
import { Pagination } from '@/components/ui/pagination';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { ArrowRightIcon, CloseIcon, SearchIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { SupplierSearchBox } from '@/components/supplier-card/supplier-search-box';
import { SupplierOrderWatcher } from '@/components/supplier-card/supplier-order-watcher';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/suppliers');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

/** Quick-pick chips under the search field, sized to sit on a single row. */
const POPULAR_SUPPLIER_COUNT = 5;
const SUPPLIERS_PER_PAGE = 21;
/** Cards past this index share the last delay, so a full page never waits long to appear. */
const MAX_STAGGERED_CARDS = 8;

/** Search and page both live in the URL, so a filtered view is a link someone can share. */
function suppliersHref(query: string, page = 1) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `/suppliers${qs ? `?${qs}` : ''}`;
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse rounded-card border border-line bg-surface-raised/80 px-3 py-3 shadow-card backdrop-blur sm:px-5 sm:py-4">
      <dt className="text-micro font-bold uppercase text-muted">{label}</dt>
      <dd className="text-2xl font-black text-content sm:text-3xl">
        <CountUp value={value} />
      </dd>
    </div>
  );
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? '').trim();

  const [suppliers, seo, slugsWithReviews, allOffers] = await Promise.all([
    getSuppliers(),
    getSeoOverride(PAGE.path),
    getSupplierSlugsWithReviews(),
    getAllOffers(),
  ]);
  const matching = query
    ? suppliers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : suppliers;

  // Same ranking as /admin/vendors (see orderSuppliersForDisplay): a
  // drag-and-drop position from the admin wins outright, Featured and the
  // reviews/coupon score only rank whatever nobody has manually placed.
  const filtered = orderSuppliersForDisplay(matching, slugsWithReviews);

  const pageCount = Math.max(1, Math.ceil(filtered.length / SUPPLIERS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(pageParam) || 1), pageCount);
  const firstIndex = (currentPage - 1) * SUPPLIERS_PER_PAGE;
  const pageSuppliers = filtered.slice(firstIndex, firstIndex + SUPPLIERS_PER_PAGE);
  // Product counts only for the cards on this page, not every supplier that matched.
  const counts = await Promise.all(pageSuppliers.map((s) => countProductsForSupplier(s.slug)));
  const popularSuppliers = suppliers.slice(0, POPULAR_SUPPLIER_COUNT);
  const labVerifiedCount = suppliers.filter((s) => s.labVerified).length;
  const couponCount = suppliers.filter((s) => s.coupon !== null).length;
  // Listings from suppliers still in the directory; a delisted vendor's leftover rows don't count.
  const listedSlugs = new Set(suppliers.map((s) => s.slug));
  const listingCountBySlug = new Map<string, number>();
  for (const offer of allOffers) {
    if (!listedSlugs.has(offer.supplierSlug)) continue;
    listingCountBySlug.set(offer.supplierSlug, (listingCountBySlug.get(offer.supplierSlug) ?? 0) + 1);
  }
  const searchSuggestions = suppliers.map((s) => ({
    slug: s.slug,
    name: s.name,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    listingCount: listingCountBySlug.get(s.slug) ?? 0,
    createdAt: s.createdAt,
    reviewRating: s.reviewRating,
  }));
  const productCount = allOffers.filter((o) => listedSlugs.has(o.supplierSlug)).length;
  // A listing counts as having a COA when there is a document we can actually open.
  const coaCount = allOffers.filter(
    (o) => listedSlugs.has(o.supplierSlug) && (o.coaUrl || o.labReport?.reportUrl || o.labReport?.labUrl),
  ).length;
  // A headline "0" reads as a negative claim about the directory, so empty
  // stats are left out; the supplier count itself always shows.
  const heroStats = [
    { label: 'Suppliers listed', value: suppliers.length },
    { label: 'Products listed', value: productCount },
    { label: 'COAs published', value: coaCount },
    { label: 'Lab verified', value: labVerifiedCount },
    { label: 'Active coupons', value: couponCount },
  ].filter((stat, index) => index === 0 || stat.value > 0);

  return (
    <>
      <SupplierOrderWatcher />

      {/* Neither `overflow-hidden` nor `isolate`: the search box's suggestions panel
          hangs below this section and must paint over the cards that follow it. */}
      <section className="relative z-20">
        <div className="mx-auto max-w-shell px-4 pb-10 pt-12 text-center sm:pt-16">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Supplier directory
          </span>

          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 ? (
              seo.h1
            ) : (
              <>
                Find the Best <span className="text-accent">Peptide Suppliers.</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Compare prices, shipping, payment options and verification grades from listed vendors.
          </p>

          <dl
            className={cn(
              'animate-fade-up animate-delay-200 mx-auto mt-8 grid gap-2 text-left sm:gap-3',
              heroStats.length === 5 && 'max-w-4xl grid-cols-2 sm:grid-cols-5',
              heroStats.length === 4 && 'max-w-3xl grid-cols-2 sm:grid-cols-4',
              heroStats.length === 3 && 'max-w-2xl grid-cols-2 sm:grid-cols-3',
              heroStats.length === 2 && 'max-w-md grid-cols-2',
              heroStats.length === 1 && 'max-w-xs grid-cols-1',
            )}
          >
            {heroStats.map((stat) => (
              <HeroStat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </dl>

          <div className="animate-fade-up animate-delay-300 mx-auto mt-6 max-w-4xl rounded-panel border border-line bg-surface-raised p-4 text-left shadow-lift sm:p-6">
            <form action="/suppliers" method="get" role="search">
              <label htmlFor="supplier-search" className="eyebrow">
                Search the directory
              </label>
              <div className="mt-3 flex items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <SupplierSearchBox defaultValue={query} suppliers={searchSuggestions} />
                </div>
                <button
                  type="submit"
                  className="btn-3d group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-pill bg-brand px-4 text-sm font-bold text-surface transition-colors hover:bg-brand-strong sm:px-6"
                >
                  {/* Icon-only on phones so the field keeps its width; still announced as "Search". */}
                  <span className="sr-only sm:not-sr-only">Search</span>
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </form>

            {popularSuppliers.length > 0 ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="eyebrow">Popular suppliers</p>
                <ul className="scrollbar-hide mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1">
                  {popularSuppliers.map((supplier) => {
                    const isActive = query.toLowerCase() === supplier.name.toLowerCase();
                    return (
                      <li key={supplier.slug} className="shrink-0">
                        <Link
                          href={suppliersHref(supplier.name)}
                          aria-current={isActive ? 'true' : undefined}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-pill border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5',
                            isActive
                              ? 'border-brand bg-brand text-surface'
                              : 'border-line bg-surface text-content hover:border-accent hover:bg-accent-tint hover:text-accent-strong',
                          )}
                        >
                          {/* `border-0` overrides SupplierLogo's own default border: left as-is,
                              it sits right at the pill's tight left padding and its fixed grey
                              ring doesn't update on hover, reading as a broken/notched border
                              where the two overlap. */}
                          <SupplierLogo
                            src={supplier.logoUrl ?? supplier.faviconUrl}
                            name={supplier.name}
                            size={24}
                            className="h-6 w-6 rounded-full border-0"
                            initialClassName="text-micro"
                          />
                          {supplier.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-line pb-5">
          <div className="min-w-0">
            <p className="eyebrow">{query ? 'Search results' : 'All suppliers'}</p>
            <h2 className="mt-2 text-2xl font-black text-content sm:text-3xl">
              {filtered.length} <span className="text-accent">{filtered.length === 1 ? 'supplier' : 'suppliers'}</span>
              {query ? <span className="font-medium text-muted"> for &ldquo;{query}&rdquo;</span> : null}
            </h2>
            {pageCount > 1 ? (
              <p className="mt-1 text-sm text-muted">
                Showing {firstIndex + 1}–{firstIndex + pageSuppliers.length} of {filtered.length}
              </p>
            ) : null}
          </div>
          {query ? (
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-raised px-3.5 py-2 text-sm font-semibold text-content transition-colors hover:border-accent hover:text-accent-strong"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Clear search
            </Link>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="animate-fade-up rounded-panel border border-dashed border-line bg-surface-raised px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-accent-tint text-accent-strong">
              <SearchIcon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-base font-bold text-content">
              {query ? `No suppliers match "${query}".` : 'No suppliers listed yet.'}
            </p>
            {query ? <p className="mt-1 text-sm text-muted">Try a shorter name, or clear the search to see everyone.</p> : null}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageSuppliers.map((supplier, index) => (
                <li
                  key={supplier.slug}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(index, MAX_STAGGERED_CARDS) * 60}ms` }}
                >
                  <SupplierCard supplier={supplier} productCount={counts[index] ?? 0} />
                </li>
              ))}
            </ul>
            <Pagination
              label="Supplier directory pages"
              currentPage={currentPage}
              pageCount={pageCount}
              hrefForPage={(page) => suppliersHref(query, page)}
            />
          </>
        )}
      </section>

      <section className="mx-auto max-w-shell px-4 pb-12">
        <PageFaqSection path="/suppliers" />
      </section>
    </>
  );
}
