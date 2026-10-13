'use client';

import { useId, useState, type ReactNode } from 'react';
import { DropletIcon, SyringeIcon, TargetIcon, VialIcon } from '@/components/icons/icons';
import { parsePositive } from '@/components/tools/calc-ui';
import {
  CardHeading,
  EMPTY_RESULT,
  FOCUS_RING,
  Notice,
  NumberField,
  OptionCard,
  ResultRow,
  formatNumber,
} from '@/components/tools/calc-fields';
import {
  SYRINGES,
  SYRINGE_SIZES,
  solveReconstitution,
  type ReconstitutionMode,
  type SyringeSize,
} from '@/components/tools/reconstitution-math';
import { cn } from '@/lib/cn';

const VIAL_PRESETS = [2, 5, 10, 15, 20, 30, 50];
const BAC_PRESETS = [1, 2, 3, 5];
const AMOUNT_PRESETS = [100, 250, 500, 1000];
const UNITS_PRESETS = [5, 10, 20, 25, 50];

interface ModeOption {
  value: ReconstitutionMode;
  title: string;
  subtitle: string;
  icon: ReactNode;
}

const MODES: readonly [ModeOption, ...ModeOption[]] = [
  { value: 'units', title: 'Find Units', subtitle: 'From amount → syringe units', icon: <SyringeIcon className="h-5 w-5" /> },
  { value: 'amount', title: 'Find Amount', subtitle: 'From syringe units → mcg', icon: <TargetIcon className="h-5 w-5" /> },
  { value: 'bac', title: 'Find BAC Water', subtitle: 'From vial & amount → mL', icon: <DropletIcon className="h-5 w-5" /> },
];

