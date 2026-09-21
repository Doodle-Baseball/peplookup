'use client';

import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { CloseIcon } from '@/components/icons/icons';

export function TagListInput({
  label,
  name,
  defaultValue = [],
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: readonly string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>([...defaultValue]);
  const [draft, setDraft] = useState('');

  /** Adds every non-empty, not-already-present value from the list, in order. */
  function addValues(values: string[]) {
    setTags((current) => {
      const next = [...current];
      for (const raw of values) {
        const value = raw.trim();
        if (value && !next.includes(value)) next.push(value);
      }
      return next;
    });
  }

  function addTag() {
    addValues([draft]);
    setDraft('');
  }

  // Typing or pasting "bpc-157,tb-500,dsip" splits into separate keywords
  // immediately rather than becoming one literal comma-joined tag; the comma
  // itself is never kept as part of a value.
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!value.includes(',')) {
      setDraft(value);
      return;
    }
    const parts = value.split(',');
    // Whatever trails the last comma is still being typed, so it stays in
    // the input instead of being committed as a tag early.
    const trailing = parts.pop() ?? '';
    addValues(parts);
    setDraft(trailing);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div>
      <label htmlFor={`${name}-draft`} className="block text-sm font-semibold text-content">
        {label}
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`${name}-draft`}
          type="text"
          value={draft}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full flex-1 rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
        />
        <button
          type="button"
          onClick={addTag}
          className="shrink-0 rounded-chip border border-line px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
        >
          Add
        </button>
      </div>

      {tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-strong"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                aria-label={`Remove ${tag}`}
                className="rounded-pill hover:text-danger"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
              <input type="hidden" name={name} value={tag} />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
