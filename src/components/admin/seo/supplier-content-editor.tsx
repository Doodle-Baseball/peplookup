'use client';

import { useState, useTransition } from 'react';
import { saveSupplierContentAction } from '@/app/admin/(dashboard)/seo/actions';
import {
  SUPPLIER_CONTENT_KEYS,
  SUPPLIER_CONTENT_LABEL,
  SUPPLIER_CONTENT_WORD_TARGET,
  resolveSupplierContent,
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
 * Fields open pre-filled with what the page shows today. Text left identical
 * to the generated version is saved as "use generated", so it keeps tracking
 * the vendor's live catalogue instead of freezing today's numbers.
 */
export function SupplierContentEditor({
  slug,
  saved,
  defaults,
}: {
  slug: string;
  saved: SupplierContentOverride | null;
  defaults: SupplierContent;
}) {
  const [drafts, setDrafts] = useState<SupplierContent>(() => resolveSupplierContent(defaults, saved));
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  function update(key: SupplierContentKey, field: 'title' | 'body', value: string) {
    setDrafts((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
    setMessage(null);
  }

  function restoreGenerated() {
    setDrafts(defaults);
    setMessage(null);
  }

  function save() {
    setMessage(null);
    const overrideOf = (key: SupplierContentKey, field: 'title' | 'body'): string | null => {
      const value = drafts[key][field].trim();
      return value === '' || value === defaults[key][field].trim() ? null : value;
    };
    startSaving(async () => {
      const result = await saveSupplierContentAction({
        slug,
        content: {
          about: { title: overrideOf('about', 'title'), body: overrideOf('about', 'body') },
          why: { title: overrideOf('why', 'title'), body: overrideOf('why', 'body') },
          compare: { title: overrideOf('compare', 'title'), body: overrideOf('compare', 'body') },
        },
      });
      setMessage(
        result.error
          ? { tone: 'error', text: result.error }
          : { tone: 'ok', text: 'Sections saved. The supplier page is updated.' },
      );
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        {saved
          ? 'This page is showing your saved text. Clear a field to go back to the generated version.'
          : "This page is showing text generated from the vendor's own data. Edit any field to replace it."}
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
              value={drafts[key].body}
              onChange={(event) => update(key, 'body', event.target.value)}
              rows={key === 'about' ? 7 : 5}
              placeholder={defaults[key].body}
              className={inputClass}
            />
          </div>
        </fieldset>
      ))}

      {message ? (
        <p
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={cn('text-xs font-semibold', message.tone === 'error' ? 'text-danger' : 'text-ok')}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={restoreGenerated}
          className="rounded-chip border border-line px-3 py-1.5 text-xs font-bold text-content transition-colors hover:border-brand"
        >
          Restore generated text
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-chip bg-brand px-4 py-1.5 text-xs font-bold text-white transition-opacity disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save sections'}
        </button>
      </div>
    </div>
  );
}
