'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, SearchIcon } from '@/components/icons/icons';

export interface VendorOption {
  slug: string;
  name: string;
}

/**
 * Searchable vendor picker for the compound form. Renders a hidden input
 * (`name`) carrying the selected slug, the form submits it like any other
 * field, plus a text field that filters the open dropdown by name.
 */
export function VendorSelect({
  label,
  name,
  vendors,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  vendors: VendorOption[];
  defaultValue?: string | null;
  hint?: string;
}) {
  const initial = vendors.find((v) => v.slug === defaultValue) ?? null;
  const [selected, setSelected] = useState<VendorOption | null>(initial);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => v.name.toLowerCase().includes(q));
  }, [vendors, query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={`${name}-search`} className="block text-sm font-semibold text-content">
        {label}
      </label>
      <input type="hidden" name={name} value={selected?.slug ?? ''} />
      <button
        type="button"
        id={`${name}-search`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-chip border border-line bg-surface px-3.5 py-2.5 text-left text-sm text-content outline-none transition-colors hover:border-brand/50 focus:border-brand"
      >
        <span className={selected ? 'text-content' : 'text-faint'}>
          {selected ? selected.name : vendors.length === 0 ? 'No vendors yet' : 'Select a vendor…'}
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-faint" />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-card border border-line bg-surface-raised shadow-lift">
          <div className="search-field flex items-center gap-2 border-b border-line px-3 py-2">
            <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vendors…"
              autoFocus
              className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto p-1.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full rounded-chip px-3 py-2 text-left text-sm font-semibold text-muted transition-colors hover:bg-brand-soft hover:text-brand-strong"
              >
                None
              </button>
            </li>
            {filtered.map((vendor) => (
              <li key={vendor.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={vendor.slug === selected?.slug}
                  onClick={() => {
                    setSelected(vendor);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`w-full rounded-chip px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-brand-soft hover:text-brand-strong ${
                    vendor.slug === selected?.slug ? 'bg-brand-soft text-brand-strong' : 'text-content'
                  }`}
                >
                  {vendor.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-faint">No vendors match &ldquo;{query}&rdquo;.</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
