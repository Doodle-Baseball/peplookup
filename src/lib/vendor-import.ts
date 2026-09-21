export const vendorImportFieldMap = {
  name: ['name', 'vendor name', 'supplier name', 'company', 'company name', 'vendor'],
  affiliateUrl: [
    'affiliate website',
    'affiliate website url',
    'affiliate website link',
    'affiliate url',
    'affiliate link',
    'website',
    'website url',
    'homepage',
    'homepage url',
    'site',
    'ref link',
    'referral link',
    'tracking url',
  ],
  country: ['country', 'hq country', 'country of operation', 'location', 'country code'],
  description: ['description', 'about', 'summary', 'notes'],
  logoUrl: ['logo url', 'logo', 'icon url', 'image url', 'image'],
  foundedYear: ['founded year', 'year founded', 'established', 'founded', 'year'],
  accessType: ['access type', 'access', 'sales type', 'vendor type'],
  shippingSpeed: ['shipping speed', 'delivery time', 'shipping time', 'lead time', 'delivery'],
  paymentMethods: ['payment methods', 'payments', 'accepted payment methods', 'payment'],
  couponCode: ['coupon code', 'discount code', 'coupon', 'voucher'],
  couponPercentOff: ['coupon percent off', 'discount percent', 'discount %', 'coupon percent'],
  policyShippingUrl: ['shipping policy url', 'shipping policy'],
  policyReturnsUrl: ['returns policy url', 'returns policy'],
} as const;

export const vendorImportFields = [
  { key: 'name', label: 'Vendor name' },
  { key: 'affiliateUrl', label: 'Affiliate Website Link' },
  { key: 'country', label: 'Country' },
  { key: 'description', label: 'Description' },
  { key: 'logoUrl', label: 'Logo URL' },
  { key: 'foundedYear', label: 'Founded year' },
  { key: 'accessType', label: 'Access type' },
  { key: 'shippingSpeed', label: 'Shipping speed' },
  { key: 'paymentMethods', label: 'Payment methods' },
  { key: 'couponCode', label: 'Coupon code' },
  { key: 'couponPercentOff', label: 'Coupon percent off' },
  { key: 'policyShippingUrl', label: 'Shipping policy URL' },
  { key: 'policyReturnsUrl', label: 'Returns policy URL' },
] as const;

export type VendorImportField = keyof typeof vendorImportFieldMap;

/** Wraps a cell only when it carries a comma, quote or newline, as CSV requires. */
function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Header row plus one filled example. The headers are the field labels, every
 * one of which is a recognised alias, so a file started from this template
 * comes back with all columns already mapped. The example row exists mainly to
 * show the two formats that are easy to get wrong: payment methods as one
 * comma-separated cell, and access type as one of ruo / legit_script /
 * telehealth. Only vendor name and affiliate link are required.
 */
export function vendorCsvTemplate(): string {
  const headers = vendorImportFields.map((field) => field.label);
  const example: Record<VendorImportField, string> = {
    name: 'Example Peptides',
    affiliateUrl: 'https://examplepeptides.com',
    country: 'United States',
    description: 'Research peptides with published certificates of analysis.',
    logoUrl: 'https://examplepeptides.com/logo.png',
    foundedYear: '2021',
    accessType: 'ruo',
    shippingSpeed: 'Ships in 1-2 business days',
    paymentMethods: 'Credit card, Crypto, Zelle',
    couponCode: 'SAVE10',
    couponPercentOff: '10',
    policyShippingUrl: 'https://examplepeptides.com/shipping',
    policyReturnsUrl: 'https://examplepeptides.com/returns',
  };
  const exampleRow = vendorImportFields.map((field) => csvCell(example[field.key as VendorImportField]));
  return `${headers.map(csvCell).join(',')}\r\n${exampleRow.join(',')}\r\n`;
}

export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      const isCrLf = ch === '\r' && text[i + 1] === '\n';
      currentRow.push(currentValue);
      currentValue = '';

      if (currentRow.some((cell) => cell.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];

      if (isCrLf) {
        i += 1;
      }
      continue;
    }

    currentValue += ch;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    if (currentRow.some((cell) => cell.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function normalizeCsvHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getMappedCell(row: string[], headers: string[], mapping: Partial<Record<VendorImportField, string>>, field: VendorImportField): string {
  const mappedHeader = mapping[field];
  if (!mappedHeader) return '';

  const index = headers.findIndex((header) => normalizeCsvHeader(header) === normalizeCsvHeader(mappedHeader));
  if (index === -1 || index >= row.length) return '';
  return (row[index] ?? '').trim();
}

export function inferFieldMapping(headers: string[]): Partial<Record<VendorImportField, string>> {
  const normalizedHeaders = headers.map((header) => ({ raw: header, normalized: normalizeCsvHeader(header) }));
  const mapping: Partial<Record<VendorImportField, string>> = {};

  (Object.keys(vendorImportFieldMap) as VendorImportField[]).forEach((field) => {
    const aliases = vendorImportFieldMap[field] as readonly string[];
    const match = normalizedHeaders.find(({ normalized }) => aliases.includes(normalized));
    if (match) {
      mapping[field] = match.raw;
    }
  });

  return mapping;
}

export function csvRowsToVendorObjects<T extends Record<string, string>>(rows: string[][], mapping: Partial<Record<VendorImportField, string>>) {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) return [] as T[];

  const headerIndexes = new Map<string, number>();
  headerRow.forEach((header, index) => {
    headerIndexes.set(normalizeCsvHeader(header), index);
  });

  const chosenFields = Object.fromEntries(
    Object.entries(mapping).map(([field, header]) => [field, header ? headerIndexes.get(normalizeCsvHeader(header)) ?? -1 : -1]),
  ) as Record<VendorImportField, number>;

  return dataRows.reduce<Array<T>>((acc, currentRow) => {
    const obj = {} as Record<string, string>;
    (Object.keys(chosenFields) as VendorImportField[]).forEach((field) => {
      const index = chosenFields[field];
      if (index === undefined || index < 0 || index >= currentRow.length) return;
      const value = currentRow[index];
      if (typeof value === 'string') {
        obj[field] = value.trim();
      }
    });

    if (Object.values(obj).some((value) => typeof value === 'string' && value.trim().length > 0)) {
      acc.push(obj as T);
    }
    return acc;
  }, []);
}
