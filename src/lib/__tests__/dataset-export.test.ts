import { describe, expect, it } from 'vitest';
import type { Offer } from '../schema';
import {
  DATASET_COLUMNS,
  buildPriceDataset,
  datasetFileNames,
  datasetToCsv,
  outliersToCsv,
  summarizeDataset,
} from '../dataset-export';

const NOW = new Date('2026-10-21T12:00:00.000Z');
const RECENT = '2026-10-20T08:00:00.000Z';

const suppliers = [
  { slug: 'acme', name: 'Acme Peptides', isActive: true },
  { slug: 'beta-labs', name: 'Beta Labs, Inc.', isActive: true },
  { slug: 'gone', name: 'Gone Labs', isActive: false },
];

const products = [
  { slug: 'bpc-157', name: 'BPC-157' },
  { slug: 'bpc-157-tb-500', name: 'BPC-157 + TB-500' },
  { slug: 'wolverine', name: 'Wolverine' },
  { slug: 'glow', name: 'GLOW' },
  { slug: 'nad', name: 'NAD+' },
  { slug: 'bacteriostatic-water', name: 'Bacteriostatic Water' },
];

function offer(over: Partial<Offer> = {}): Offer {
  return {
    supplierSlug: 'acme',
    productSlug: 'bpc-157',
    form: 'vial',
    vialSize: 10_000,
    vialCount: 1,
    listPrice: 3000,
    salePrice: null,
    currency: 'USD',
    inStock: true,
    productUrl: 'https://vendor.example/bpc?ref=AFFILIATE',
    imageUrl: null,
    labReport: null,
    coaUrl: null,
    scrapedAt: RECENT,
    ...over,
  };
}

function build(offers: Offer[]) {
  return buildPriceDataset({ offers, suppliers, products, now: NOW });
}

function csvLines(csv: string): string[] {
  return csv.trimEnd().split('\n');
}

describe('buildPriceDataset filters', () => {
  it('keeps an active, in-stock, recently checked listing', () => {
    expect(build([offer()]).rows).toHaveLength(1);
  });

  it('drops inactive suppliers, out-of-stock rows and listings older than 30 days', () => {
    const dataset = build([
      offer({ supplierSlug: 'gone' }),
      offer({ supplierSlug: 'unknown-vendor' }),
      offer({ inStock: false }),
      offer({ scrapedAt: '2026-09-20T11:59:59.000Z' }),
    ]);
    expect(dataset.rows).toHaveLength(0);
    expect(dataset.excluded).toMatchObject({ inactiveSupplier: 2, outOfStock: 1, stale: 1 });
  });

  it('keeps a listing checked exactly 30 days ago', () => {
    expect(build([offer({ scrapedAt: '2026-09-21T12:00:00.000Z' })]).rows).toHaveLength(1);
  });

  it('drops rows with no usable price or mg rather than dividing by zero', () => {
    const dataset = build([offer({ listPrice: 0 }), offer({ vialSize: 0 }), offer({ vialCount: 0 })]);
    expect(dataset.rows).toHaveLength(0);
    expect(dataset.excluded.missingPriceOrSize).toBe(3);
  });

  it('drops an unparseable check date as stale', () => {
    expect(build([offer({ scrapedAt: 'not a date' })]).excluded.stale).toBe(1);
  });

  it('drops non-USD listings, unknown compounds and bacteriostatic water', () => {
    const dataset = build([
      offer({ currency: 'EUR' }),
      offer({ productSlug: 'mystery' }),
      offer({ productSlug: 'bacteriostatic-water' }),
    ]);
    expect(dataset.rows).toHaveLength(0);
    expect(dataset.excluded).toMatchObject({ notUsd: 1, unknownCompound: 1, notAPeptide: 1 });
  });
});

