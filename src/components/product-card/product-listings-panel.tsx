'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toListing } from '@/lib/listing';
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
import { seenAgo, timeAgo, isStale } from '@/lib/format';
import { cn } from '@/lib/cn';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { DoseChipsExpandable } from '@/components/product-card/dose-chips-expandable';
import { SupplierChipsExpandable } from '@/components/product-card/supplier-chips-expandable';
import { ListingsLoadMore } from '@/components/product-card/listings-load-more';
import type { Offer, Supplier, ProductForm } from '@/lib/schema';
import { ExternalIcon, FlaskIcon, StarIcon, TagIcon } from '@/components/icons/icons';

/** The supplier fields a listing row shows; the rest of the record stays on the server. */
export type ListingSupplier = Pick<Supplier, 'slug' | 'name' | 'logoUrl' | 'faviconUrl' | 'coupon'>;

/** Filters a shared link may still carry; read once to open the panel in that state. */
export interface InitialListingFilters {
  form?: string;
  dose?: string;
  stock?: string;
  sort?: string;
  supplier?: string;
  view?: string;
  tab?: string;
}

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

type DoseOption = { vialSize: number; vialCount: number; label: string };

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

/**
 * The product page's "Compare prices" section. Form, size, price view, stock,
 * sort, supplier and tab are local state, so every control filters the
 * listings in place and the URL stays the clean product address.
 */
