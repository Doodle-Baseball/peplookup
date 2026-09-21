import { parseCsvText } from '@/lib/vendor-import';
import { supplierReviewSchema, type SupplierReview } from '@/lib/schema';

/**
 * Parses the vendor-reviews sheet: one row per vendor, carrying the vendor's
 * headline score, its Trustpilot link, and up to five reviews in repeating
 * "<n>ReviewName / <n>ReviewDate / <n>ReviewRating / <n>ReviewMsg" columns.
 *
 * Columns are located by header name rather than position, so adding a column
 * or reordering the sheet doesn't silently shift every review by one.
 */

/** Review slots the sheet provides per vendor. */
export const REVIEW_SLOTS = [1, 2, 3, 4, 5] as const;

export interface ParsedVendorReviews {
  vendorName: string;
  rating: number | null;
  trustpilotUrl: string | null;
  reviews: SupplierReview[];
  /** Rows that were readable overall but had a cell we could not use. */
  problems: string[];
}

const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

/** "September 1, 2026" or "2026-09-01" -> "2026-09-01". Null when unparseable. */
export function parseReviewDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
  if (!match) return null;
  const [, monthName = '', day = '', year = ''] = match;
  const month = MONTHS[monthName.toLowerCase()];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

/** Pulls the vendor's own domain out of a Trustpilot profile URL. */
export function trustpilotDomain(url: string): string | null {
  const part = url.split('/review/')[1];
  if (!part) return null;
  return part.trim().replace(/^www\./, '').replace(/[/?#].*$/, '').toLowerCase() || null;
}

function headerIndex(headers: string[], name: string): number {
  const wanted = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return headers.findIndex((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === wanted);
}

function cell(row: string[], index: number): string {
  return index >= 0 ? (row[index] ?? '').trim() : '';
}

export function parseVendorReviewsCsv(text: string): ParsedVendorReviews[] {
  const rows = parseCsvText(text).filter((row) => row.some((value) => value.trim()));
  if (rows.length < 2) return [];

  const headers = rows[0] ?? [];
  const nameAt = headerIndex(headers, 'Vendor Name');
  const ratingAt = headerIndex(headers, 'Vendor Rating');
  const linkAt = headerIndex(headers, 'TrustpilotLink');

  const slotColumns = REVIEW_SLOTS.map((slot) => ({
    slot,
    author: headerIndex(headers, `${slot}ReviewName`),
    date: headerIndex(headers, `${slot}ReviewDate`),
    rating: headerIndex(headers, `${slot}ReviewRating`),
    body: headerIndex(headers, `${slot}ReviewMsg`),
  }));

  const parsed: ParsedVendorReviews[] = [];

  for (const row of rows.slice(1)) {
    const vendorName = cell(row, nameAt);
    if (!vendorName) continue;

    const problems: string[] = [];
    const ratingText = cell(row, ratingAt);
    const ratingValue = ratingText ? Number(ratingText) : null;
    const rating =
      ratingValue !== null && Number.isFinite(ratingValue) && ratingValue >= 0 && ratingValue <= 5
        ? ratingValue
        : null;
    if (ratingText && rating === null) problems.push(`vendor rating "${ratingText}" is not a score between 0 and 5`);

    const reviews: SupplierReview[] = [];
    for (const column of slotColumns) {
      const author = cell(row, column.author);
      const body = cell(row, column.body);
      if (!author && !body) continue;
      if (!author || !body) {
        problems.push(`review ${column.slot} is missing ${author ? 'its message' : 'a reviewer name'}`);
        continue;
      }

      const dateText = cell(row, column.date);
      const reviewedAt = parseReviewDate(dateText);
      if (dateText && reviewedAt === null) problems.push(`review ${column.slot} has an unreadable date "${dateText}"`);

      const candidate = {
        author,
        rating: Number(cell(row, column.rating)),
        body,
        reviewedAt,
      };
      const result = supplierReviewSchema.safeParse(candidate);
      if (!result.success) {
        problems.push(`review ${column.slot} has an invalid rating "${cell(row, column.rating)}"`);
        continue;
      }
      reviews.push(result.data);
    }

    const link = cell(row, linkAt);
    parsed.push({ vendorName, rating, trustpilotUrl: link || null, reviews, problems });
  }

  return parsed;
}

/** Header row the importer expects, for the downloadable template. */
export function vendorReviewsCsvTemplate(): string {
  const headers = [
    'Vendor Name',
    'Vendor Rating',
    ...REVIEW_SLOTS.flatMap((slot) => [
      `${slot}ReviewName`,
      `${slot}ReviewDate`,
      `${slot}ReviewRating`,
      `${slot}ReviewMsg`,
    ]),
    'TrustpilotLink',
  ];
  const example = [
    'Example Peptides',
    '4.5',
    'Jane Doe',
    'January 28, 2026',
    '5',
    'Fast shipping and the order arrived exactly as described.',
    ...Array<string>(16).fill(''),
    'https://www.trustpilot.com/review/examplepeptides.com',
  ];
  return `${headers.join(',')}\n${example.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',')}\n`;
}