describe('buildPriceDataset naming and sizes', () => {
  it('uses the whole pack for kits so price per mg is right', () => {
    const csv = datasetToCsv(build([offer({ vialSize: 10_000, vialCount: 10, listPrice: 20_000 })]));
    // 10 x 10mg for $200 is 100mg at $2.0000/mg, not $20/mg.
    expect(csvLines(csv)[1]).toContain(',100,vial,200.00,2.0000,');
  });

  it('names blends by their ingredients and merges Wolverine into BPC-157 + TB-500', () => {
    const dataset = build([
      offer({ productSlug: 'wolverine', vialSize: 20_000, scrapedAt: '2026-10-19T00:00:00.000Z' }),
      offer({ productSlug: 'bpc-157-tb-500', vialSize: 20_000 }),
      offer({ productSlug: 'glow', vialSize: 70_000 }),
    ]);
    expect(dataset.rows.map((row) => row.peptideName)).toEqual([
      'BPC-157 + TB-500 blend',
      'GHK-Cu + BPC-157 + TB-500 blend',
    ]);
    expect(dataset.excluded.duplicate).toBe(1);
  });

  it('maps site forms onto the dataset forms', () => {
    const dataset = build([
      offer({ form: 'spray' }),
      offer({ form: 'serum', vialSize: 5000 }),
      offer({ form: 'pen', vialSize: 6000 }),
      offer({ form: 'capsule', vialSize: 7000 }),
    ]);
    expect(dataset.rows.map((row) => row.form).sort()).toEqual(['capsule', 'nasal', 'other', 'topical']);
  });

  it('writes fractional mg without trailing zeros', () => {
    const csv = datasetToCsv(build([offer({ vialSize: 500, vialCount: 60, listPrice: 4500 }), offer({ vialSize: 2500 })]));
    expect(csv).toContain(',2.5,vial,');
    expect(csv).toContain(',30,vial,');
  });
});

describe('buildPriceDataset duplicates', () => {
  it('keeps the most recently checked of two identical listings', () => {
    const dataset = build([
      offer({ listPrice: 2500, scrapedAt: '2026-10-01T00:00:00.000Z' }),
      offer({ listPrice: 3000, scrapedAt: '2026-10-20T00:00:00.000Z' }),
    ]);
    expect(dataset.rows).toHaveLength(1);
    expect(dataset.rows[0]?.priceCents).toBe(3000);
  });

  it('keeps the cheaper when both were checked at the same time', () => {
    const dataset = build([offer({ listPrice: 3000 }), offer({ listPrice: 2500 })]);
    expect(dataset.rows[0]?.priceCents).toBe(2500);
  });

  it('treats different sizes and forms as different rows', () => {
    expect(build([offer(), offer({ vialSize: 5000 }), offer({ form: 'spray' })]).rows).toHaveLength(3);
  });
});

describe('outliers', () => {
  it('keeps flagged rows in the dataset', () => {
    // $1, $1, $1 and $8 per mg: the $8 row is flagged but not removed.
    const dataset = build([
      offer({ listPrice: 1000 }),
      offer({ listPrice: 2000, vialSize: 20_000 }),
      offer({ listPrice: 3000, vialSize: 30_000 }),
      offer({ listPrice: 32_000, vialSize: 40_000 }),
    ]);
    expect(dataset.rows).toHaveLength(4);
    expect(dataset.outliers.map(({ row }) => row.totalMcg)).toEqual([40_000]);
  });

  it('compares each row only with its own peptide', () => {
    // NAD+ at $0.13/mg is far below BPC-157's $3/mg but is the only NAD+ row.
    const dataset = build([offer(), offer({ productSlug: 'nad', vialSize: 500_000, listPrice: 6500 })]);
    expect(dataset.outliers).toHaveLength(0);
  });

  it('does not flag a row at exactly 5x the median', () => {
    // Three rows at $1, $1 and $5 per mg: median $1, top row exactly 5x.
    const dataset = build([
      offer({ listPrice: 1000 }),
      offer({ listPrice: 2000, vialSize: 20_000 }),
      offer({ listPrice: 15_000, vialSize: 30_000 }),
    ]);
    expect(dataset.outliers).toHaveLength(0);
  });

  it('flags a row just over 5x and just under 0.2x', () => {
    const dataset = build([
      offer({ listPrice: 1000 }),
      offer({ listPrice: 2000, vialSize: 20_000 }),
      offer({ listPrice: 3000, vialSize: 30_000 }),
      offer({ listPrice: 20_001, vialSize: 40_000 }),
      offer({ listPrice: 999, vialSize: 50_000 }),
    ]);
    expect(dataset.outliers.map(({ row }) => row.totalMcg).sort()).toEqual([40_000, 50_000]);
  });

  it('writes the median and ratio in the outliers file', () => {
    const dataset = build([
      offer({ listPrice: 1000 }),
      offer({ listPrice: 2000, vialSize: 20_000 }),
      offer({ listPrice: 30_000, vialSize: 30_000 }),
    ]);
    const lines = csvLines(outliersToCsv(dataset));
    expect(lines[0]).toBe([...DATASET_COLUMNS, 'peptide_median_price_per_mg_usd', 'ratio_to_median'].join(','));
    expect(lines[1]?.endsWith(',1.0000,10.00')).toBe(true);
  });
});

