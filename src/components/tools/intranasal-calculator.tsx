'use client';

import { useId, useState } from 'react';
import { DropletIcon, SprayBottleIcon, VialIcon } from '@/components/icons/icons';
import { parsePositive } from '@/components/tools/calc-ui';
import {
  CardHeading,
  EMPTY_RESULT,
  FOCUS_RING,
  NumberField,
  OptionCard,
  ResultRow,
  formatNumber,
} from '@/components/tools/calc-fields';
import {
  INTRANASAL_PRESETS,
  PUMP_RATES,
  solveIntranasal,
  type IntranasalPreset,
} from '@/components/tools/intranasal-math';
import { cn } from '@/lib/cn';

const BAC_PRESETS = [3, 5, 10, 15];
const DEFAULT_PRESET = INTRANASAL_PRESETS[0];

function formatUsd(cents: number, fractionDigits: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function display(value: number | null | undefined, format: (value: number) => string): string {
  return value === null || value === undefined ? EMPTY_RESULT : format(value);
}

export function IntranasalCalculator() {
  const [preset, setPreset] = useState<IntranasalPreset>(DEFAULT_PRESET);
  const [vialMg, setVialMg] = useState(String(DEFAULT_PRESET.vialMg));
  const [bacWaterMl, setBacWaterMl] = useState(String(DEFAULT_PRESET.bacWaterMl));
  const [bottleMl, setBottleMl] = useState('10');
  const [actuationsPerMl, setActuationsPerMl] = useState<number>(20);
  const [vialPrice, setVialPrice] = useState('45');
  const rateLabelId = useId();

  function selectPreset(next: IntranasalPreset) {
    setPreset(next);
    setVialMg(String(next.vialMg));
    setBacWaterMl(String(next.bacWaterMl));
  }

  const vialPriceCents = Math.round(parsePositive(vialPrice) * 100);
  const result = solveIntranasal({
    vialMg: parsePositive(vialMg),
    bacWaterMl: parsePositive(bacWaterMl),
    bottleMl: parsePositive(bottleMl),
    actuationsPerMl,
    vialPriceCents: vialPriceCents > 0 ? vialPriceCents : null,
  });

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Peptide"
          className="grid w-full max-w-md grid-cols-3 gap-1 rounded-pill border border-line bg-surface-raised p-1.5 shadow-card"
        >
          {INTRANASAL_PRESETS.map((option) => {
            const isActive = option.id === preset.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectPreset(option)}
                className={cn(
                  'whitespace-nowrap rounded-pill px-2 py-2.5 text-xs font-bold transition-colors sm:px-5 sm:text-sm',
                  FOCUS_RING,
                  isActive
                    ? 'bg-accent text-surface-raised shadow-card'
                    : 'text-muted hover:bg-accent-tint hover:text-accent-strong',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
            <CardHeading
              icon={<VialIcon className="h-5 w-5" />}
              iconClassName="bg-accent-soft text-accent-strong"
              title="Reconstitution"
              subtitle="Vial content and BAC water volume"
            />

            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <NumberField
                label="Vial size (mg)"
                icon={<VialIcon className="h-4 w-4" />}
                value={vialMg}
                onChange={setVialMg}
                readOnly={!preset.isCustom}
                hint={preset.isCustom ? undefined : 'Set by the preset. Choose Custom to change it.'}
              />
              <NumberField
                label="BAC water (mL)"
                icon={<DropletIcon className="h-4 w-4" />}
                value={bacWaterMl}
                onChange={setBacWaterMl}
                presets={BAC_PRESETS}
                unit="mL"
              />
            </div>

            <div className="mt-6">
              <p className="text-micro font-bold uppercase text-faint">Concentration</p>
              <p
                aria-live="polite"
                className="mt-2 rounded-chip border border-accent/30 bg-accent-tint px-5 py-4 text-xl font-black text-accent"
              >
                {display(result?.concentrationMcgPerMl, (value) => `${formatNumber(value, 1)} mcg / mL`)}
              </p>
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
            <CardHeading
              icon={<SprayBottleIcon className="h-5 w-5" />}
              iconClassName="bg-accent-soft text-accent-strong"
              title="Spray Bottle"
              subtitle="Volume and pump rate"
            />

            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <NumberField label="Bottle volume (mL)" value={bottleMl} onChange={setBottleMl} />
            </div>

            <div className="mt-6">
              <p id={rateLabelId} className="text-micro font-bold uppercase text-faint">
                Actuations per mL
              </p>
              <div role="group" aria-labelledby={rateLabelId} className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {PUMP_RATES.map((rate) => (
                  <OptionCard
                    key={rate.actuationsPerMl}
                    title={`${rate.actuationsPerMl} per mL`}
                    detail={`(${rate.pumpVolumeLabel})`}
                    isActive={rate.actuationsPerMl === actuationsPerMl}
                    onSelect={() => setActuationsPerMl(rate.actuationsPerMl)}
                  />
                ))}
              </div>
              <p className="mt-2.5 text-xs text-muted">
                Check your pump: most standard 10 mL nasal pumps deliver about 0.05 mL per actuation.
              </p>
            </div>

            <div className="mt-7 border-t border-line pt-6">
              <NumberField label="Vial price (optional)" prefix="$" value={vialPrice} onChange={setVialPrice} />
            </div>
          </section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-28 lg:col-span-2 lg:self-start">
          <div aria-live="polite" className="space-y-5">
            <div className="relative overflow-hidden rounded-card border border-accent/25 bg-accent-tint p-7 shadow-card">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/15 blur-3xl"
              />
              <p className="relative text-micro font-bold uppercase text-accent-strong">mcg per actuation</p>
              <p className="relative mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-5xl font-black tracking-tight text-content">
                  {display(result?.mcgPerActuation, (value) => formatNumber(value, value >= 10 ? 0 : 1))}
                </span>
                <span className="text-sm font-bold text-muted">mcg</span>
              </p>
              {result ? null : (
                <p className="relative mt-1 text-xs text-muted">Fill in the vial and BAC water to calculate.</p>
              )}
            </div>

            <div className="rounded-card border border-line bg-surface-raised px-7 py-1 shadow-card">
              <ResultRow label="Actuations per bottle" value={display(result?.actuationsPerBottle, String)} />
              <ResultRow
                label="Cost per actuation"
                value={display(result?.costPerActuationCents, (cents) => formatUsd(cents, 4))}
                emphasis
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
