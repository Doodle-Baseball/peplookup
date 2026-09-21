import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getProduct,
  getProducts,
  getOffersForProduct,
  getSuppliers,
  toListing,
} from '@/lib/repository';
import {
  effectivePrice,
  hasDiscount,
  pricePerMg,
  discountPercent,
  rankByPricePerMg,
  couponAdjustedPrice,
  pricePerMgFor,
} from '@/lib/price';
import { formatMoney, formatPerMg } from '@/lib/money';
import { formatDateTime, timeAgo, isStale } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ShareButton } from '@/components/ui/share-button';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { DoseChipsExpandable } from '@/components/product-card/dose-chips-expandable';
import { SupplierChipsExpandable } from '@/components/product-card/supplier-chips-expandable';
import { ListingsLoadMore } from '@/components/product-card/listings-load-more';
import { JumpToNav } from '@/components/product-card/jump-to-nav';
import { site } from '@/config/site';
import { compoundSeoDefaults, pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import type { Offer, Supplier, ProductForm } from '@/lib/schema';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ExternalIcon,
  FlaskIcon,
  TagIcon,
} from '@/components/icons/icons';
import { splitCategories } from '@/lib/categories';

const FORM_LABELS: Record<ProductForm, string> = {
  vial: 'Vial',
  capsule: 'Capsule',
  spray: 'Spray',
  kit: 'Kit',
  pen: 'Pen',
  serum: 'Serum',
};

const DISPLAY_FORMS: ProductForm[] = ['vial', 'capsule', 'spray'];
/** Forms few compounds are sold in; their tabs only show when this compound has such listings. */
const OCCASIONAL_FORMS: ProductForm[] = ['pen', 'serum'];
const DOSAGE_OPTIONS: Record<ProductForm, string[]> = {
  vial: ['2 mg', '5 mg', '6 mg', '10 mg', '15 mg', '20 mg', '30 mg', '40 mg', '50 mg', '100 mg'],
  capsule: ['250 mcg', '500 mcg', '1 mg', '2 mg', '2.5 mg', '5 mg', '10 mg', '20 mg', '30 mg', '50 mg'],
  spray: ['1 mg', '2 mg', '5 mg', '10 mg', '15 mg', '20 mg', '30 mg', '50 mg', '15 mL', '30 mL'],
  kit: [],
  pen: [],
  serum: [],
};

/** Shared by the card and panel shells so every section on the page reads as one system. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';
/** Segmented-control track; items inside use segmentClass(). */
const SEGMENT_TRACK_CLASS = 'grid gap-1 rounded-pill border border-line bg-surface p-1';
/**
 * Column count for the Form track. It has to match the number of tabs exactly: the track is
 * pill-shaped, so a tab wrapping onto a second row leaves an orphan and breaks the pill.
 * Tailwind only emits classes it can see, hence the lookup rather than a template string.
 * Three base forms always show, plus pen/serum when this compound has listings in them.
 */
const SEGMENT_COLS_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};
/** The Tests tab header row and each report row share these columns from md up. */
const REPORT_GRID_CLASS = 'md:grid md:grid-cols-[1.4fr_1fr_0.9fr_auto] md:items-center md:gap-3';
/** Vendor listings shown before the "Load more" button. */
const LISTINGS_PER_PAGE = 20;

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
  return withSeo(`/products/${product.slug}`, pageMetadata(compoundSeoDefaults(product)));
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

/** Builds a link to this page preserving every current filter except the ones overridden. */
function filterHref(slug: string, current: SearchParams, patch: Partial<SearchParams>) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return `/products/${slug}${qs ? `?${qs}` : ''}`;
}

/**
 * One offer per supplier, form, pack size and pack count, used for React keys
 * and "lowest" matching. Form is part of it because a vendor can sell a vial
 * and a spray of the same compound and size.
 */
function offerKey(offer: { supplierSlug: string; form: ProductForm; vialSize: number; vialCount: number }) {
  return `${offer.supplierSlug}-${offer.form}-${offer.vialSize}-${offer.vialCount}`;
}

