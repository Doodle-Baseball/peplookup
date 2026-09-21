'use client';

import {
  startTransition,
  useActionState,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import {
  importCompoundsCsvAction,
  type CompoundImportState,
} from '@/app/admin/(dashboard)/compounds/actions';
import type { CompoundImportStatus } from '@/lib/admin/compounds';
import {
  BENEFIT_SLOTS,
  compoundCsvTemplate,
  createCompoundMatcher,
  EVIDENCE_SLOTS,
  INTERACTION_SLOTS,
  isRowImportable,
  parseCompoundCsv,
  rowProblems,
  type CompoundIdentity,
  type ParsedCompoundRow,
} from '@/lib/compound-import';
import { cn } from '@/lib/cn';

const INITIAL_STATE: CompoundImportState = { error: null, outcomes: [] };

/** Stays under the 5 MB server action limit in next.config.mjs, leaving room for form encoding. */
const MAX_FILE_BYTES = 4.5 * 1024 * 1024;
const ROWS_PER_PAGE = 50;

const STATUS_STYLES: Record<CompoundImportStatus, { label: string; className: string }> = {
  created: { label: 'Created', className: 'bg-ok/10 text-ok' },
  updated: { label: 'Updated', className: 'bg-info/10 text-info' },
  skipped: { label: 'Skipped', className: 'bg-surface-sunken text-muted' },
  failed: { label: 'Failed', className: 'bg-danger/10 text-danger' },
};

type RowFilter = 'all' | 'ready' | 'problems';

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'danger' | 'warn' }) {
  return (
    <div className="rounded-chip border border-line bg-surface px-4 py-3">
      <p className="text-micro font-bold uppercase text-faint">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-black text-content',
          tone === 'ok' && 'text-ok',
          tone === 'danger' && 'text-danger',
          tone === 'warn' && 'text-warn',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function CompoundCsvImport({ identities }: { identities: CompoundIdentity[] | null }) {
  const [rawState, formAction, pending] = useActionState(importCompoundsCsvAction, INITIAL_STATE);
  // An unresolvable Server Action (a tab open across a deploy, or a dev
  // rebuild that reassigned action ids) resolves to undefined instead of a
  // state object; falling back keeps the form usable instead of crashing.
  const state = rawState ?? INITIAL_STATE;
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [onExisting, setOnExisting] = useState<'skip' | 'update'>('skip');
  const [enforceLengths, setEnforceLengths] = useState(true);
  const [rowFilter, setRowFilter] = useState<RowFilter>('all');
  const [page, setPage] = useState(0);
  const [submittedText, setSubmittedText] = useState<string | null>(null);

  // The same parser the server runs, so problems show before anything is sent.
  const parsed = useMemo(() => (csvText.trim() ? parseCompoundCsv(csvText) : null), [csvText]);
  const matcher = useMemo(() => (identities ? createCompoundMatcher(identities) : null), [identities]);

  const rows = parsed?.rows ?? [];
  const readyRows = rows.filter((row) => isRowImportable(row, enforceLengths));
  const problemRows = rows.filter((row) => !isRowImportable(row, enforceLengths));
  const lengthOnlyRows = enforceLengths ? 0 : rows.filter((row) => row.input && row.lengthIssues.length > 0).length;
  const existingCount = matcher ? readyRows.filter((row) => matcher.existingSlugFor(row.name)).length : 0;
  const importCount = onExisting === 'skip' ? readyRows.length - existingCount : readyRows.length;

  const visibleRows = rowFilter === 'ready' ? readyRows : rowFilter === 'problems' ? problemRows : rows;
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = visibleRows.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE);

  const nothingNewToImport = matcher !== null && onExisting === 'skip' && readyRows.length > 0 && importCount === 0;
  const canImport =
    parsed !== null && parsed.errors.length === 0 && readyRows.length > 0 && !nothingNewToImport && !pending;
  // Results belong to the file that produced them; hide them once another file is chosen.
  const showResult = submittedText !== null && submittedText === csvText && !pending;

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setSubmittedText(null);
    setPage(0);
    setRowFilter('all');
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setFileName(file.name);
      setFileError('That isn’t a CSV file. Export the spreadsheet as “CSV UTF-8” and choose it again.');
      setCsvText('');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileName(file.name);
      setFileError('This file is larger than 4.5 MB. Split it into smaller files and import them one at a time.');
      setCsvText('');
      return;
    }
    setFileError(null);
    setFileName(file.name);
    setCsvText(await file.text());
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    void loadFile(event.target.files?.[0]);
    // Lets the same file be chosen again after it's been fixed in the spreadsheet.
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void loadFile(event.dataTransfer.files[0]);
  }

  function clearFile() {
    setCsvText('');
    setFileName(null);
    setFileError(null);
    setSubmittedText(null);
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([compoundCsvTemplate()], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compounds-template.csv';
    link.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function changeFilter(filter: RowFilter) {
    setRowFilter(filter);
    setPage(0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canImport) return;
    const formData = new FormData();
    formData.set('csvText', csvText);
    formData.set('onExisting', onExisting);
    formData.set('enforceLengths', enforceLengths ? 'on' : 'off');
    setSubmittedText(csvText);
    startTransition(() => formAction(formData));
  }

  const counts = state.outcomes.reduce<Record<CompoundImportStatus, number>>(
    (totals, outcome) => ({ ...totals, [outcome.status]: totals[outcome.status] + 1 }),
    { created: 0, updated: 0, skipped: 0, failed: 0 },
  );
  const failedOutcomes = state.outcomes.filter((outcome) => outcome.status === 'failed');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-content">1. Choose a CSV file</h2>
            <p className="mt-1 text-sm text-muted">
              One row per compound. Start from the template so every column is in place.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand"
          >
            Download template
          </button>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line bg-surface px-4 py-10 text-center transition-colors hover:border-brand focus-within:border-brand',
            isDragging && 'border-brand bg-brand-soft',
          )}
        >
          <span className="rounded-chip bg-brand px-4 py-2 text-sm font-bold text-surface">Choose CSV file</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFileInput} className="sr-only" />
          <span className="text-xs text-muted">or drag and drop it here · up to 4.5 MB</span>
        </label>

        {fileName ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-content">{fileName}</span>
            <button type="button" onClick={clearFile} className="text-xs font-semibold text-muted hover:text-danger">
              Remove file
            </button>
          </div>
        ) : null}
        {fileError ? (
          <p role="alert" className="mt-2 text-sm font-semibold text-danger">
            {fileError}
          </p>
        ) : null}
      </section>

      {parsed ? (
        <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="text-base font-black text-content">2. Review validation</h2>

          {parsed.errors.length > 0 ? (
            <div role="alert" className="mt-3 rounded-chip border border-danger/30 bg-danger/5 px-4 py-3">
              <p className="text-sm font-bold text-danger">This file can&rsquo;t be imported yet:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-content">
                {parsed.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Rows" value={rows.length} />
                <StatTile label="Ready" value={readyRows.length} tone="ok" />
                <StatTile label="With errors" value={problemRows.length} tone={problemRows.length > 0 ? 'danger' : undefined} />
                <StatTile label="Already exist" value={existingCount} />
              </div>

              <label className="mt-4 flex items-start gap-2.5 text-sm text-content">
                <input
                  type="checkbox"
                  checked={enforceLengths}
                  onChange={(event) => setEnforceLengths(event.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold">Enforce character-length rules</span>
                  <span className="block text-xs text-muted">
                    Rows with a title or description outside its allowed length are treated as errors. Untick to import them
                    anyway{lengthOnlyRows > 0 ? ` (${plural(lengthOnlyRows, 'row')} currently have length warnings)` : ''}.
                  </span>
                </span>
              </label>
            </>
          )}

          {parsed.ignoredColumns.length > 0 ? (
            <p className="mt-3 text-xs text-warn">Ignored unrecognised columns: {parsed.ignoredColumns.join(', ')}</p>
          ) : null}
          {identities === null && parsed.errors.length === 0 ? (
            <p className="mt-3 text-xs text-warn">
              Existing compounds couldn&rsquo;t be loaded, so the preview can&rsquo;t show which rows already exist. The
              import still checks this when it runs.
            </p>
          ) : null}

          {rows.length > 0 ? (
            <>
              <div role="group" aria-label="Filter rows" className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    ['all', `All (${rows.length})`],
                    ['ready', `Ready (${readyRows.length})`],
                    ['problems', `With errors (${problemRows.length})`],
                  ] as const
                ).map(([filter, label]) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={rowFilter === filter}
                    onClick={() => changeFilter(filter)}
                    className={cn(
                      'rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors',
                      rowFilter === filter
                        ? 'border-brand bg-brand text-surface'
                        : 'border-line bg-surface text-muted hover:border-brand hover:text-content',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <PreviewTable rows={pageRows} enforceLengths={enforceLengths} existingSlugFor={matcher?.existingSlugFor} />

              {visibleRows.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No rows match this filter.</p>
              ) : null}

              {pageCount > 1 ? (
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="rounded-chip border border-line bg-surface px-3 py-1.5 font-semibold text-content hover:border-brand disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-muted">
                    Page {currentPage + 1} of {pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage >= pageCount - 1}
                    className="rounded-chip border border-line bg-surface px-3 py-1.5 font-semibold text-content hover:border-brand disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      {parsed && parsed.errors.length === 0 && rows.length > 0 ? (
        <section className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="text-base font-black text-content">3. Import</h2>
          <fieldset className="mt-3">
            <legend className="text-sm font-semibold text-content">If a compound with the same name already exists</legend>
            <div className="mt-2 space-y-2">
              <label className="flex items-start gap-2.5 text-sm text-content">
                <input
                  type="radio"
                  name="onExistingChoice"
                  checked={onExisting === 'skip'}
                  onChange={() => setOnExisting('skip')}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold">Skip it</span>
                  <span className="block text-xs text-muted">Existing compounds stay exactly as they are.</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-content">
                <input
                  type="radio"
                  name="onExistingChoice"
                  checked={onExisting === 'update'}
                  onChange={() => setOnExisting('update')}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold">Update it with the CSV values</span>
                  <span className="block text-xs text-muted">
                    Replaces its basic info, benefits, evidence, dosage and interactions with the row&rsquo;s contents.
                    Its FAQs, images and offers are kept.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {problemRows.length > 0 && readyRows.length > 0 ? (
            <p className="mt-4 rounded-chip border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-content">
              {plural(problemRows.length, 'row')} with errors will be skipped. Fix them in the spreadsheet and upload again
              to import them later.
            </p>
          ) : null}
          {readyRows.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-danger">Every row has errors, fix them before importing.</p>
          ) : null}
          {nothingNewToImport ? (
            <p className="mt-4 text-sm font-semibold text-content">
              Every valid row already exists. Choose &ldquo;Update it with the CSV values&rdquo; to overwrite them.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canImport}
            className="mt-5 rounded-chip bg-brand px-6 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:opacity-50"
          >
            {pending
              ? 'Importing…'
              : matcher && onExisting === 'skip'
                ? `Import ${plural(importCount, 'compound')}`
                : `Import ${plural(readyRows.length, 'valid compound')}`}
          </button>
        </section>
      ) : null}

      {showResult && (state.error || state.outcomes.length > 0) ? (
        <section aria-live="polite" className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
          <h2 className="text-base font-black text-content">Result</h2>

          {state.error ? (
            <p role="alert" className="mt-2 text-sm font-semibold text-danger">
              {state.error}
            </p>
          ) : null}

          {state.outcomes.length > 0 ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Created" value={counts.created} tone="ok" />
                <StatTile label="Updated" value={counts.updated} />
                <StatTile label="Skipped" value={counts.skipped} />
                <StatTile label="Failed" value={counts.failed} tone={counts.failed > 0 ? 'danger' : undefined} />
              </div>
              <p className="mt-3 text-sm font-semibold text-content">
                {plural(counts.created + counts.updated, 'compound')} imported successfully.
              </p>

              {failedOutcomes.length > 0 ? (
                <div className="mt-5">
                  <h3 className="text-sm font-black text-danger">Rows that failed</h3>
                  <ul className="mt-2 divide-y divide-line rounded-card border border-danger/30">
                    {failedOutcomes.map((outcome) => (
                      <li key={outcome.rowNumber} className="px-4 py-3 text-sm">
                        <p>
                          <span className="font-bold text-content">Row {outcome.rowNumber}</span>
                          <span className="text-muted"> · {outcome.name || 'no name'}</span>
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-danger">
                          {outcome.messages.map((message) => (
                            <li key={message}>{message}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-bold text-content">All rows</summary>
                <ul className="mt-3 divide-y divide-line rounded-card border border-line">
                  {state.outcomes.map((outcome) => (
                    <li key={outcome.rowNumber} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-pill px-2 py-0.5 text-micro font-bold uppercase',
                          STATUS_STYLES[outcome.status].className,
                        )}
                      >
                        {STATUS_STYLES[outcome.status].label}
                      </span>
                      <span className="font-bold text-content">{outcome.name || 'no name'}</span>
                      <span className="text-xs text-faint">row {outcome.rowNumber}</span>
                      {outcome.slug && outcome.status !== 'failed' ? (
                        <span className="ml-auto flex gap-3 text-xs font-semibold">
                          <Link href={`/admin/compounds/${outcome.slug}/edit`} className="text-brand hover:underline">
                            Edit
                          </Link>
                          <Link href={`/products/${outcome.slug}`} target="_blank" className="text-brand hover:underline">
                            View page
                          </Link>
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </details>
            </>
          ) : null}
        </section>
      ) : null}
    </form>
  );
}

function PreviewTable({
  rows,
  enforceLengths,
  existingSlugFor,
}: {
  rows: readonly ParsedCompoundRow[];
  enforceLengths: boolean;
  existingSlugFor: ((name: string) => string | undefined) | undefined;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-micro font-bold uppercase text-faint">
            <th scope="col" className="px-3 py-2">Row</th>
            <th scope="col" className="px-3 py-2">Name</th>
            <th scope="col" className="px-3 py-2">Category</th>
            <th scope="col" className="px-3 py-2">Benefits</th>
            <th scope="col" className="px-3 py-2">Evidence</th>
            <th scope="col" className="px-3 py-2">Interactions</th>
            <th scope="col" className="px-3 py-2">Match</th>
            <th scope="col" className="px-3 py-2">Validation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const research = row.input?.research;
            const problems = rowProblems(row, enforceLengths);
            const warnings = enforceLengths ? [] : row.lengthIssues;
            const exists = existingSlugFor && row.name ? existingSlugFor(row.name) !== undefined : null;
            const count = (value: number | undefined, slots: number) => (value === undefined ? 'N/A' : `${value}/${slots}`);
            return (
              <tr key={row.rowNumber} className="border-b border-line align-top last:border-0">
                <td className="px-3 py-2.5 text-muted">{row.rowNumber}</td>
                <td className="px-3 py-2.5 font-bold text-content">{row.name || <span className="text-faint">(blank)</span>}</td>
                <td className="px-3 py-2.5 text-muted">{row.input?.category ?? 'N/A'}</td>
                <td className="px-3 py-2.5">{count(research?.benefits.length, BENEFIT_SLOTS)}</td>
                <td className="px-3 py-2.5">{count(research?.evidence.length, EVIDENCE_SLOTS)}</td>
                <td className="px-3 py-2.5">{count(research?.interactions.length, INTERACTION_SLOTS)}</td>
                <td className="px-3 py-2.5 text-xs font-semibold">
                  {exists === null ? 'N/A' : exists ? <span className="text-info">Exists</span> : <span className="text-ok">New</span>}
                </td>
                <td className="px-3 py-2.5">
                  {problems.length === 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-ok">Ready</span>
                  ) : (
                    <ul className="space-y-0.5 text-xs text-danger">
                      {problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  )}
                  {warnings.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-xs text-warn">
                      {warnings.map((warning) => (
                        <li key={warning}>Warning: {warning}</li>
                      ))}
                    </ul>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
