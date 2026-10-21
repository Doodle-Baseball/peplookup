import type { Offer, Product, ProductForm, Supplier } from './schema';

/**
 * The monthly open price dataset published on Kaggle. Pure functions only, so
 * the admin download and the tests run exactly the same rules.
 *
 * Nothing here may leak affiliate data: rows carry no vendor URLs, ref codes,
 * coupons or row ids, only the public supplier profile on our own site.
 */

export const DATASET_COLUMNS = [
  'peptide_name',
  'supplier_name',
  'vial_size_mg',
  'form',
  'price_usd',
  'price_per_mg_usd',
  'in_stock',
  'has_coa',
  'supplier_profile_url',
  'last_checked',
] as const;

export const OUTLIER_COLUMNS = [...DATASET_COLUMNS, 'peptide_median_price_per_mg_usd', 'ratio_to_median'] as const;

/** Listings last checked longer ago than this are left out rather than published stale. */
export const MAX_AGE_DAYS = 30;

/** A row is flagged when its price per mg is above HIGH or below LOW times its peptide's median. */
export const OUTLIER_HIGH_MULTIPLE = 5n;
export const OUTLIER_LOW_DIVISOR = 5n;

const PROFILE_BASE_URL = 'https://www.peplookup.com/suppliers/';

export type DatasetForm = 'vial' | 'capsule' | 'nasal' | 'topical' | 'other';

const DATASET_FORM: Record<ProductForm, DatasetForm> = {
  vial: 'vial',
  capsule: 'capsule',
  spray: 'nasal',
  serum: 'topical',
  pen: 'other',
  kit: 'other',
};

/**
 * The compound table names some blends by brand (GLOW, Wolverine) and has no
 * ingredient list, so the standardised names come from each blend's stored
 * aliases. Wolverine and "BPC-157 + TB-500" are the same blend under two names.
 */
const BLEND_NAMES: Readonly<Record<string, string>> = {
  'bpc-157-tb-500': 'BPC-157 + TB-500 blend',
  wolverine: 'BPC-157 + TB-500 blend',
  glow: 'GHK-Cu + BPC-157 + TB-500 blend',
  klow: 'KPV + BPC-157 + TB-500 + GHK-Cu blend',
  cagrisema: 'Cagrilintide + Semaglutide blend',
  'ipamorelin-cjc-1295-no-dac': 'Ipamorelin + CJC-1295 (No DAC) blend',
};

/** Listed on the site as a reconstitution supply, not a peptide; its size is not in mg. */
const NON_PEPTIDE_SLUGS: ReadonlySet<string> = new Set(['bacteriostatic-water']);

export type ExclusionReason =
  | 'inactiveSupplier'
  | 'outOfStock'
  | 'stale'
  | 'missingPriceOrSize'
  | 'notUsd'
  | 'unknownCompound'
  | 'notAPeptide'
  | 'duplicate';

export type ExclusionCounts = Record<ExclusionReason, number>;

export interface DatasetRow {
  readonly peptideName: string;
  readonly supplierName: string;
  readonly supplierSlug: string;
  /** Whole pack: vial size times vial count, so a 10-vial kit's price per mg is right. */
  readonly totalMcg: number;
  readonly form: DatasetForm;
  /** The vendor's list price for the whole pack, before shipping and coupons. */
  readonly priceCents: number;
  readonly inStock: boolean;
  readonly hasCoa: boolean;
  /** YYYY-MM-DD, UTC. */
  readonly lastChecked: string;
}

