'use client';

import { useState } from 'react';
import {
  SUPPLIER_CONTENT_KEYS,
  SUPPLIER_CONTENT_LABEL,
  SUPPLIER_CONTENT_WORD_TARGET,
  resolveSupplierContent,
  supplierContentFieldName,
  wordCount,
  type SupplierContent,
  type SupplierContentKey,
  type SupplierContentOverride,
} from '@/lib/supplier-content';
import { cn } from '@/lib/cn';

const inputClass =
  'mt-1 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors duration-150 placeholder:text-faint focus:border-brand';

function WordCounter({ text, target }: { text: string; target: { min: number; max: number } }) {
  const count = wordCount(text);
  const inRange = count >= target.min && count <= target.max;
  return (
    <span className={cn('text-xs font-semibold', inRange ? 'text-ok' : 'text-warn')}>
      {count} / {target.min}-{target.max} words
    </span>
  );
}

/**
 * Edit the About / Why researchers choose / vs other suppliers boxes on one
 * supplier page.
 *
 * The fields are named inputs of the dialog's own form, so the footer's "Save
 * changes" saves them along with the SEO fields. They used to have a separate
 * save button, and an edit followed by "Save changes" (or Enter in a title)
 * was silently thrown away when the dialog closed.
 */
export function SupplierContentEditor({
  saved,
  defaults,
}: {
  saved: SupplierContentOverride | null;
  defaults: SupplierContent;
}) {
  const [drafts, setDrafts] = useState<SupplierContent>(() => resolveSupplierContent(defaults, saved));

  function update(key: SupplierContentKey, field: 'title' | 'body', value: string) {
    setDrafts((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        {saved
          ? 'This page is showing your saved text. Clear a field, or restore the generated text, to go back to the version built from the vendor’s data.'
          : 'This page is showing text generated from the vendor’s own data. Edit any field to replace it.'}{' '}
        Saved with <span className="font-semibold text-content">Save changes</span> below.
      </p>

      {SUPPLIER_CONTENT_KEYS.map((key, index) => (
        <fieldset key={key} className="space-y-2 rounded-chip border border-line bg-surface p-3.5">
          <legend className="px-1 text-micro font-bold uppercase text-faint">
            {index + 1}. {SUPPLIER_CONTENT_LABEL[key]}
          </legend>
          <div>
            <label htmlFor={`supplier-${key}-title`} className="block text-xs font-semibold text-content">
              Title
            </label>
            <input
              id={`supplier-${key}-title`}
              name={supplierContentFieldName(key, 'title')}
              value={drafts[key].title}
              onChange={(event) => update(key, 'title', event.target.value)}
              placeholder={defaults[key].title}
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`supplier-${key}-body`} className="text-xs font-semibold text-content">
                Details
              </label>
              <WordCounter text={drafts[key].body} target={SUPPLIER_CONTENT_WORD_TARGET[key]} />
            </div>
            <textarea
              id={`supplier-${key}-body`}
              name={supplierContentFieldName(key, 'body')}
              value={drafts[key].body}
              onChange={(event) => update(key, 'body', event.target.value)}
              rows={key === 'about' ? 7 : 5}
              placeholder={defaults[key].body}
              className={inputClass}
            />
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setDrafts(defaults)}
        className="rounded-chip border border-line px-3 py-1.5 text-xs font-bold text-content transition-colors hover:border-brand"
      >
        Restore generated text
      </button>
    </div>
  );
}
