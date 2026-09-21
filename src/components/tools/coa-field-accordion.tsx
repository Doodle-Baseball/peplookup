'use client';

import { useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '@/components/icons/icons';

export interface CoaField {
  icon: React.ReactNode;
  accent: 'brand' | 'info' | 'coupon' | 'lab' | 'promo' | 'danger';
  title: string;
  subtitle: string;
  bullets: string[];
}

const ACCENT_CLASSES: Record<CoaField['accent'], { icon: string; check: string }> = {
  brand: { icon: 'bg-brand-soft text-brand-strong', check: 'text-brand' },
  info: { icon: 'bg-info/10 text-info', check: 'text-info' },
  coupon: { icon: 'bg-coupon-tint text-coupon-ink', check: 'text-coupon-ink' },
  lab: { icon: 'bg-lab-soft text-lab-ink', check: 'text-lab-ink' },
  promo: { icon: 'bg-promo-tint text-promo', check: 'text-promo' },
  danger: { icon: 'bg-danger/10 text-danger', check: 'text-danger' },
};

function FieldRow({ field }: { field: CoaField }) {
  const [open, setOpen] = useState(false);
  const accent = ACCENT_CLASSES[field.accent];

  return (
    <div
      className={`overflow-hidden rounded-card border bg-surface-raised shadow-card transition-colors ${
        open ? 'border-brand/30' : 'border-line'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-sunken"
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-chip ${accent.icon}`}>
          {field.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-black text-content">{field.title}</span>
          <span className="block truncate text-sm text-muted">{field.subtitle}</span>
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-chip transition-colors ${
            open ? 'bg-brand text-white' : 'bg-surface-sunken text-muted'
          }`}
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open ? (
        <div className="border-t border-line px-5 pb-5 pt-4">
          <ul className="space-y-2.5">
            {field.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm text-content">
                <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${accent.check}`} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function CoaFieldAccordion({ fields }: { fields: CoaField[] }) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <FieldRow key={field.title} field={field} />
      ))}
    </div>
  );
}