function segmentClass(isSelected: boolean) {
  return cn(
    'inline-flex items-center justify-center gap-1.5 rounded-pill px-3 py-2 text-sm font-bold transition-colors sm:px-4',
    isSelected ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-content',
  );
}

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
  const seo = await getSeoOverride(`/products/${product.slug}`);

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

  // --- Form tabs (always show Vial / Capsule / Spray, even when a form has no live offers yet) ---
  const formCounts = new Map<ProductForm, number>();
  for (const o of resolvedOffers) formCounts.set(o.form, (formCounts.get(o.form) ?? 0) + 1);
  // Few compounds are sold as pens or serums, so always-on tabs for them would be empty on most pages.
  const availableForms: ProductForm[] = [...DISPLAY_FORMS, ...OCCASIONAL_FORMS.filter((form) => formCounts.has(form))];
  const selectedForm: ProductForm | null =
    (sp.form as ProductForm | undefined) && availableForms.includes(sp.form as ProductForm)
      ? (sp.form as ProductForm)
      : (availableForms[0] ?? null);
  const offersForForm = selectedForm ? resolvedOffers.filter((o) => o.form === selectedForm) : [];

  // --- Dosage chips for the selected form, grouped by vial size × count ---
  const doseMap = new Map<string, { vialSize: number; vialCount: number; label: string }>();
  for (const o of offersForForm) {
    const key = `${o.vialSize}-${o.vialCount}`;
    if (doseMap.has(key)) continue;
    const mg = o.vialSize / 1000;
    const label = o.vialCount > 1 ? `${mg} mg · ${o.vialCount} vials` : `${mg}mg`;
    doseMap.set(key, { vialSize: o.vialSize, vialCount: o.vialCount, label });
  }

  const fallbackDoseMap = new Map<string, { vialSize: number; vialCount: number; label: string }>();
  const fallbackLabels = DOSAGE_OPTIONS[selectedForm ?? 'vial'] ?? [];
  for (const label of fallbackLabels) {
    fallbackDoseMap.set(label, { vialSize: 0, vialCount: 1, label });
  }

  const doseOptions = doseMap.size > 0 ? [...doseMap.entries()].sort((a, b) => a[1].vialSize - b[1].vialSize) : [...fallbackDoseMap.entries()];
  const selectedDoseKey = sp.dose && doseMap.has(sp.dose)
    ? sp.dose
    : sp.dose && fallbackDoseMap.has(sp.dose)
      ? sp.dose
      : null;
  const selectedDoseLabel = selectedDoseKey
    ? (doseMap.get(selectedDoseKey) ?? fallbackDoseMap.get(selectedDoseKey))?.label
    : undefined;

  const offersForDose = selectedDoseKey
    ? offersForForm.filter((o) => `${o.vialSize}-${o.vialCount}` === selectedDoseKey)
    : offersForForm;

  // --- Prices tab: stock filter, supplier filter, sort ---
  const stockFilter = sp.stock === 'in' ? 'in' : 'all';
  const supplierFilter = sp.supplier ?? '';
  const sort = sp.sort === 'price-desc' ? 'price-desc' : 'price-asc';
  const view = sp.view === 'permg' ? 'permg' : 'total';
  const tab = sp.tab === 'tests' || sp.tab === 'history' ? sp.tab : 'prices';

  let priceRows = offersForDose
    .filter((o) => (stockFilter === 'in' ? o.inStock : true))
    .filter((o) => (supplierFilter ? o.supplierSlug === supplierFilter : true));

  priceRows = priceRows.sort((a, b) => {
    const priceA = effectivePrice(toListing(a));
    const priceB = effectivePrice(toListing(b));
    // Out-of-stock rows sort after in-stock ones regardless of direction.
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return sort === 'price-asc' ? priceA - priceB : priceB - priceA;
  });

  // Only worth flagging when there is something to beat.
  const bestRow = priceRows.length > 1 ? lowestPerMg(priceRows) : null;
  // Price rows are all of the selected form, so the best row shares it.
  const bestRowKey = bestRow && selectedForm ? offerKey({ ...bestRow.listing, form: selectedForm }) : null;

  const supplierOptions = [...new Set(offersForDose.map((o) => o.supplierSlug))]
    .map((s) => suppliersBySlug.get(s)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.summary ?? undefined,
    category: product.category ?? undefined,
    offers: resolvedOffers.map((offer) => {
      const listing = toListing(offer);
      const supplier = suppliersBySlug.get(offer.supplierSlug)!;
      const basePrice = effectivePrice(listing);
      // Matches the price row below: a coupon only fills in when there's no
      // already-recorded sale price, so structured data never contradicts
      // what the page itself shows for the same offer.
      const couponPercentOff = !hasDiscount(listing) ? (supplier.coupon?.percentOff ?? null) : null;
      const price = couponPercentOff !== null ? couponAdjustedPrice(basePrice, couponPercentOff) : basePrice;
      return {
        '@type': 'Offer',
        price: price / 100,
        priceCurrency: listing.currency,
        availability: offer.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: offer.productUrl,
        seller: { '@type': 'Organization', name: supplier.name },
      };
    }),
  };

  const research = product.research;
  const dosingFacts = [
    { label: 'Route', value: research.route },
    { label: 'Example range', value: research.exampleRange },
    { label: 'Frequency', value: research.frequency },
    { label: 'Timing', value: research.timing, wide: true },
  ].filter((fact): fact is { label: string; value: string; wide?: boolean } => Boolean(fact.value));

  const genericFaqs = [
    {
      q: `What is ${product.name}?`,
      a: `${product.name} is a peptide compound used in research settings. It is commonly studied for its role in ${product.category?.toLowerCase() ?? 'research and formulation work'}, and many researchers compare supplier quality, purity, and testing data before purchasing.`,
    },
    {
      q: `What are the research benefits of ${product.name}?`,
      a: `${product.name} is often evaluated for its potential influence on signaling pathways, recovery support, and targeted research applications. Research interest varies by peptide, formulation, and study design, so buyers typically review purity, dose, and independent lab verification before choosing a source.`,
    },
    {
      q: `How does ${product.name} work?`,
      a: `Like other research peptides, ${product.name} is typically studied for how it interacts with specific biological pathways and receptor systems. In practice, the way it is formulated, dosed, and tested matters as much as the compound itself, which is why verified suppliers and transparent COAs are important.`,
    },
    {
      q: `Is ${product.name} for research use only?`,
      a: `Yes, products like ${product.name} are generally intended for research, laboratory, or educational use and are not marketed as approved human therapeutics. Always follow local laws, lab safety practices, and institutional requirements before handling or studying any peptide.`,
    },
    {
      q: `What should I look for before buying ${product.name}?`,
      a: `Key checks include verified COA data, peptide form and concentration, supplier reputation, stock status, and cost per mg. Comparing pricing and testing records side-by-side helps reduce the risk of buying an under-tested or misrepresented product.`,
    },
  ];
  // Admin-written FAQs replace the generic set entirely; the generic questions
  // only fill pages nobody has written FAQs for yet.
  const faqs =
    research.faq.length > 0 ? research.faq.map((item) => ({ q: item.question, a: item.answer })) : genericFaqs;

  return (
    <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-content"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to search
      </Link>

      {/* ---------------------------------------------------------------- Hero */}
      <header id="overview" className={cn(PANEL_CLASS, 'scroll-mt-24 p-5 sm:p-8')}>
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
              url={`https://${site.domain}/products/${product.slug}`}
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

        <h1 className="animate-fade-up animate-delay-100 mt-4 text-4xl font-black text-content sm:text-5xl">
          {seo?.h1 || product.name}
        </h1>
        {product.description ?? product.summary ? (
          <p className="animate-fade-up animate-delay-200 mt-3 max-w-3xl whitespace-pre-line text-base leading-7 text-muted">
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
            <Stat label="Vendors listed" value={String(vendorCount)} />
            <Stat label="In stock" value={`${inStockCount} of ${resolvedOffers.length}`} hint="listings" />
            <Stat label="COA reports" value={String(offersWithReports.length)} />
          </dl>
        ) : null}

        <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
          <span className="eyebrow hidden shrink-0 sm:inline">Jump to</span>
          <JumpToNav
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'vendor-listings', label: 'Vendor Listings' },
              { id: 'benefits', label: 'Benefits' },
              { id: 'dosing', label: 'Dosing' },
              { id: 'evidence', label: 'Evidence' },
              { id: 'interactions', label: 'Interactions' },
              { id: 'faq', label: 'FAQ' },
            ]}
          />
        </div>
      </header>

      {/* ------------------------------------------------------ Price compare */}
      <section
        id="vendor-listings"
        aria-labelledby="vendor-listings-heading"
        className={cn(PANEL_CLASS, 'mt-6 scroll-mt-24 overflow-hidden')}
      >
        <div className="p-5 sm:p-8">
          <p className="eyebrow">Vendor listings</p>
          <h2 id="vendor-listings-heading" className="mt-3 text-3xl font-black text-content sm:text-4xl">
            Compare <span className="text-accent">{product.name}</span> prices.
          </h2>

          {hasOffers ? (
            <>
              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="eyebrow">Form</p>
                  <div
                    className={cn(
                      SEGMENT_TRACK_CLASS,
                      'mt-2 sm:inline-grid',
                      SEGMENT_COLS_CLASS[availableForms.length] ?? 'grid-cols-3',
                    )}
                  >
                    {availableForms.map((form) => {
                      const isSelected = selectedForm === form;
                      return (
                        <Link
                          key={form}
                          href={filterHref(product.slug, sp, { form, dose: undefined })}
                          scroll={false}
                          aria-current={isSelected ? 'true' : undefined}
                          className={segmentClass(isSelected)}
                        >
                          {FORM_LABELS[form]}
                          <span
                            className={cn(
                              'rounded-pill px-1.5 text-micro font-black',
                              isSelected ? 'bg-surface/20 text-surface' : 'bg-surface-sunken text-muted',
                            )}
                          >
                            {formCounts.get(form) ?? 0}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="eyebrow">Show prices as</p>
                  <div className={cn(SEGMENT_TRACK_CLASS, 'mt-2 grid-cols-2 sm:inline-grid')}>
                    <Link
                      href={filterHref(product.slug, sp, { view: undefined })}
                      scroll={false}
                      aria-current={view === 'total' ? 'true' : undefined}
                      className={segmentClass(view === 'total')}
                    >
                      Total price
                    </Link>
                    <Link
                      href={filterHref(product.slug, sp, { view: 'permg' })}
                      scroll={false}
                      aria-current={view === 'permg' ? 'true' : undefined}
                      className={segmentClass(view === 'permg')}
                    >
                      Cost per mg
                    </Link>
                  </div>
                </div>
              </div>

              {doseOptions.length > 0 ? (
                <div className="mt-5">
                  <p className="eyebrow">Size</p>
                  <DoseChipsExpandable
                    doses={doseOptions.map(([key, dose]) => ({
                      key,
                      label: dose.label,
                      href: filterHref(product.slug, sp, { dose: key }),
                    }))}
                    selectedKey={selectedDoseKey}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-muted sm:p-10">
              No vendor prices recorded for {product.name} yet. Listings appear here once the crawler
              reads them from a live vendor page.
            </p>
          )}
        </div>

        {hasOffers ? (
          <div className="border-t border-line">
            <div className="flex gap-6 border-b border-line px-5 sm:px-8">
              <TabLink
                href={filterHref(product.slug, sp, { tab: undefined })}
                isActive={tab === 'prices'}
                icon={<TagIcon className="h-4 w-4" />}
              >
                Prices
              </TabLink>
              <TabLink
                href={filterHref(product.slug, sp, { tab: 'tests' })}
                isActive={tab === 'tests'}
                icon={<FlaskIcon className="h-4 w-4" />}
              >
                Lab tests
                <span className="rounded-pill bg-surface-sunken px-1.5 text-micro font-black text-muted">
                  {offersWithReports.length}
                </span>
              </TabLink>
            </div>

            <div className="p-5 sm:p-8">
              {tab === 'tests' ? (
                <TestsPanel productName={product.name} offers={offersWithReports} suppliersBySlug={suppliersBySlug} />
              ) : (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-muted">
                      <span className="font-bold text-content">{priceRows.length}</span>{' '}
                      {priceRows.length === 1 ? 'listing' : 'listings'} · {product.name}
                      {selectedDoseLabel ? ` · ${selectedDoseLabel}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={cn(SEGMENT_TRACK_CLASS, 'grid-cols-2')}>
                        <Link
                          href={filterHref(product.slug, sp, { stock: undefined })}
                          scroll={false}
                          aria-current={stockFilter === 'all' ? 'true' : undefined}
                          className={cn(segmentClass(stockFilter === 'all'), 'py-1.5 text-xs')}
                        >
                          All
                        </Link>
                        <Link
                          href={filterHref(product.slug, sp, { stock: 'in' })}
                          scroll={false}
                          aria-current={stockFilter === 'in' ? 'true' : undefined}
                          className={cn(segmentClass(stockFilter === 'in'), 'py-1.5 text-xs')}
                        >
                          In stock
                        </Link>
                      </div>
                      <Link
                        href={filterHref(product.slug, sp, {
                          sort: sort === 'price-asc' ? 'price-desc' : undefined,
                        })}
                        scroll={false}
                        className="rounded-pill border border-line bg-surface px-3.5 py-2 text-xs font-bold text-content transition-colors hover:border-brand"
                      >
                        Price: {sort === 'price-asc' ? 'Low to High' : 'High to Low'}
                      </Link>
                    </div>
                  </div>

                  {supplierOptions.length > 1 ? (
                    // Scrolls sideways on phones instead of wrapping into a
                    // wall of chips above the first price.
                    <SupplierChipsExpandable
                      suppliers={supplierOptions.map((s) => ({
                        slug: s.slug,
                        name: s.name,
                        href: filterHref(product.slug, sp, { supplier: s.slug }),
                      }))}
                      selectedSlug={supplierFilter ?? null}
                      allHref={filterHref(product.slug, sp, { supplier: undefined })}
                    />
                  ) : null}

                  {priceRows.length === 0 ? (
                    <p className="mt-6 rounded-card border border-dashed border-line p-8 text-center text-sm text-muted">
                      No offers match these filters.
                    </p>
                  ) : (
                    <ListingsLoadMore initialCount={LISTINGS_PER_PAGE}>
                      {priceRows.map((offer) => (
                        <PriceRow
                          key={offerKey(offer)}
                          offer={offer}
                          supplier={suppliersBySlug.get(offer.supplierSlug)!}
                          view={view}
                          isLowestPerMg={offerKey(offer) === bestRowKey}
                        />
                      ))}
                    </ListingsLoadMore>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null}
      </section>

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
        <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-muted">
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
        id="dosing"
        eyebrow="Dosage and protocol"
        title={
          research.dosageTitle ? (
            accentLastWord(research.dosageTitle)
          ) : (
            <>
              How it is typically <span className="text-accent">studied.</span>
            </>
          )
        }
        intro={
          research.dosageIntro ??
          `Dosing protocols for ${product.name} vary by study design and supplier. Always confirm concentration and route against the vendor's own COA and dosing guidance before use.`
        }
      >
        {dosingFacts.length > 0 ? (
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {dosingFacts.map((fact) => (
              <div
                key={fact.label}
                className={cn('rounded-card border border-line bg-surface p-4', fact.wide && 'sm:col-span-3')}
              >
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="mt-2 text-base font-bold leading-6 text-content">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EmptyNote>
            No dosing protocol has been published for {product.name} yet. Check the vendor&apos;s own guidance and COA.
          </EmptyNote>
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
                    rel="noopener"
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

function TabLink({
  href,
  isActive,
  icon,
  children,
}: {
  href: string;
  isActive: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        '-mb-px flex items-center gap-1.5 border-b-2 py-4 text-sm font-bold transition-colors',
        isActive ? 'border-brand text-content' : 'border-transparent text-muted hover:text-content',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function PriceRow({
  offer,
  supplier,
  view,
  isLowestPerMg,
}: {
  offer: Offer;
  supplier: Supplier;
  view: 'total' | 'permg';
  isLowestPerMg: boolean;
}) {
  const listing = toListing(offer);
  const observedPrice = effectivePrice(listing);
  const observedDiscount = hasDiscount(listing);
  // A coupon only steps in when there's no already-recorded sale price: a
  // scraped price is a fact, a coupon is a rule, and the fact wins.
  const couponPercentOff = !observedDiscount ? (supplier.coupon?.percentOff ?? null) : null;
  const price = couponPercentOff !== null ? couponAdjustedPrice(observedPrice, couponPercentOff) : observedPrice;
  const totalText = formatMoney(price, listing.currency);
  const perMg = couponPercentOff !== null ? pricePerMgFor(price, listing) : pricePerMg(listing);
  const perMgText = perMg !== null ? formatPerMg(perMg, listing.currency) : null;
  const discounted = observedDiscount || couponPercentOff !== null;
  const percentOff = discountPercent(listing) ?? couponPercentOff;
  const stale = isStale(offer.scrapedAt);
  const mg = offer.vialSize / 1000;
  const sizeText = offer.vialCount > 1 ? `${mg} mg · ${offer.vialCount} vials` : `${mg}mg`;

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-card border p-3 sm:flex-nowrap sm:gap-4 sm:p-4',
        isLowestPerMg ? 'border-accent/40 bg-accent-tint' : 'border-line bg-surface',
      )}
    >
      <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto">
        <SupplierLogo
          src={supplier.logoUrl ?? supplier.faviconUrl}
          name={supplier.name}
          size={44}
          className="h-10 w-10 rounded-chip sm:h-11 sm:w-11"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/suppliers/${supplier.slug}`}
              className="truncate font-bold text-content transition-colors hover:text-accent"
            >
              {supplier.name}
            </Link>
            {isLowestPerMg ? (
              <span className="rounded-pill bg-accent px-2 py-0.5 text-micro font-bold uppercase text-surface">
                Lowest $/mg
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
            <span className={cn('inline-flex items-center gap-1 font-semibold', offer.inStock ? 'text-ok' : 'text-danger')}>
              <span
                aria-hidden="true"
                className={cn('h-1.5 w-1.5 rounded-pill', offer.inStock ? 'bg-ok' : 'bg-danger')}
              />
              {offer.inStock ? 'In stock' : 'Out of stock'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{sizeText}</span>
            <span aria-hidden="true">·</span>
            <span className={cn(stale && 'font-semibold text-warn')}>seen {timeAgo(offer.scrapedAt)}</span>
          </p>
        </div>
      </div>

      {/* On phones the price drops to its own row, so the vendor name keeps
          the full width instead of truncating to a few letters. */}
      <div className="flex w-full items-center justify-between gap-3 border-t border-line pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
        <div className="sm:text-right">
          <p className="text-lg font-black text-content">
            {view === 'permg' ? (perMgText ?? 'N/A') : totalText}
          </p>
          <p className="text-xs text-muted">
            {discounted && view === 'total' ? (
              <span className="mr-1 text-faint line-through">{formatMoney(listing.listPrice, listing.currency)}</span>
            ) : null}
            {view === 'permg' ? totalText : (perMgText ?? 'per mg n/a')}
            {percentOff !== null ? <span className="ml-1.5 font-bold text-promo">-{percentOff}%</span> : null}
          </p>
          {/* Price above already has the coupon applied, so this tells the buyer which code earns it. */}
          {couponPercentOff !== null && supplier.coupon ? (
            <span className="mt-1 inline-block rounded-chip border border-coupon/50 bg-coupon-tint px-1.5 py-0.5 text-micro font-bold uppercase text-coupon-ink">
              {supplier.coupon.code}
            </span>
          ) : null}
        </div>

        <a
          href={`/go?to=${encodeURIComponent(offer.productUrl)}`}
          target="_blank"
          rel="sponsored noopener"
          aria-label={`View offer from ${supplier.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand text-surface transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ExternalIcon className="h-4 w-4" />
        </a>
      </div>
    </li>
  );
}

/**
 * COA/verification listing for the product's Tests tab. Receives only offers
 * that carry a real report link, one row per brand's own COA for its own
 * listing, never a generic or borrowed link.
 */
function TestsPanel({
  productName,
  offers,
  suppliersBySlug,
}: {
  productName: string;
  offers: readonly Offer[];
  suppliersBySlug: Map<string, Supplier>;
}) {
  if (offers.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line p-8 text-center text-sm text-muted">
        No COA-verified listings recorded for {productName} yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-content">{productName} verification</h3>
          <p className="mt-1 text-sm text-muted">Independent third-party laboratory analysis for quality assurance.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-card border border-ok/30 bg-ok/5 px-4 py-2">
          <FlaskIcon className="h-5 w-5 shrink-0 text-ok" />
          <span className="leading-tight">
            <span className="block text-micro font-bold uppercase tracking-wide text-ok">Tracked tests</span>
            <span className="block text-sm font-black text-content">
              {offers.length} {offers.length === 1 ? 'Report' : 'Reports'}
            </span>
          </span>
        </span>
      </div>

      {/* Column labels only where the rows are actually laid out as columns. */}
      <div
        aria-hidden="true"
        className={cn(
          'mt-6 hidden rounded-pill bg-surface-sunken px-5 py-2 text-xs font-bold uppercase tracking-wide text-muted',
          REPORT_GRID_CLASS,
        )}
      >
        <span>Vendor</span>
        <span>Product</span>
        <span>Dosage</span>
        <span className="text-right">Report</span>
      </div>

      <ul className="mt-4 space-y-2.5 md:mt-2">
        {offers.map((offer) => {
          const report = offer.labReport;
          const supplier = suppliersBySlug.get(offer.supplierSlug)!;
          const mg = offer.vialSize / 1000;
          const dosageLabel = offer.vialCount > 1 ? `${mg} mg · ${offer.vialCount} vials` : `${mg}mg`;

          return (
            <li key={offerKey(offer)} className="rounded-card border border-line bg-surface p-4 md:px-5 md:py-3">
              <div className={cn('flex flex-col gap-3', REPORT_GRID_CLASS)}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <SupplierLogo
                    src={supplier.logoUrl ?? supplier.faviconUrl}
                    name={supplier.name}
                    size={32}
                    className="h-8 w-8 rounded-chip"
                    initialClassName="text-xs"
                  />
                  <Link
                    href={`/suppliers/${supplier.slug}`}
                    className="truncate font-bold text-content transition-colors hover:text-accent"
                  >
                    {supplier.name}
                  </Link>
                </div>
                <p className="flex items-center justify-between gap-3 text-sm md:block">
                  <span className="text-micro font-bold uppercase text-faint md:hidden">Product</span>
                  <span className="truncate font-bold text-content">{productName}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-sm md:block">
                  <span className="text-micro font-bold uppercase text-faint md:hidden">Dosage</span>
                  <span className="text-content">{dosageLabel}</span>
                </p>
                <a
                  href={(report?.reportUrl ?? report?.labUrl ?? offer.coaUrl)!}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-ok/40 bg-ok/10 px-3.5 py-2 text-xs font-black uppercase tracking-wide text-ok transition-colors hover:bg-ok hover:text-surface md:justify-self-end md:py-1.5"
                >
                  View Report
                  <ExternalIcon className="h-3 w-3" />
                </a>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {report ? (
                  <>
                    <span className="text-micro text-faint">
                      {report.labName} · Grade {report.grade.toUpperCase()} · {report.score.toFixed(1)}/10
                    </span>
                    {Object.entries(report.results).map(([test, result]) => (
                      <span
                        key={test}
                        className={cn(
                          'rounded-chip px-2 py-1 text-micro font-bold uppercase',
                          result === 'pass' ? 'bg-ok/10 text-ok' : 'bg-danger/10 text-danger',
                        )}
                      >
                        {test}: {result}
                      </span>
                    ))}
                    {report.testedAt ? (
                      <span className="text-micro text-faint">Tested {timeAgo(report.testedAt)}</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-micro text-faint">Certificate on file, not yet graded.</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