/** An exact fraction, so comparing prices per mg never goes through floating point. */
interface Fraction {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

export interface OutlierRow {
  readonly row: DatasetRow;
  /** Cents per microgram. */
  readonly peptideMedian: Fraction;
}

export interface PriceDataset {
  readonly rows: readonly DatasetRow[];
  readonly outliers: readonly OutlierRow[];
  readonly excluded: ExclusionCounts;
}

export interface DatasetSummary {
  readonly totalRows: number;
  readonly supplierCount: number;
  readonly peptideCount: number;
  readonly firstChecked: string | null;
  readonly lastChecked: string | null;
  readonly outlierCount: number;
}

function hasPublishedCoa(offer: Offer): boolean {
  return Boolean(offer.coaUrl || offer.labReport?.reportUrl || offer.labReport?.labUrl);
}

function isFresh(scrapedAt: string, now: Date): boolean {
  const checkedAt = Date.parse(scrapedAt);
  if (!Number.isFinite(checkedAt)) return false;
  return now.getTime() - checkedAt <= MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

/** Cents per microgram for the whole pack. */
function pricePerMcg(row: Pick<DatasetRow, 'priceCents' | 'totalMcg'>): Fraction {
  return { numerator: BigInt(row.priceCents), denominator: BigInt(row.totalMcg) };
}

function compareFractions(a: Fraction, b: Fraction): number {
  const difference = a.numerator * b.denominator - b.numerator * a.denominator;
  return difference > 0n ? 1 : difference < 0n ? -1 : 0;
}

function median(values: readonly Fraction[]): Fraction | null {
  const sorted = [...values].sort(compareFractions);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  if (!upper) return null;
  if (sorted.length % 2 === 1) return upper;
  const lower = sorted[middle - 1] as Fraction;
  return {
    numerator: lower.numerator * upper.denominator + upper.numerator * lower.denominator,
    denominator: 2n * lower.denominator * upper.denominator,
  };
}

function isOutlier(value: Fraction, peptideMedian: Fraction): boolean {
  const scaledValue = value.numerator * peptideMedian.denominator;
  const scaledMedian = peptideMedian.numerator * value.denominator;
  return scaledValue > OUTLIER_HIGH_MULTIPLE * scaledMedian || scaledValue * OUTLIER_LOW_DIVISOR < scaledMedian;
}

/** Of two listings for the same item, keep the one checked most recently, then the cheaper. */
function preferred(current: DatasetRow & { scrapedAt: string }, candidate: DatasetRow & { scrapedAt: string }) {
  const byRecency = Date.parse(candidate.scrapedAt) - Date.parse(current.scrapedAt);
  if (byRecency !== 0) return byRecency > 0 ? candidate : current;
  return candidate.priceCents < current.priceCents ? candidate : current;
}

export function buildPriceDataset({
  offers,
  suppliers,
  products,
  now,
}: {
  offers: readonly Offer[];
  suppliers: readonly Pick<Supplier, 'slug' | 'name' | 'isActive'>[];
  products: readonly Pick<Product, 'slug' | 'name'>[];
  now: Date;
}): PriceDataset {
  const activeSuppliers = new Map(suppliers.filter((s) => s.isActive).map((s) => [s.slug, s]));
  const productsBySlug = new Map(products.map((p) => [p.slug, p]));
  const excluded: ExclusionCounts = {
    inactiveSupplier: 0,
    outOfStock: 0,
    stale: 0,
    missingPriceOrSize: 0,
    notUsd: 0,
    unknownCompound: 0,
    notAPeptide: 0,
    duplicate: 0,
  };

  const byItem = new Map<string, DatasetRow & { scrapedAt: string }>();
  for (const offer of offers) {
    const supplier = activeSuppliers.get(offer.supplierSlug);
    if (!supplier) {
      excluded.inactiveSupplier++;
      continue;
    }
    if (!offer.inStock) {
      excluded.outOfStock++;
      continue;
    }
    if (!isFresh(offer.scrapedAt, now)) {
      excluded.stale++;
      continue;
    }
    const totalMcg = offer.vialSize * offer.vialCount;
    const hasWholeNumbers = Number.isSafeInteger(offer.listPrice) && Number.isSafeInteger(totalMcg);
    if (!hasWholeNumbers || offer.listPrice <= 0 || totalMcg <= 0) {
      excluded.missingPriceOrSize++;
      continue;
    }
    if (offer.currency !== 'USD') {
      excluded.notUsd++;
      continue;
    }
    if (NON_PEPTIDE_SLUGS.has(offer.productSlug)) {
      excluded.notAPeptide++;
      continue;
    }
    const product = productsBySlug.get(offer.productSlug);
    if (!product) {
      excluded.unknownCompound++;
      continue;
    }

    const row = {
      peptideName: BLEND_NAMES[product.slug] ?? product.name,
      supplierName: supplier.name,
      supplierSlug: supplier.slug,
      totalMcg,
      form: DATASET_FORM[offer.form],
      priceCents: offer.listPrice,
      inStock: offer.inStock,
      hasCoa: hasPublishedCoa(offer),
      lastChecked: offer.scrapedAt.slice(0, 10),
      scrapedAt: offer.scrapedAt,
    };
    const key = [row.supplierSlug, row.peptideName, row.totalMcg, row.form].join('|');
    const existing = byItem.get(key);
    if (existing) excluded.duplicate++;
    byItem.set(key, existing ? preferred(existing, row) : row);
  }

  const rows: DatasetRow[] = [...byItem.values()]
    .map(({ scrapedAt: _scrapedAt, ...row }) => row)
    .sort(
      (a, b) =>
        a.peptideName.localeCompare(b.peptideName, 'en') ||
        a.supplierName.localeCompare(b.supplierName, 'en') ||
        a.totalMcg - b.totalMcg ||
        a.form.localeCompare(b.form, 'en'),
    );

  const pricesByPeptide = new Map<string, Fraction[]>();
  for (const row of rows) {
    const prices = pricesByPeptide.get(row.peptideName) ?? [];
    prices.push(pricePerMcg(row));
    pricesByPeptide.set(row.peptideName, prices);
  }
  const outliers: OutlierRow[] = [];
  for (const row of rows) {
    const peptideMedian = median(pricesByPeptide.get(row.peptideName) ?? []);
    if (peptideMedian && isOutlier(pricePerMcg(row), peptideMedian)) outliers.push({ row, peptideMedian });
  }

  return { rows, outliers, excluded };
}

export function summarizeDataset(dataset: PriceDataset): DatasetSummary {
  const dates = dataset.rows.map((row) => row.lastChecked).sort();
  return {
    totalRows: dataset.rows.length,
    supplierCount: new Set(dataset.rows.map((row) => row.supplierSlug)).size,
    peptideCount: new Set(dataset.rows.map((row) => row.peptideName)).size,
    firstChecked: dates[0] ?? null,
    lastChecked: dates[dates.length - 1] ?? null,
    outlierCount: dataset.outliers.length,
  };
}

/** numerator / denominator as a decimal string, rounded half up to `decimals` places. */
function formatDecimal(numerator: bigint, denominator: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals);
  const scaled = (2n * numerator * scale + denominator) / (2n * denominator);
  const whole = scaled / scale;
  if (decimals === 0) return whole.toString();
  return `${whole}.${(scaled % scale).toString().padStart(decimals, '0')}`;
}

/** Cents per microgram -> dollars per mg is a factor of 1000 / 100 = 10. */
function formatUsdPerMg(value: Fraction): string {
  return formatDecimal(value.numerator * 10n, value.denominator, 4);
}

function formatMg(totalMcg: number): string {
  const whole = Math.floor(totalMcg / 1000);
  const fraction = totalMcg % 1000;
  if (fraction === 0) return String(whole);
  return `${whole}.${String(fraction).padStart(3, '0').replace(/0+$/, '')}`;
}

function datasetCells(row: DatasetRow): string[] {
  return [
    row.peptideName,
    row.supplierName,
    formatMg(row.totalMcg),
    row.form,
    formatDecimal(BigInt(row.priceCents), 100n, 2),
    formatUsdPerMg(pricePerMcg(row)),
    String(row.inStock),
    String(row.hasCoa),
    `${PROFILE_BASE_URL}${row.supplierSlug}`,
    row.lastChecked,
  ];
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(header: readonly string[], lines: readonly string[][]): string {
  return [header, ...lines].map((cells) => cells.map(csvCell).join(',')).join('\n') + '\n';
}

export function datasetToCsv(dataset: PriceDataset): string {
  return toCsv(DATASET_COLUMNS, dataset.rows.map(datasetCells));
}

export function outliersToCsv(dataset: PriceDataset): string {
  return toCsv(
    OUTLIER_COLUMNS,
    dataset.outliers.map(({ row, peptideMedian }) => {
      const value = pricePerMcg(row);
      const ratio = formatDecimal(
        value.numerator * peptideMedian.denominator,
        value.denominator * peptideMedian.numerator,
        2,
      );
      return [...datasetCells(row), formatUsdPerMg(peptideMedian), ratio];
    }),
  );
}

/** Named for the month the export was made in, UTC. */
export function datasetFileNames(now: Date): { prices: string; outliers: string } {
  const month = now.toISOString().slice(0, 7);
  return { prices: `research-peptide-prices-${month}.csv`, outliers: `outliers-${month}.csv` };
}
