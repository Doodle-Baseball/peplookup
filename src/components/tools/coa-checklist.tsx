'use client';

import { useMemo, useState } from 'react';
import { CheckIcon, WarningIcon } from '@/components/icons/icons';

const RED_FLAGS = [
  'No lot or batch number anywhere on the document',
  'No analytical method named for any of the results',
  'No chromatogram or MS spectrum included, just typed numbers',
  'A bare purity percentage with nothing backing it up',
  'The same exact COA reused across different products or batches',
  "Dates that don't line up with when the product was actually listed",
  'PDF metadata stripped, removing the lab and analyst info',
  'No testing laboratory or analyst named anywhere on it',
];

const GREEN_FLAGS = [
  'Tested by an independent third-party lab, not just in-house QA',
  'Lot number on the COA matches the vial label exactly',
  'A named method (HPLC-UV, LC-MS, etc.) with real parameters given',
  'An actual chromatogram or MS spectrum included, not just a summary number',
  'Heavy metals reported below ICH Q3D limits',
  'Endotoxin / LAL testing is included',
  'Analyst sign-off and QA review, both with real names attached',
  'Report is dated within roughly the last 12 months',
];

type Tone = 'good' | 'mixed' | 'bad';
type Verdict = { label: string; tone: Tone; message: string };

function verdictFor(greenCount: number, redCount: number): Verdict {
  if (greenCount === 0 && redCount === 0) {
    return {
      label: 'Not started',
      tone: 'mixed',
      message: 'Tick off what your COA actually shows, on both lists, to get a verdict.',
    };
  }
  if (redCount >= 3) {
    return {
      label: 'Needs review',
      tone: 'bad',
      message:
        'Several red flags are present. Treat this COA with real skepticism and ask the seller directly for the missing pieces before trusting it.',
    };
  }
  if (redCount === 0 && greenCount >= 5) {
    return {
      label: 'Looks legit',
      tone: 'good',
      message: 'A strong set of green flags with no red flags checked. This COA passes a basic sanity check.',
    };
  }
  return {
    label: 'Mixed signals',
    tone: 'mixed',
    message: 'A mix of good and concerning signs. Worth double-checking the specific gaps before you rely on this document.',
  };
}

// Green flags and a passing verdict use --accent (forest green) rather than
// --brand, which is near-black: a "green flag" that fills in black reads wrong.
const VERDICT_CARD: Record<Tone, string> = {
  good: 'border-accent/30 bg-accent-tint',
  mixed: 'border-promo/30 bg-promo-tint',
  bad: 'border-danger/30 bg-danger/10',
};
const VERDICT_BADGE: Record<Tone, string> = {
  good: 'bg-accent text-white',
  mixed: 'bg-promo text-white',
  bad: 'bg-danger text-white',
};
const VERDICT_TEXT: Record<Tone, string> = {
  good: 'text-accent-strong',
  mixed: 'text-promo',
  bad: 'text-danger',
};

function ProgressBar({ value, max, tone }: { value: number; max: number; tone: 'green' | 'red' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface">
      <div
        className={`h-full rounded-pill transition-all duration-150 ${tone === 'green' ? 'bg-accent' : 'bg-danger'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function FlagList({
  title,
  icon,
  items,
  checked,
  onToggle,
  onClear,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  checked: Set<number>;
  onToggle: (i: number) => void;
  onClear: () => void;
  tone: 'green' | 'red';
}) {
  const isGreen = tone === 'green';

  return (
    <div className={`rounded-card border p-4 ${isGreen ? 'border-accent/30 bg-accent-tint' : 'border-danger/30 bg-danger/5'}`}>
      <div className="flex items-center justify-between gap-3">
        <p
          className={`flex items-center gap-2 text-sm font-black uppercase tracking-wide ${
            isGreen ? 'text-accent-strong' : 'text-danger'
          }`}
        >
          {icon}
          {title}
        </p>
        {checked.size > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className={`rounded-pill px-2 py-0.5 text-micro font-bold uppercase transition-colors ${
              isGreen ? 'text-accent-strong hover:bg-accent-soft' : 'text-danger hover:bg-danger/10'
            }`}
          >
            Reset
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted">
        Each {isGreen ? 'green' : 'red'} flag = {isGreen ? 'trust' : 'risk'}.
      </p>

      <div className="mt-3 flex items-center gap-2.5">
        <ProgressBar value={checked.size} max={items.length} tone={tone} />
        <span className="shrink-0 text-xs font-bold text-muted">
          {checked.size}/{items.length}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {items.map((item, i) => {
          const active = checked.has(i);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onToggle(i)}
                aria-pressed={active}
                className={`flex w-full items-start gap-2.5 rounded-chip border px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? isGreen
                      ? 'border-accent bg-accent text-white'
                      : 'border-danger bg-danger text-white'
                    : 'border-transparent bg-surface-raised text-content hover:border-line'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    active ? 'border-white/60 bg-white/15' : 'border-line'
                  }`}
                >
                  {active ? <CheckIcon className="h-3 w-3" /> : null}
                </span>
                <span className={active ? 'font-semibold' : ''}>{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CoaChecklist() {
  const [greenChecked, setGreenChecked] = useState<Set<number>>(new Set());
  const [redChecked, setRedChecked] = useState<Set<number>>(new Set());

  const toggleGreen = (i: number) =>
    setGreenChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  const toggleRed = (i: number) =>
    setRedChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const verdict = useMemo(() => verdictFor(greenChecked.size, redChecked.size), [greenChecked, redChecked]);

  return (
    <div>
      <p className="text-sm text-muted">
        Open the COA you&rsquo;re checking and tap what it actually shows on both lists below. This runs entirely
        in your browser: nothing you tick is sent anywhere.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FlagList
          title="Red flags"
          icon={<WarningIcon className="h-4 w-4" />}
          items={RED_FLAGS}
          checked={redChecked}
          onToggle={toggleRed}
          onClear={() => setRedChecked(new Set())}
          tone="red"
        />
        <FlagList
          title="Green flags"
          icon={<CheckIcon className="h-4 w-4" />}
          items={GREEN_FLAGS}
          checked={greenChecked}
          onToggle={toggleGreen}
          onClear={() => setGreenChecked(new Set())}
          tone="green"
        />
      </div>

      <div className={`mt-4 flex items-center gap-4 rounded-card border p-5 ${VERDICT_CARD[verdict.tone]}`}>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${VERDICT_BADGE[verdict.tone]}`}>
          {verdict.tone === 'bad' ? (
            <WarningIcon className="h-6 w-6" />
          ) : (
            <CheckIcon className="h-6 w-6" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={`text-lg font-black ${VERDICT_TEXT[verdict.tone]}`}>{verdict.label}</p>
            <p className={`text-xs font-bold uppercase tracking-wide ${VERDICT_TEXT[verdict.tone]}`}>
              {greenChecked.size} green · {redChecked.size} red
            </p>
          </div>
          <p className="mt-1 text-sm text-content">{verdict.message}</p>
        </div>
      </div>
    </div>
  );
}