export function ReconstitutionCalculator() {
  const [mode, setMode] = useState<ReconstitutionMode>('units');
  const [vialMg, setVialMg] = useState('10');
  const [bacWaterMl, setBacWaterMl] = useState('2');
  const [amountMcg, setAmountMcg] = useState('500');
  const [units, setUnits] = useState('10');
  const [syringe, setSyringe] = useState<SyringeSize>('U-100');
  const syringeLabelId = useId();

  const activeMode = MODES.find((option) => option.value === mode) ?? MODES[0];
  const result = solveReconstitution(mode, {
    vialMg: parsePositive(vialMg),
    bacWaterMl: parsePositive(bacWaterMl),
    amountMcg: parsePositive(amountMcg),
    units: parsePositive(units),
  });
  const capacityUnits = SYRINGES[syringe].capacityUnits;

  return (
    <div>
      <div role="group" aria-label="Calculation mode" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODES.map((option) => (
          <ModeCard
            key={option.value}
            option={option}
            isActive={option.value === mode}
            onSelect={() => setMode(option.value)}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8 lg:col-span-3">
          <CardHeading
            icon={activeMode.icon}
            iconClassName="bg-accent-soft text-accent-strong"
            title={activeMode.title}
            subtitle={activeMode.subtitle}
          />

          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <NumberField
              label="Vial size (mg)"
              icon={<VialIcon className="h-4 w-4" />}
              value={vialMg}
              onChange={setVialMg}
              presets={VIAL_PRESETS}
              unit="mg"
            />
            {mode === 'bac' ? (
              <NumberField
                label="Target amount (mcg)"
                icon={<TargetIcon className="h-4 w-4" />}
                value={amountMcg}
                onChange={setAmountMcg}
                presets={AMOUNT_PRESETS}
                unit="mcg"
              />
            ) : (
              <NumberField
                label="BAC water (mL)"
                icon={<DropletIcon className="h-4 w-4" />}
                value={bacWaterMl}
                onChange={setBacWaterMl}
                presets={BAC_PRESETS}
                unit="mL"
              />
            )}
          </div>

          {mode !== 'bac' ? (
            <div className="mt-6">
              <NumberField
                label="Target amount (mcg)"
                icon={<TargetIcon className="h-4 w-4" />}
                value={amountMcg}
                onChange={setAmountMcg}
                presets={AMOUNT_PRESETS}
                unit="mcg"
              />
            </div>
          ) : null}

          {mode !== 'units' ? (
            <div className="mt-6">
              <NumberField
                label={mode === 'amount' ? 'Syringe units' : 'Target syringe units'}
                icon={<SyringeIcon className="h-4 w-4" />}
                value={units}
                onChange={setUnits}
                presets={mode === 'bac' ? UNITS_PRESETS : undefined}
                unit="units"
                hint={mode === 'bac' ? 'The syringe mark you want each draw to land on.' : undefined}
              />
            </div>
          ) : null}

          <div className="mt-8 border-t border-line pt-6">
            <p id={syringeLabelId} className="text-micro font-bold uppercase text-faint">
              Syringe size
            </p>
            <div role="group" aria-labelledby={syringeLabelId} className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {SYRINGE_SIZES.map((size) => (
                <OptionCard
                  key={size}
                  title={`${SYRINGES[size].volumeLabel} syringe`}
                  detail={describeSyringe(size)}
                  isActive={size === syringe}
                  onSelect={() => setSyringe(size)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div aria-live="polite" className="space-y-5">
            <div className="relative overflow-hidden rounded-card border border-accent/25 bg-accent-tint p-7 shadow-card">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/15 blur-3xl"
              />
              <p className="relative text-micro font-bold uppercase text-accent-strong">Concentration</p>
              <p className="relative mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-5xl font-black tracking-tight text-content">
                  {result ? formatNumber(result.concentrationMcgPerMl, 1) : EMPTY_RESULT}
                </span>
                <span className="text-sm font-bold text-muted">mcg / mL</span>
              </p>
              <p className="relative mt-1 text-xs text-muted">
                {result
                  ? `${formatNumber(result.concentrationMcgPerMl / 1000, 2, 2)} mg / mL`
                  : 'Fill in every field to calculate.'}
              </p>
            </div>

            <div className="rounded-card border border-line bg-surface-raised px-7 py-1 shadow-card">
              {mode === 'bac' ? (
                <ResultRow
                  label="BAC water to add"
                  value={result ? `${formatNumber(result.bacWaterMl, 2, 2)} mL` : EMPTY_RESULT}
                  emphasis
                />
              ) : null}
              {mode === 'amount' ? (
                <ResultRow
                  label="Actual amount"
                  value={result ? `${formatNumber(result.amountMcg, 1)} mcg` : EMPTY_RESULT}
                  emphasis
                />
              ) : null}
              <ResultRow label="Draw volume" value={result ? `${formatNumber(result.drawMl, 3, 3)} mL` : EMPTY_RESULT} />
              {mode === 'units' ? (
                <ResultRow
                  label="Syringe units (U-100)"
                  value={result ? `${formatNumber(result.units, 1, 1)} units` : EMPTY_RESULT}
                  emphasis
                />
              ) : null}
              <ResultRow label="Draws per vial" value={result ? String(result.drawsPerVial) : EMPTY_RESULT} />
            </div>

            {result && result.units > capacityUnits ? (
              <Notice>
                {`${formatNumber(result.units, 1)} units is more than a ${SYRINGES[syringe].volumeLabel} syringe holds (${capacityUnits} units). `}
                {mode === 'units' ? 'Pick a larger syringe or add more BAC water.' : 'Pick a larger syringe.'}
              </Notice>
            ) : null}
            {result && result.drawsPerVial === 0 ? <Notice>That amount is more than the whole vial contains.</Notice> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function describeSyringe(size: SyringeSize): string {
  const spec = SYRINGES[size];
  return `${spec.capacityUnits} units${spec.note ? ` (${spec.note})` : ''}`;
}

function ModeCard({ option, isActive, onSelect }: { option: ModeOption; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-card border px-4 py-4 text-left transition-colors sm:px-5 sm:py-5',
        FOCUS_RING,
        isActive ? 'border-accent bg-accent-tint shadow-card' : 'border-line bg-surface-raised hover:border-accent/50',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-chip',
          isActive ? 'bg-accent text-surface-raised' : 'border border-line bg-surface text-muted',
        )}
      >
        {option.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-content">{option.title}</span>
        <span className="block text-xs text-muted">{option.subtitle}</span>
      </span>
    </button>
  );
}
