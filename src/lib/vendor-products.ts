import type { Offer, ProductForm } from '@/lib/schema';
import { parseCsvText } from '@/lib/vendor-import';

/**
 * One row of the vendor form's step 5 product list, held as the text the form
 * edits. Shared by the form (to load saved listings) and the save action (to
 * tell an edited saved listing from a new one).
 */
export interface VendorProductEntry {
  /** Set when the row is a listing already saved for this vendor. */
  offerId?: string;
  /** A saved listing changed in this editing session; untouched saved rows are never re-written. */
  edited?: boolean;
  compoundSlug: string;
  compoundName: string;
  form: ProductForm;
  size: string;
  productUrl: string;
  coaUrl: string;
  price: string;
  discountCode: string;
  discountPercent: string;
}

/** Integer micrograms as the size text the form's parser reads back, e.g. "10 mg" or "250 mcg". */
export function sizeText(vialSize: number): string {
  return vialSize >= 1000 ? `${vialSize / 1000} mg` : `${vialSize} mcg`;
}

/** Percent off list price, to two decimals; empty when there is no sale. */
export function discountPercentText(listPrice: number, salePrice: number | null): string {
  if (salePrice === null || salePrice >= listPrice) return '';
  return String(Math.round((1 - salePrice / listPrice) * 10_000) / 100);
}

export function offerToVendorProductEntry(offer: Offer, compoundName: string): VendorProductEntry {
  return {
    offerId: offer.id,
    compoundSlug: offer.productSlug,
    compoundName,
    form: offer.form,
    size: sizeText(offer.vialSize),
    productUrl: offer.productUrl,
    coaUrl: offer.coaUrl ?? '',
    price: (offer.listPrice / 100).toFixed(2),
    // Coupon codes live on the vendor, not on a listing, so there is nothing stored to show.
    discountCode: '',
    discountPercent: discountPercentText(offer.listPrice, offer.salePrice),
  };
}

/** The product types the vendor form's step 5 offers a picker for. */
export const VENDOR_PRODUCT_FORM_VALUES = ['vial', 'capsule', 'spray', 'pen', 'serum'] as const;
export type VendorProductFormValue = (typeof VENDOR_PRODUCT_FORM_VALUES)[number];

function normalizeVendorProductForm(value: string): VendorProductFormValue | null {
  const normalized = value.trim().toLowerCase();
  return (VENDOR_PRODUCT_FORM_VALUES as readonly string[]).includes(normalized)
    ? (normalized as VendorProductFormValue)
    : null;
}

/** Matches the size format the save action parses: a number plus mg, mcg or mL. */
const SIZE_PATTERN = /^\d+(?:\.\d+)?\s*(mg|mcg|ml)?$/i;

/**
 * Header row plus one filled example so a file started from this template has
 * every column already in place and in the right format. `exampleCompound`
 * defaults to a placeholder; the caller passes a real compound from the
 * vendor's own catalogue when one is available, so the example row matches
 * on the very first try.
 */
export function vendorProductsCsvTemplate(exampleCompound = 'BPC-157'): string {
  const csvCell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const headers = ['Compound', 'Type', 'Size', 'Product URL', 'COA URL', 'Price', 'Discount Code', 'Discount %'];
  const example = [exampleCompound, 'vial', '10 mg', 'https://example.com/product', '', '89.99', '', ''];
  return `${headers.map(csvCell).join(',')}\r\n${example.map(csvCell).join(',')}\r\n`;
}

export interface VendorProductCsvRow {
  /** Spreadsheet row number, counting the header as row 1. */
  rowNumber: number;
  /** Null when the row has errors. */
  entry: VendorProductEntry | null;
  errors: string[];
}

/**
 * Parses a bulk-upload CSV of product listings against this vendor's
 * available compound catalogue. Every row is validated the same way a
 * manually entered product is (a real compound, a known type, a size the
 * save action can parse, a URL, a price), so a bad row is reported with a
 * specific reason instead of silently producing a broken listing.
 */
