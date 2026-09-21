'use client';

import { useActionState, useMemo, useState } from 'react';
import { CloseIcon } from '@/components/icons/icons';
import { bulkImportVendorsAction, type BulkVendorImportState } from '@/app/admin/(dashboard)/vendors/actions';
import {
  inferFieldMapping,
  parseCsvText,
  vendorCsvTemplate,
  vendorImportFields,
  type VendorImportField,
} from '@/lib/vendor-import';

const initialState: BulkVendorImportState = { error: null, success: null, imported: 0 };

export function BulkVendorImport() {
  const [rawState, formAction, pending] = useActionState(bulkImportVendorsAction, initialState);
  // An unresolvable Server Action (a tab open across a deploy, or a dev
  // rebuild that reassigned action ids) resolves to undefined instead of a
  // state object; falling back keeps the form usable instead of crashing.
  const state = rawState ?? initialState;
  const [csvText, setCsvText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [mapping, setMapping] = useState<Partial<Record<VendorImportField, string>>>({});
  const [open, setOpen] = useState(false);

  const previewColumns = useMemo(() => {
    if (!csvText.trim()) return [] as string[];
    const rows = parseCsvText(csvText);
    return rows[0] ?? [];
  }, [csvText]);

  const inferredMapping = useMemo(() => {
    if (!previewColumns.length) return {} as Partial<Record<VendorImportField, string>>;
    return inferFieldMapping(previewColumns);
  }, [previewColumns]);

  const effectiveMapping = useMemo(() => ({ ...inferredMapping, ...mapping }), [inferredMapping, mapping]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const text = await file.text();
    setCsvText(text);
    setMapping({});
  };

  const updateMapping = (field: VendorImportField, value: string) => {
    setMapping((current) => ({ ...current, [field]: value }));
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([vendorCsvTemplate()], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendors-template.csv';
    link.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-chip bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-strong"
      >
        Choose CSV file
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-card border border-line bg-surface-raised p-5 shadow-lift sm:p-6">
            <button
              type="button"
              aria-label="Close import modal"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-chip p-2 text-muted transition-colors hover:bg-surface-sunken hover:text-content"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <form action={formAction} className="space-y-5">
              <div className="rounded-card border border-dashed border-line bg-surface p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-sm text-content">
                  <span className="rounded-chip bg-brand px-4 py-2 font-bold text-white">Choose CSV file</span>
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
                  <span className="text-xs text-muted">{selectedFileName || 'No file selected yet'}</span>
                </label>
                <div className="mt-3 flex flex-col items-center gap-1 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="rounded-chip border border-line bg-surface px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
                  >
                    Download vendors CSV template
                  </button>
                  <span className="text-xs text-muted">
                    Every column in place, with one example row. Vendor name and affiliate link are required.
                  </span>
                </div>
              </div>

              {previewColumns.length > 0 && (
                <div className="rounded-card border border-line bg-surface p-4">
                  <p className="mb-3 text-sm font-bold text-content">Match columns</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {vendorImportFields.map(({ key, label }) => (
                      <label key={key} className="space-y-1 text-sm text-content">
                        <span className="font-medium">{label}</span>
                        <select
                          value={effectiveMapping[key as VendorImportField] ?? ''}
                          onChange={(event) => updateMapping(key as VendorImportField, event.target.value)}
                          className="w-full rounded-chip border border-line bg-surface px-3 py-2 outline-none"
                        >
                          <option value="">Not mapped</option>
                          {previewColumns.map((column) => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  <input type="hidden" name="columnMapping" value={JSON.stringify(effectiveMapping)} />
                </div>
              )}

              {state.error ? <p className="text-sm font-semibold text-danger">{state.error}</p> : null}
              {state.success ? <p className="text-sm font-semibold text-ok">{state.success}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content hover:border-brand hover:text-brand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || !csvText.trim()}
                  className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {pending ? 'Importing…' : 'Choose CSV file'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