describe('datasetToCsv', () => {
  it('writes the columns in the published order', () => {
    expect(csvLines(datasetToCsv(build([])))).toEqual([DATASET_COLUMNS.join(',')]);
  });

  it('formats one full row', () => {
    const csv = datasetToCsv(build([offer({ listPrice: 3333, coaUrl: 'https://lab.example/coa.pdf' })]));
    expect(csvLines(csv)[1]).toBe(
      'BPC-157,Acme Peptides,10,vial,33.33,3.3330,true,true,https://www.peplookup.com/suppliers/acme,2026-10-20',
    );
  });

  it('rounds price per mg half up at 4 decimals without float error', () => {
    // $10.00 / 3mg = 3.33333.. -> 3.3333; $20.00 / 3mg = 6.66666.. -> 6.6667.
    const csv = datasetToCsv(build([offer({ listPrice: 1000, vialSize: 3000 }), offer({ listPrice: 2000, vialSize: 3000, form: 'spray' })]));
    expect(csv).toContain(',10.00,3.3333,');
    expect(csv).toContain(',20.00,6.6667,');
  });

  it('counts a lab report link as a COA', () => {
    const labReport = {
      labName: 'Lab',
      labUrl: null,
      grade: 'A' as const,
      score: 9,
      results: {},
      reportUrl: 'https://lab.example/r.pdf',
      testedAt: null,
    };
    expect(build([offer({ labReport })]).rows[0]?.hasCoa).toBe(true);
    expect(build([offer()]).rows[0]?.hasCoa).toBe(false);
  });

  it('quotes names that contain commas or quotes', () => {
    const csv = datasetToCsv(build([offer({ supplierSlug: 'beta-labs' })]));
    expect(csvLines(csv)[1]).toContain(',"Beta Labs, Inc.",');
  });

  it('never writes vendor URLs, ref codes or ids', () => {
    const csv = datasetToCsv(build([offer({ id: 'row-123', coaUrl: 'https://vendor.example/coa?ref=AFFILIATE' })]));
    expect(csv).not.toContain('vendor.example');
    expect(csv).not.toContain('ref=');
    expect(csv).not.toContain('row-123');
  });
});

describe('summarizeDataset', () => {
  it('counts rows, suppliers, peptides, dates and outliers', () => {
    const dataset = build([
      offer({ scrapedAt: '2026-10-02T00:00:00.000Z' }),
      offer({ supplierSlug: 'beta-labs', productSlug: 'nad', vialSize: 500_000 }),
    ]);
    expect(summarizeDataset(dataset)).toEqual({
      totalRows: 2,
      supplierCount: 2,
      peptideCount: 2,
      firstChecked: '2026-10-02',
      lastChecked: '2026-10-20',
      outlierCount: 0,
    });
  });

  it('reports no dates for an empty dataset', () => {
    expect(summarizeDataset(build([]))).toMatchObject({ totalRows: 0, firstChecked: null, lastChecked: null });
  });
});

describe('datasetFileNames', () => {
  it('names files for the export month', () => {
    expect(datasetFileNames(NOW)).toEqual({
      prices: 'research-peptide-prices-2026-10.csv',
      outliers: 'outliers-2026-10.csv',
    });
  });
});
