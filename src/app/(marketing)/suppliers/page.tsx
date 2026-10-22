import type { Metadata } from 'next';
import {
  getSuppliers,
  getAllOffers,
  getSupplierSlugsWithReviews,
  orderSuppliersForDisplay,
} from '@/lib/repository';
import { cn } from '@/lib/cn';
import { SupplierCard } from '@/components/supplier-card/supplier-card';
import { CountUp } from '@/components/ui/count-up';
import { ArrowRightIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { SupplierSearchBox } from '@/components/supplier-card/supplier-search-box';
import { SupplierOrderWatcher } from '@/components/supplier-card/supplier-order-watcher';
import {
  SupplierDirectoryProvider,
  SupplierDirectorySearchForm,
} from '@/components/suppliers/supplier-directory-state';
import { PopularSupplierChips } from '@/components/suppliers/popular-supplier-chips';
import { SupplierDirectoryResults } from '@/components/suppliers/supplier-directory-results';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { SupplierEvaluationGuide } from '@/components/suppliers/supplier-evaluation-guide';
import { PageSeo } from '@/components/seo/page-seo';

const PAGE = staticSeoPage('/suppliers');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

/** Quick-pick chips under the search field, sized to sit on a single row. */
const POPULAR_SUPPLIER_COUNT = 5;
const SUPPLIERS_PER_PAGE = 21;

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
  // Search and paging happen in the browser; these only set the starting view for an old `?q=`/`?page=` link.
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? '').trim();
  const initialPage = Math.max(1, Number(pageParam) || 1);

  const [suppliers, seo, slugsWithReviews, allOffers] = await Promise.all([
    getSuppliers(),
    getSeoOverride(PAGE.path),
    getSupplierSlugsWithReviews(),
    getAllOffers(),
  ]);
  // Same ranking as /admin/vendors (see orderSuppliersForDisplay): a
  // drag-and-drop position from the admin wins outright, Featured and the
  // reviews/coupon score only rank whatever nobody has manually placed.
  // Searching narrows this list in the browser without reordering it.
  const orderedSuppliers = orderSuppliersForDisplay(suppliers, slugsWithReviews);
  const directoryItems = orderedSuppliers.map((supplier) => ({
    name: supplier.name,
    url: `/suppliers/${supplier.slug}`,
  }));

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

      <SupplierDirectoryProvider initialQuery={query} initialPage={initialPage}>
      {/* Neither `overflow-hidden` nor `isolate`: the search box's suggestions panel
          hangs below this section and must paint over the cards that follow it. */}
      <section className="relative z-20">
        <div className="mx-auto max-w-shell px-4 pb-10 pt-12 text-center sm:pt-16">
          <PageSeo seo={PAGE} itemList={directoryItems} />
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
                Research Peptide <span className="block text-accent">Suppliers Directory</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Compare {suppliers.length.toLocaleString('en-US')} research peptide suppliers by price per mg, COA links, shipping, payment options and coupon
            codes in one directory.
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
            <SupplierDirectorySearchForm>
              <label htmlFor="supplier-search" className="eyebrow">
                Search the directory
              </label>
              <div className="mt-3 flex items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <SupplierSearchBox suppliers={searchSuggestions} />
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
            </SupplierDirectorySearchForm>

            {popularSuppliers.length > 0 ? (
              <PopularSupplierChips
                suppliers={popularSuppliers.map((supplier) => ({
                  slug: supplier.slug,
                  name: supplier.name,
                  logoUrl: supplier.logoUrl ?? supplier.faviconUrl,
                }))}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-8">
        <SupplierDirectoryResults
          perPage={SUPPLIERS_PER_PAGE}
          entries={orderedSuppliers.map((supplier) => ({
            slug: supplier.slug,
            name: supplier.name,
            card: <SupplierCard supplier={supplier} productCount={listingCountBySlug.get(supplier.slug) ?? 0} />,
          }))}
        />
      </section>
      </SupplierDirectoryProvider>

      <SupplierEvaluationGuide vendorCount={suppliers.length} />

      <section className="mx-auto max-w-shell px-4 pb-12">
        <PageFaqSection path="/suppliers" />
      </section>
    </>
  );
}
