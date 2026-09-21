'use client';

import { useId, type ReactNode } from 'react';
import { WarningIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

/* Form and result pieces shared by the card-style calculators under /tools
   (reconstitution, intranasal), so both pages look and behave the same. */

/** Shown in place of a result until the inputs it needs are filled in. */
export const EMPTY_RESULT = '-';

export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

export function formatNumber(value: number, maxFractionDigits: number, minFractionDigits = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  });
}

export function CardHeading({
  icon,
  iconClassName,
  title,
  subtitle,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-chip', iconClassName)}>{icon}</span>
      <div>
        <h2 className="text-lg font-black leading-tight text-content">{title}</h2>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  icon,
  prefix,
  presets,
  unit,
  hint,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  prefix?: string;
  presets?: number[];
  unit?: string;
  hint?: string;
  readOnly?: boolean;
}) {
  const inputId = useId();
  const hintId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="block text-micro font-bold uppercase text-faint">
        {label}
      </label>
      <div
        className={cn(
          'mt-2 flex items-center gap-3 rounded-chip border border-line px-4 py-3.5 transition-colors',
          readOnly
            ? 'bg-surface-sunken'
            : 'bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25',
        )}
      >
        {icon ? <span className="flex shrink-0 text-muted">{icon}</span> : null}
        {prefix ? <span className="shrink-0 text-base font-bold text-faint">{prefix}</span> : null}
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          value={value}
          readOnly={readOnly}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'w-full min-w-0 bg-transparent text-base font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            readOnly ? 'cursor-not-allowed text-muted' : 'text-content',
          )}
        />
      </div>
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {presets && unit && !readOnly ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isActive = value !== '' && Number(value) === preset;
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(String(preset))}
                className={cn(
                  'rounded-pill border px-3 py-1 text-xs font-bold transition-colors',
                  FOCUS_RING,
                  isActive
                    ? 'border-accent bg-accent text-surface-raised'
                    : 'border-line bg-surface-raised text-muted hover:border-accent hover:text-accent',
                )}
              >
                {`${preset} ${unit}`}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** A selectable card with a bold title and a one-line detail, e.g. a syringe size or spray rate. */
export function OptionCard({
  title,
  detail,
  isActive,
  onSelect,
}: {
  title: string;
  detail: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={cn(
        'rounded-chip border px-4 py-3 text-left transition-colors',
        FOCUS_RING,
        isActive ? 'border-accent bg-accent-tint' : 'border-line bg-surface hover:border-accent/50',
      )}
    >
      <span className={cn('block text-sm font-black', isActive ? 'text-accent-strong' : 'text-content')}>{title}</span>
      <span className="mt-0.5 block text-xs text-muted">{detail}</span>
    </button>
  );
}

export function ResultRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-5 last:border-0">
      <span className="text-micro font-bold uppercase text-muted">{label}</span>
      <span className={cn('text-right font-black tracking-tight', emphasis ? 'text-2xl text-accent' : 'text-lg text-content')}>
        {value}
      </span>
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-chip border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-bold text-danger">
      <WarningIcon className="mt-px h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
