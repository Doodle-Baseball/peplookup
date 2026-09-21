'use client';

import { startTransition, useActionState, useMemo, useState, type ChangeEvent, type DragEvent } from 'react';
import Link from 'next/link';
import {
  addReviewAction,
  importReviewsCsvAction,
  type AddReviewState,
  type ImportReviewsState,
} from '@/app/admin/(dashboard)/reviews/actions';
import type { VendorReviewSummary } from '@/lib/admin/reviews';
import { vendorReviewsCsvTemplate } from '@/lib/review-import';
import { VendorSelect } from '@/components/admin/vendor-select';
import { Field, TextArea } from '@/components/admin/form-fields';
import { formatReviewDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const ADD_INITIAL: AddReviewState = { error: null, success: null };
const IMPORT_INITIAL: ImportReviewsState = { error: null, success: null, outcomes: [] };

/** Matches the 5 MB server-action limit in next.config.mjs, with room for encoding. */
const MAX_FILE_BYTES = 4.5 * 1024 * 1024;

const RATING_OPTIONS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];

const FALLBACK_STATUS = { label: 'Failed', className: 'bg-danger/10 text-danger' };

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  imported: { label: 'Imported', className: 'bg-ok/10 text-ok' },
  'no-vendor': { label: 'No vendor', className: 'bg-warn/10 text-warn' },
  'no-reviews': { label: 'No reviews', className: 'bg-surface-sunken text-muted' },
  failed: { label: 'Failed', className: 'bg-danger/10 text-danger' },
};