export function ProductListingsPanel({
  productName,
  offers,
  suppliers,
  initialFilters,
  recommendedSupplierSlug = null,
  className,
}: {
  productName: string;
  /** Every listing for the compound whose supplier still resolves. */
  offers: readonly Offer[];
  suppliers: readonly ListingSupplier[];
  initialFilters: InitialListingFilters;
  /** A partner pinned above the price ranking (see RECOMMENDED_LISTINGS), shown with a Featured badge. */
  recommendedSupplierSlug?: string | null;
  className?: string;
}) {
  const suppliersBySlug = new Map(suppliers.map((s) => [s.slug, s]));
  const hasOffers = offers.length > 0;

  // --- Form tabs (always show Vial / Capsule / Spray, even when a form has no live offers yet) ---
  const formCounts = new Map<ProductForm, number>();
  for (const o of offers) formCounts.set(o.form, (formCounts.get(o.form) ?? 0) + 1);
  // Few compounds are sold as pens or serums, so always-on tabs for them would be empty on most pages.
  const availableForms: ProductForm[] = [...DISPLAY_FORMS, ...OCCASIONAL_FORMS.filter((form) => formCounts.has(form))];

  const [formChoice, setFormChoice] = useState<string | undefined>(initialFilters.form);
  const [doseChoice, setDoseChoice] = useState<string | undefined>(initialFilters.dose);
  const [stockFilter, setStockFilter] = useState<'in' | 'all'>(initialFilters.stock === 'in' ? 'in' : 'all');
  const [sort, setSort] = useState<'price-asc' | 'price-desc'>(
    initialFilters.sort === 'price-desc' ? 'price-desc' : 'price-asc',
  );
  const [view, setView] = useState<'total' | 'permg'>(initialFilters.view === 'permg' ? 'permg' : 'total');
  const [supplierFilter, setSupplierFilter] = useState(initialFilters.supplier ?? '');
  const [tab, setTab] = useState<'prices' | 'tests'>(initialFilters.tab === 'tests' ? 'tests' : 'prices');

  const selectedForm: ProductForm | null =
    formChoice && availableForms.includes(formChoice as ProductForm)
      ? (formChoice as ProductForm)
      : (availableForms[0] ?? null);
  const offersForForm = selectedForm ? offers.filter((o) => o.form === selectedForm) : [];

  // --- Dosage chips for the selected form, grouped by vial size × count ---
  const doseMap = new Map<string, DoseOption>();
  for (const o of offersForForm) {
    const key = `${o.vialSize}-${o.vialCount}`;
    if (doseMap.has(key)) continue;
    const mg = o.vialSize / 1000;
    const label = o.vialCount > 1 ? `${mg} mg · ${o.vialCount} vials` : `${mg}mg`;
    doseMap.set(key, { vialSize: o.vialSize, vialCount: o.vialCount, label });
  }

  const fallbackDoseMap = new Map<string, DoseOption>();
  for (const label of DOSAGE_OPTIONS[selectedForm ?? 'vial'] ?? []) {
    fallbackDoseMap.set(label, { vialSize: 0, vialCount: 1, label });
  }

  // Single vials first, smallest to largest, then the multi-vial packs in the same order.
  const doseOptions =
    doseMap.size > 0
      ? [...doseMap.entries()].sort(
          ([, a], [, b]) =>
            Number(a.vialCount > 1) - Number(b.vialCount > 1) || a.vialSize - b.vialSize || a.vialCount - b.vialCount,
        )
      : [...fallbackDoseMap.entries()];
  const selectedDoseKey =
    doseChoice && (doseMap.has(doseChoice) || fallbackDoseMap.has(doseChoice)) ? doseChoice : null;
  const selectedDoseLabel = selectedDoseKey
    ? (doseMap.get(selectedDoseKey) ?? fallbackDoseMap.get(selectedDoseKey))?.label
    : undefined;

  const offersForDose = selectedDoseKey
    ? offersForForm.filter((o) => `${o.vialSize}-${o.vialCount}` === selectedDoseKey)
    : offersForForm;

  // --- Prices tab: stock filter, supplier filter, sort ---
  const priceRows = offersForDose
    .filter((o) => (stockFilter === 'in' ? o.inStock : true))
    .filter((o) => (supplierFilter ? o.supplierSlug === supplierFilter : true))
    .sort((a, b) => {
      const priceA = effectivePrice(toListing(a));
      const priceB = effectivePrice(toListing(b));
      // Out-of-stock rows sort after in-stock ones regardless of direction.
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      return sort === 'price-asc' ? priceA - priceB : priceB - priceA;
    });

  // Ranking only happens within one currency: without a conversion rate a €
  // price must never "beat" a $ one. rankByPricePerMg drops out-of-stock first.
  const primaryCurrency = hasOffers ? toListing(offers[0]!).currency : null;
  // Only worth flagging when there is something to beat.
  const bestRow =
    priceRows.length > 1
      ? (rankByPricePerMg(
          priceRows.map((o) => toListing(o)).filter((listing) => listing.currency === primaryCurrency),
        )[0] ?? null)
      : null;
  // Price rows are all of the selected form, so the best row shares it.
  const bestRowKey = bestRow && selectedForm ? offerKey({ ...bestRow.listing, form: selectedForm }) : null;
  // Sorted by total price, the best value per mg can sit far down the list
  // (a big vial costs more in total but less per mg), so on the default
  // low-to-high sort it leads the list instead of hiding behind "Load more".
  const bestRowIndex = bestRowKey ? priceRows.findIndex((o) => offerKey(o) === bestRowKey) : -1;
  const rankedRows =
    sort === 'price-asc' && bestRowIndex > 0
      ? [priceRows[bestRowIndex]!, ...priceRows.slice(0, bestRowIndex), ...priceRows.slice(bestRowIndex + 1)]
      : priceRows;

  // The recommended partner's best value per mg among its in-stock rows in
  // the current filters leads the list. Out of stock is never pinned, and the
  // price ranking below it is left exactly as it was.
  const recommendedRanked = recommendedSupplierSlug
    ? (rankByPricePerMg(
        priceRows
          .filter((o) => o.supplierSlug === recommendedSupplierSlug)
          .map((o) => toListing(o))
          .filter((listing) => listing.currency === primaryCurrency),
      )[0] ?? null)
    : null;
  const recommendedRowKey =
    recommendedRanked && selectedForm ? offerKey({ ...recommendedRanked.listing, form: selectedForm }) : null;
  const recommendedRow = recommendedRowKey ? rankedRows.find((o) => offerKey(o) === recommendedRowKey) : undefined;
  const displayedRows = recommendedRow
    ? [recommendedRow, ...rankedRows.filter((o) => o !== recommendedRow)]
    : rankedRows;

  const supplierOptions = [...new Set(offersForDose.map((o) => o.supplierSlug))]
    .map((s) => suppliersBySlug.get(s)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  // A lab report with neither a report document nor the lab's own site has
  // nothing real to link to, so it doesn't count as a viewable COA.
  const offersWithReports = offers.filter((o) => o.labReport?.reportUrl || o.labReport?.labUrl || o.coaUrl);

  return (
    <section
      id="vendor-listings"
      aria-labelledby="vendor-listings-heading"
      className={className}
    >
      <div className="p-5 sm:p-8">
        <p className="eyebrow">Supplier listings</p>
        <h2 id="vendor-listings-heading" className="mt-3 text-3xl font-black text-content sm:text-4xl">
          Compare <span className="text-accent">{productName}</span> prices.
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
                      <ControlButton
                        key={form}
                        isSelected={isSelected}
                        onClick={() => {
                          setFormChoice(form);
                          setDoseChoice(undefined);
                        }}
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
                      </ControlButton>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="eyebrow">Show prices as</p>
                <div className={cn(SEGMENT_TRACK_CLASS, 'mt-2 grid-cols-2 sm:inline-grid')}>
                  <ControlButton
                    isSelected={view === 'total'}
                    onClick={() => setView('total')}
                    className={segmentClass(view === 'total')}
                  >
                    Total price
                  </ControlButton>
                  <ControlButton
                    isSelected={view === 'permg'}
                    onClick={() => setView('permg')}
                    className={segmentClass(view === 'permg')}
                  >
                    Cost per mg
                  </ControlButton>
                </div>
              </div>
            </div>

            {doseOptions.length > 0 ? (
              <div className="mt-5">
                <p className="eyebrow">Size</p>
                <DoseChipsExpandable
                  key={selectedForm ?? 'none'}
                  doses={doseOptions.map(([key, dose]) => ({ key, label: dose.label }))}
                  selectedKey={selectedDoseKey}
                  onSelect={setDoseChoice}
                />
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-muted sm:p-10">
            No supplier prices recorded for {productName} yet. Listings appear here once the crawler
            reads them from a live supplier page.
          </p>
        )}
      </div>

      {hasOffers ? (
        <div className="border-t border-line">
          <div className="flex gap-6 border-b border-line px-5 sm:px-8">
            <TabButton
              isActive={tab === 'prices'}
              onClick={() => setTab('prices')}
              icon={<TagIcon className="h-4 w-4" />}
            >
              Prices
            </TabButton>
            <TabButton
              isActive={tab === 'tests'}
              onClick={() => setTab('tests')}
              icon={<FlaskIcon className="h-4 w-4" />}
            >
              Lab tests
              <span className="rounded-pill bg-surface-sunken px-1.5 text-micro font-black text-muted">
                {offersWithReports.length}
              </span>
            </TabButton>
          </div>

          <div className="p-5 sm:p-8">
            {tab === 'tests' ? (
              <TestsPanel productName={productName} offers={offersWithReports} suppliersBySlug={suppliersBySlug} />
            ) : (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted">
                    <span className="font-bold text-content">{priceRows.length}</span>{' '}
                    {priceRows.length === 1 ? 'listing' : 'listings'} · {productName}
                    {selectedDoseLabel ? ` · ${selectedDoseLabel}` : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={cn(SEGMENT_TRACK_CLASS, 'grid-cols-2')}>
                      <ControlButton
                        isSelected={stockFilter === 'all'}
                        onClick={() => setStockFilter('all')}
                        className={cn(segmentClass(stockFilter === 'all'), 'py-1.5 text-xs')}
                      >
                        All
                      </ControlButton>
                      <ControlButton
                        isSelected={stockFilter === 'in'}
                        onClick={() => setStockFilter('in')}
                        className={cn(segmentClass(stockFilter === 'in'), 'py-1.5 text-xs')}
                      >
                        In stock
                      </ControlButton>
                    </div>
                    <ControlButton
                      onClick={() => setSort(sort === 'price-asc' ? 'price-desc' : 'price-asc')}
                      className="rounded-pill border border-line bg-surface px-3.5 py-2 text-xs font-bold text-content transition-colors hover:border-brand"
                    >
                      Price: {sort === 'price-asc' ? 'Low to High' : 'High to Low'}
                    </ControlButton>
                  </div>
                </div>

                {supplierOptions.length > 1 ? (
                  // Scrolls sideways on phones instead of wrapping into a
                  // wall of chips above the first price.
                  <SupplierChipsExpandable
                    suppliers={supplierOptions.map((s) => ({ slug: s.slug, name: s.name }))}
                    selectedSlug={supplierFilter || null}
                    onSelect={(slug) => setSupplierFilter(slug ?? '')}
                  />
                ) : null}

                {priceRows.length === 0 ? (
                  <p className="mt-6 rounded-card border border-dashed border-line p-8 text-center text-sm text-muted">
                    No offers match these filters.
                  </p>
                ) : (
                  <ListingsLoadMore initialCount={LISTINGS_PER_PAGE}>
                    {displayedRows.map((offer) => (
                      <PriceRow
                        key={offerKey(offer)}
                        offer={offer}
                        supplier={suppliersBySlug.get(offer.supplierSlug)!}
                        view={view}
                        isLowestPerMg={offerKey(offer) === bestRowKey}
                        isFeatured={offer === recommendedRow}
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
  );
}

/** A filter, sort or tab control: a button that updates local state, never the URL. */
function ControlButton({
  isSelected,
  onClick,
  className,
  children,
}: {
  /** Omit for an action, such as a sort-direction toggle, that has no on/off state. */
  isSelected?: boolean;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={isSelected} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function TabButton({
  isActive,
  onClick,
  icon,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <ControlButton
      isSelected={isActive}
      onClick={onClick}
      className={cn(
        '-mb-px flex items-center gap-1.5 border-b-2 py-4 text-sm font-bold transition-colors',
        isActive ? 'border-brand text-content' : 'border-transparent text-muted hover:text-content',
      )}
    >
      {icon}
      {children}
    </ControlButton>
  );
}

function PriceRow({
  offer,
  supplier,
  view,
  isLowestPerMg,
  isFeatured = false,
}: {
  offer: Offer;
  supplier: ListingSupplier;
  view: 'total' | 'permg';
  isLowestPerMg: boolean;
  /** The partner pinned above the price ranking; styled like a Featured supplier card. */
  isFeatured?: boolean;
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
        isFeatured
          ? // Same treatment as a Featured supplier card: accent border, soft accent glow and wash.
            'relative overflow-hidden border-accent/50 bg-surface-raised shadow-[0_0_36px_-12px_rgb(var(--accent)/0.55)] transition-colors duration-150 hover:border-accent sm:py-5'
          : isLowestPerMg
            ? 'border-accent/40 bg-accent-tint'
            : 'border-line bg-surface',
      )}
    >
      {isFeatured ? (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgb(var(--accent)/0.12),_transparent_70%)]"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-accent-strong" />
        </>
      ) : null}
      <div className="relative flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto">
        <SupplierLogo
          src={supplier.logoUrl ?? supplier.faviconUrl}
          name={supplier.name}
          size={44}
          className={cn('h-10 w-10 rounded-chip sm:h-11 sm:w-11', isFeatured && 'ring-2 ring-accent/30')}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/suppliers/${supplier.slug}`}
              className="truncate font-bold text-content transition-colors hover:text-accent"
            >
              {supplier.name}
            </Link>
            {isFeatured ? (
              <span
                title="Featured partner placement, shown above the price ranking. We may earn a commission."
                className="inline-flex items-center gap-1 rounded-pill border border-coupon bg-gradient-to-r from-accent to-accent-strong px-2.5 py-1 text-micro font-black uppercase tracking-wide text-surface-raised shadow-sm"
              >
                <StarIcon className="h-3 w-3 fill-current text-coupon" />
                Featured
                <span className="sr-only"> partner placement, shown above the price ranking</span>
              </span>
            ) : null}
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
            {/* Relative time can tick over between the server render and hydration. */}
            <span suppressHydrationWarning className={cn(stale && 'font-semibold text-warn')}>
              seen {seenAgo(offer.scrapedAt)}
            </span>
          </p>
        </div>
      </div>

      {/* On phones the price drops to its own row, so the vendor name keeps
          the full width instead of truncating to a few letters. */}
      <div className="relative flex w-full items-center justify-between gap-3 border-t border-line pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
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
          rel="nofollow sponsored noopener"
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
  suppliersBySlug: Map<string, ListingSupplier>;
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
        <span>Supplier</span>
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
                  rel="nofollow noopener"
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
                      <span suppressHydrationWarning className="text-micro text-faint">
                        Tested {timeAgo(report.testedAt)}
                      </span>
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
