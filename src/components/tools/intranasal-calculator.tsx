'use client';

import { useId, useState } from 'react';
import { DropletIcon, InfoIcon, SprayBottleIcon, VialIcon } from '@/components/icons/icons';
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
  SPRAY_RATES,
  solveIntranasal,
  type IntranasalPreset,
} from '@/components/tools/intranasal-math';
import { cn } from '@/lib/cn';

const BAC_PRESETS = [3, 5, 10, 15];
const DEFAULT_PRESET = INTRANASAL_PRESETS[0];

const TIPS = [
  'Tilt your head slightly forward, not back. Insert the tip just inside the nostril and angle it toward the outer wall, away from the septum. Press the pump smoothly while gently inhaling.',
  'Avoid blowing your nose for 5+ minutes after administration to let the peptide absorb through the mucosa.',
  'For most research protocols, the morning dose is preferred to align with natural cortisol and BDNF rhythms.',
];

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
  const [spraysPerDose, setSpraysPerDose] = useState('2');
  const [spraysPerMl, setSpraysPerMl] = useState<number>(20);
  const [vialPrice, setVialPrice] = useState('45');
  const rateLabelId = useId();

  function selectPreset(next: IntranasalPreset) {
    setPreset(next);
    setVialMg(String(next.vialMg));
    setBacWaterMl(String(next.bacWaterMl));
  }

  const vialPriceCents = Math.round(parsePositive(vialPrice) * 100);
  const doseSprays = parsePositive(spraysPerDose);
  const result = solveIntranasal({
    vialMg: parsePositive(vialMg),
    bacWaterMl: parsePositive(bacWaterMl),
    bottleMl: parsePositive(bottleMl),
    spraysPerDose: doseSprays,
    spraysPerMl,
    vialPriceCents: vialPriceCents > 0 ? vialPriceCents : null,
  });

  return (
    <div>
      <div role="group" aria-label="Peptide" className="flex flex-wrap justify-center gap-2">
        {INTRANASAL_PRESETS.map((option) => {
          const isActive = option.id === preset.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectPreset(option)}
              className={cn(
                'rounded-pill border px-4 py-2 text-sm font-bold transition-colors',
                FOCUS_RING,
                isActive
                  ? 'border-accent bg-accent text-surface-raised shadow-card'
                  : 'border-line bg-surface-raised text-content hover:border-accent hover:text-accent',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
            <CardHeading
              icon={<VialIcon className="h-5 w-5" />}
              iconClassName="bg-cat-2/15 text-cat-2"
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
              iconClassName="bg-cat-5/15 text-cat-5"
              title="Spray Bottle"
              subtitle="Volume, spray rate, and dose"
            />

            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <NumberField label="Bottle volume (mL)" value={bottleMl} onChange={setBottleMl} />
              <NumberField label="Dose (sprays)" value={spraysPerDose} onChange={setSpraysPerDose} />
            </div>

            <div className="mt-6">
              <p id={rateLabelId} className="text-micro font-bold uppercase text-faint">
                Sprays per mL
              </p>
              <div role="group" aria-labelledby={rateLabelId} className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {SPRAY_RATES.map((rate) => (
                  <OptionCard
                    key={rate.spraysPerMl}
                    title={`${rate.spraysPerMl} sprays / mL`}
                    detail={rate.label}
                    isActive={rate.spraysPerMl === spraysPerMl}
                    onSelect={() => setSpraysPerMl(rate.spraysPerMl)}
                  />
                ))}
              </div>
              <p className="mt-2.5 text-xs text-muted">
                Check your spray bottle: most standard 10 mL nasal sprayers deliver about 0.05 mL per spray.
              </p>
            </div>

            <div className="mt-7 border-t border-line pt-6">
              <NumberField label="Vial price (optional)" prefix="$" value={vialPrice} onChange={setVialPrice} />
            </div>
          </section>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div aria-live="polite" className="space-y-5">
            <div className="relative overflow-hidden rounded-card border border-accent/25 bg-accent-tint p-7 shadow-card">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/15 blur-3xl"
              />
              <p className="relative text-micro font-bold uppercase text-accent-strong">mcg per spray</p>
              <p className="relative mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-5xl font-black tracking-tight text-content">
                  {display(result?.mcgPerSpray, (value) => formatNumber(value, value >= 10 ? 0 : 1))}
                </span>
                <span className="text-sm font-bold text-muted">mcg</span>
              </p>
              <p className="relative mt-1 text-xs text-muted">
                {result && result.mcgPerDose !== null
                  ? `${formatNumber(result.mcgPerDose, 1)} mcg per ${formatNumber(doseSprays, 1)}-spray dose`
                  : 'Fill in the vial, BAC water and dose to calculate.'}
              </p>
            </div>

            <div className="rounded-card border border-line bg-surface-raised px-7 py-1 shadow-card">
              <ResultRow label="Sprays per bottle" value={display(result?.spraysPerBottle, String)} />
              <ResultRow label="Doses per bottle" value={display(result?.dosesPerBottle, String)} />
              <ResultRow label="Cost per spray" value={display(result?.costPerSprayCents, (cents) => formatUsd(cents, 4))} />
              <ResultRow
                label="Cost per dose"
                value={display(result?.costPerDoseCents, (cents) => formatUsd(cents, 3))}
                emphasis
              />
            </div>
          </div>

          <section className="rounded-card border border-line bg-surface-raised p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-micro font-bold uppercase text-content">
              <InfoIcon className="h-4 w-4 text-accent" />
              Intranasal tips
            </h2>
            <ul className="mt-4 space-y-3">
              {TIPS.map((tip) => (
                <li key={tip} className="text-sm text-muted">
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