export function ReviewManager({ vendors }: { vendors: VendorReviewSummary[] }) {
  const [rawAddState, addAction, adding] = useActionState(addReviewAction, ADD_INITIAL);
  const [rawImportState, importAction, importing] = useActionState(importReviewsCsvAction, IMPORT_INITIAL);
  // An unresolvable Server Action (a tab open across a deploy, or a dev
  // rebuild that reassigned action ids) resolves to undefined instead of a
  // state object; falling back keeps the form usable instead of crashing.
  const addState = rawAddState ?? ADD_INITIAL;
  const importState = rawImportState ?? IMPORT_INITIAL;

  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reviewedAt, setReviewedAt] = useState('');

  const vendorOptions = useMemo(() => vendors.map((v) => ({ slug: v.slug, name: v.name })), [vendors]);
  const withReviews = vendors.filter((v) => v.reviewCount > 0);
  const totalReviews = vendors.reduce((sum, v) => sum + v.reviewCount, 0);

  async function readFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError('That file is over 4.5 MB. Split it into smaller sheets.');
      return;
    }
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
  }

  function downloadTemplate() {
    const blob = new Blob([vendorReviewsCsvTemplate()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'peplookup-vendor-reviews-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-surface-raised p-5">
          <dt className="text-micro font-bold uppercase text-faint">Vendors</dt>
          <dd className="mt-1 text-3xl font-black text-content">{vendors.length}</dd>
        </div>
        <div className="rounded-card border border-accent/30 bg-accent-tint p-5">
          <dt className="text-micro font-bold uppercase text-faint">With reviews</dt>
          <dd className="mt-1 text-3xl font-black text-accent-strong">{withReviews.length}</dd>
        </div>
        <div className="rounded-card border border-line bg-surface-raised p-5">
          <dt className="text-micro font-bold uppercase text-faint">Reviews stored</dt>
          <dd className="mt-1 text-3xl font-black text-content">{totalReviews}</dd>
        </div>
      </dl>

      {/* ------------------------------------------------- Add a single review */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-content">Add a review</h2>
        <p className="mt-1 text-sm text-muted">
          Pick the vendor, then enter the review exactly as it was published. It is appended to the end of
          that vendor&rsquo;s list; reorder or edit from the vendor&rsquo;s own edit page.
        </p>

        <form action={addAction} className="mt-5 space-y-5">
          <div className="max-w-md">
            <VendorSelect label="Vendor" name="vendorSlug" vendors={vendorOptions} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Reviewer name" name="author" placeholder="Nicole Belskis" required />

            <div>
              <label htmlFor="rating" className="block text-sm font-semibold text-content">
                Rating
              </label>
              <select
                id="rating"
                name="rating"
                defaultValue="5"
                className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
              >
                {RATING_OPTIONS.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} / 5
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reviewedAt" className="block text-sm font-semibold text-content">
                Date
              </label>
              <input
                id="reviewedAt"
                name="reviewedAt"
                type="date"
                value={reviewedAt}
                onChange={(e) => setReviewedAt(e.target.value)}
                className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-muted">
                {reviewedAt ? `Shows as ${formatReviewDate(reviewedAt)}` : 'Optional.'}
              </p>
            </div>
          </div>

          <TextArea label="Review message" name="body" rows={4} placeholder="What the reviewer wrote, word for word." />

          <div className="flex flex-wrap items-center justify-end gap-3">
            <p aria-live="polite" className="mr-auto text-sm">
              {addState.error ? <span className="font-semibold text-danger">{addState.error}</span> : null}
              {addState.success ? <span className="font-semibold text-ok">{addState.success}</span> : null}
            </p>
            <button
              type="submit"
              disabled={adding}
              className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:opacity-60"
            >
              {adding ? 'Adding…' : 'Add review'}
            </button>
          </div>
        </form>
      </section>

      {/* ---------------------------------------------------- Bulk CSV import */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-content">Bulk import from CSV</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              One row per vendor, with up to five reviews per row. Vendors are matched by name, then by
              website, so a sheet that lists a vendor under a different display name still lands correctly.
              A vendor&rsquo;s existing reviews are replaced by what the sheet carries for it.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="shrink-0 rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
          >
            Download template
          </button>
        </div>

        <div
          onDragOver={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(false);
            void readFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'mt-5 rounded-card border-2 border-dashed p-8 text-center transition-colors',
            dragging ? 'border-brand bg-brand-soft' : 'border-line bg-surface',
          )}
        >
          <p className="text-sm font-bold text-content">
            {fileName ? `Loaded ${fileName}` : 'Drop a CSV here, or choose a file'}
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-chip border border-line bg-surface-raised px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand-strong">
            Choose file
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e: ChangeEvent<HTMLInputElement>) => void readFile(e.target.files?.[0])}
            />
          </label>
          {fileError ? <p className="mt-3 text-sm font-semibold text-danger">{fileError}</p> : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <p aria-live="polite" className="mr-auto text-sm">
            {importState.error ? <span className="font-semibold text-danger">{importState.error}</span> : null}
            {importState.success ? <span className="font-semibold text-ok">{importState.success}</span> : null}
          </p>
          <button
            type="button"
            disabled={!csvText || importing}
            onClick={() => {
              const data = new FormData();
              data.set('csvText', csvText);
              startTransition(() => importAction(data));
            }}
            className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:pointer-events-none disabled:opacity-50"
          >
            {importing ? 'Importing…' : 'Import reviews'}
          </button>
        </div>

        {importState.outcomes.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {importState.outcomes.map((outcome) => {
              const style = STATUS_STYLES[outcome.status] ?? FALLBACK_STATUS;
              return (
                <li
                  key={`${outcome.vendorName}-${outcome.matchedSlug ?? 'none'}`}
                  className="flex flex-wrap items-center gap-3 rounded-chip border border-line bg-surface px-3 py-2.5 text-sm"
                >
                  <span className={cn('rounded-pill px-2.5 py-1 text-micro font-bold uppercase', style.className)}>
                    {style.label}
                  </span>
                  <span className="font-bold text-content">{outcome.vendorName}</span>
                  {outcome.matchedSlug ? (
                    <span className="text-xs text-muted">
                      → {outcome.matchedSlug}
                      {outcome.matchedBy === 'website' ? ' (matched by website)' : ''}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs font-bold text-muted">
                    {outcome.reviewCount} review{outcome.reviewCount === 1 ? '' : 's'}
                  </span>
                  {outcome.detail ? (
                    <span className="w-full text-xs text-faint">{outcome.detail}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {/* ------------------------------------------------ Who has reviews now */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-content">
          Vendors with reviews ({withReviews.length})
        </h2>
        {withReviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No reviews stored yet. Add one above, or import a sheet.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {withReviews.map((vendor) => (
              <li key={vendor.slug}>
                <Link
                  href={`/admin/vendors/${vendor.slug}/edit`}
                  className="flex items-center justify-between gap-3 rounded-chip border border-line bg-surface px-3 py-2.5 text-sm transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  <span className="truncate font-bold text-content">{vendor.name}</span>
                  <span className="shrink-0 text-xs font-bold text-muted">
                    {vendor.reviewCount} review{vendor.reviewCount === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
