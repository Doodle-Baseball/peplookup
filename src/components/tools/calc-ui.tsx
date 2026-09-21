'use client';

/** Shared building blocks for every calculator under /tools, kept in one
 * place so they look and behave identically across pages. */

export function parsePositive(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * How many whole doses/sprays a quantity yields. Binary floating point makes
 * chained mg→mcg→mL math land a hair under the true integer (10000 / 333.333…
 * comes out as 29.999999999999996), so a plain `Math.floor` reports one dose
 * fewer than the vial actually holds. The relative epsilon absorbs that drift
 * without swallowing a genuine remainder.
 */
export function wholeCount(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value + Math.abs(value) * 1e-9);
}

export function CalcField({
  label,
  icon,
  value,
  onChange,
  prefix,
  suffix,
  step = 'any',
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-faint">{label}</label>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-chip border border-line bg-surface px-3.5 py-3 shadow-sm transition-shadow focus-within:shadow-lift">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted">
          {prefix ? <span className="text-base font-bold text-faint">{prefix}</span> : icon}
        </span>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-base font-bold text-content outline-none placeholder:text-faint [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix ? <span className="shrink-0 text-sm font-bold text-faint">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function PresetChips({
  values,
  suffix,
  active,
  onPick,
}: {
  values: number[];
  suffix: string;
  active: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(String(v))}
          className={`rounded-pill border px-3 py-1 text-xs font-bold transition-colors ${
            Number(active) === v
              ? 'border-brand bg-brand text-white'
              : 'border-line bg-surface text-content hover:border-brand hover:text-brand'
          }`}
        >
          {v} {suffix}
        </button>
      ))}
    </div>
  );
}

export function CalcResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wide text-faint">{label}</span>
      <span className={`text-base font-black ${accent ? 'text-brand-strong' : 'text-content'}`}>{value}</span>
    </div>
  );
}

/** A row of tab-style buttons for switching a calculator's mode (e.g. Find Units / Find Dose). */
export function ModeTabs<T extends string>({
  modes,
  active,
  onChange,
}: {
  modes: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-chip border border-line bg-surface p-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`rounded-chip px-3.5 py-1.5 text-sm font-bold transition-colors ${
            active === mode.value ? 'bg-brand text-white' : 'text-muted hover:bg-brand hover:text-white'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