export function parseVendorProductsCsv(
  csvText: string,
  products: readonly { slug: string; name: string }[],
): { rows: VendorProductCsvRow[]; fileErrors: string[] } {
  const table = parseCsvText(csvText);
  if (table.length < 2) {
    return { rows: [], fileErrors: ['The CSV file must include a header row and at least one product row.'] };
  }

  const [headerRow, ...dataRows] = table;
  const headers = (headerRow ?? []).map((h) => h.trim().toLowerCase());
  const colIndex = (...names: string[]) => headers.findIndex((h) => names.includes(h));
  const columns = {
    compound: colIndex('compound', 'product', 'compound name'),
    type: colIndex('type', 'form'),
    size: colIndex('size'),
    url: colIndex('product url', 'url'),
    coa: colIndex('coa url', 'coa'),
    price: colIndex('price'),
    discountCode: colIndex('discount code', 'coupon code'),
    discountPercent: colIndex('discount %', 'discount percent', 'discount'),
  };
  if ([columns.compound, columns.type, columns.size, columns.url, columns.price].some((i) => i === -1)) {
    return {
      rows: [],
      fileErrors: [
        'The CSV must have Compound, Type, Size, Product URL and Price columns. Download the template for the exact headers.',
      ],
    };
  }

  const byName = new Map(products.map((p) => [p.name.trim().toLowerCase(), p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const cell = (row: string[], index: number) => (index >= 0 ? (row[index] ?? '').trim() : '');

  const rows: VendorProductCsvRow[] = dataRows
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter(({ row }) => row.some((value) => value.trim() !== ''))
    .map(({ row, rowNumber }) => {
      const errors: string[] = [];
      const compoundText = cell(row, columns.compound);
      const typeText = cell(row, columns.type);
      const sizeValue = cell(row, columns.size);
      const url = cell(row, columns.url);
      const coaUrl = cell(row, columns.coa);
      const priceText = cell(row, columns.price);
      const discountCode = cell(row, columns.discountCode);
      const discountPercentRaw = cell(row, columns.discountPercent);

      const product = byName.get(compoundText.toLowerCase()) ?? bySlug.get(compoundText);
      if (!compoundText) errors.push('Compound is required.');
      else if (!product) errors.push(`Unknown compound "${compoundText}". Use the exact name from this vendor's compound list.`);

      const form = normalizeVendorProductForm(typeText);
      if (!typeText) errors.push('Type is required.');
      else if (!form) errors.push(`Unknown type "${typeText}". Use one of: ${VENDOR_PRODUCT_FORM_VALUES.join(', ')}.`);

      if (!sizeValue) errors.push('Size is required.');
      else if (!SIZE_PATTERN.test(sizeValue)) errors.push(`Size "${sizeValue}" must be a number with mg, mcg or mL, e.g. "10 mg".`);

      if (!url) errors.push('Product URL is required.');
      else if (!/^https?:\/\//i.test(url)) errors.push('Product URL must start with http:// or https://.');

      if (coaUrl && !/^https?:\/\//i.test(coaUrl)) {
        errors.push('COA URL must start with http:// or https://, or be left blank.');
      }

      const price = Number(priceText);
      if (!priceText) errors.push('Price is required.');
      else if (!Number.isFinite(price) || price <= 0) errors.push(`Price "${priceText}" must be a positive number.`);

      let discountPercent = '';
      if (discountPercentRaw) {
        const percent = Number(discountPercentRaw);
        if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
          errors.push(`Discount % "${discountPercentRaw}" must be a number between 0 and 100.`);
        } else {
          discountPercent = String(percent);
        }
      }

      const entry: VendorProductEntry | null =
        errors.length === 0 && product && form
          ? {
              compoundSlug: product.slug,
              compoundName: product.name,
              form,
              size: sizeValue,
              productUrl: url,
              coaUrl,
              price: String(price),
              discountCode,
              discountPercent,
            }
          : null;

      return { rowNumber, entry, errors };
    });

  return { rows, fileErrors: [] };
}
