import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DatasetDownloadButton } from '@/components/admin/dataset-download-button';
import { loadPriceDataset } from '@/lib/admin/dataset';
import {
  MAX_AGE_DAYS,
  datasetFileNames,
  summarizeDataset,
  type ExclusionReason,
} from '@/lib/dataset-export';

export const metadata: Metadata = { title: 'Dataset | Admin', robots: { index: false, follow: false } };

// The summary must match what the button would download right now.
export const dynamic = 'force-dynamic';

const PANEL_CLASS = 'rounded-card border border-line bg-surface-raised p-4 sm:p-6';

const EXCLUSION_LABELS: Record<ExclusionReason, string> = {
  inactiveSupplier: 'Supplier not active',
  outOfStock: 'Out of stock',
  stale: `Not checked in the last ${MAX_AGE_DAYS} days`,
  missingPriceOrSize: 'Missing price or mg',
  notUsd: 'Not priced in USD',
  unknownCompound: 'Compound not in the catalogue',
  notAPeptide: 'Not a peptide (bacteriostatic water)',
  suspectNasalSize: 'Nasal NAD+ or SS-31 whose listed mg does not fit the price',
  duplicate: 'Duplicate of another row (same supplier, peptide, vial size, vial count and form)',
};

export default async function AdminDatasetPage() {
  const now = new Date();
  const dataset = await loadPriceDataset(now);
  const summary = summarizeDataset(dataset);
  const fileNames = datasetFileNames(now);
  const exclusions = (Object.keys(EXCLUSION_LABELS) as ExclusionReason[]).filter(
    (reason) => dataset.excluded[reason] > 0,
  );

  const stats = [
    { label: 'Rows', value: String(summary.totalRows) },
    { label: 'Suppliers', value: String(summary.supplierCount) },
    { label: 'Unique peptides', value: String(summary.peptideCount) },
    {
      label: 'Last checked',
      value: summary.firstChecked && summary.lastChecked ? `${summary.firstChecked} to ${summary.lastChecked}` : 'None',
    },
    { label: 'Outlier rows', value: String(summary.outlierCount) },
  ];

  return (
    <>
      <AdminPageHeader title="Dataset" />

      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <section aria-labelledby="export-heading" className={PANEL_CLASS}>
          <h2 id="export-heading" className="text-sm font-black uppercase tracking-wide text-content">
            Public price dataset
          </h2>
          <p className="mt-1 text-sm text-muted">
            Downloads <span className="font-mono font-bold text-content">{fileNames.prices}</span> and{' '}
            <span className="font-mono font-bold text-content">{fileNames.outliers}</span>. Check the outliers before
            publishing; they are still in the dataset.
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-micro font-bold uppercase text-faint">{stat.label}</dt>
                <dd className="mt-1 text-lg font-black text-content">{stat.value}</dd>
              </div>
            ))}
          </dl>

          {summary.totalRows === 0 ? (
            <p className="mt-5 text-sm text-muted">
              No listings meet the rules right now, so the file would only hold its header row.
            </p>
          ) : null}

          <div className="mt-5">
            <DatasetDownloadButton />
          </div>
        </section>

        <section aria-labelledby="excluded-heading" className={PANEL_CLASS}>
          <h2 id="excluded-heading" className="text-sm font-black uppercase tracking-wide text-content">
            Listings left out
          </h2>
          {exclusions.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Every listing made it into the dataset.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {exclusions.map((reason) => (
                <li key={reason}>
                  <span className="font-bold text-content">{dataset.excluded[reason]}</span>{' '}
                  <span className="text-muted">· {EXCLUSION_LABELS[reason]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
