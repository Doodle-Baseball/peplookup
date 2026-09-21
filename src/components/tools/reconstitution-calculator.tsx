'use client';

import { useId, useState, type ReactNode } from 'react';
import { DropletIcon, RepeatIcon, SyringeIcon, TargetIcon, VialIcon } from '@/components/icons/icons';
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
  vialsForCycle,
  type ReconstitutionMode,
  type SyringeSize,
} from '@/components/tools/reconstitution-math';
import { cn } from '@/lib/cn';

const VIAL_PRESETS = [2, 5, 10, 15, 20, 30, 50];
const BAC_PRESETS = [1, 2, 3, 5];
const DOSE_PRESETS = [100, 250, 500, 1000];
const UNITS_PRESETS = [5, 10, 20, 25, 50];

interface ModeOption {
  value: ReconstitutionMode;
  title: string;
  subtitle: string;
  icon: ReactNode;
}

const MODES: readonly [ModeOption, ...ModeOption[]] = [
  { value: 'units', title: 'Find Units', subtitle: 'From dose → syringe units', icon: <SyringeIcon className="h-5 w-5" /> },
  { value: 'dose', title: 'Find Dose', subtitle: 'From syringe units → mcg', icon: <TargetIcon className="h-5 w-5" /> },
  { value: 'bac', title: 'Find BAC Water', subtitle: 'From vial & dose → mL', icon: <DropletIcon className="h-5 w-5" /> },
];

export function ReconstitutionCalculator() {
  const [mode, setMode] = useState<ReconstitutionMode>('units');
  const [vialMg, setVialMg] = useState('10');
  const [bacWaterMl, setBacWaterMl] = useState('2');
  const [doseMcg, setDoseMcg] = useState('500');
  const [units, setUnits] = useState('10');
  const [syringe, setSyringe] = useState<SyringeSize>('U-100');
  const [cycleDays, setCycleDays] = useState('30');
  const syringeLabelId = useId();

  const activeMode = MODES.find((option) => option.value === mode) ?? MODES[0];
  const result = solveReconstitution(mode, {
    vialMg: parsePositive(vialMg),
    bacWaterMl: parsePositive(bacWaterMl),
    doseMcg: parsePositive(doseMcg),
    units: parsePositive(units),
  });
  const capacityUnits = SYRINGES[syringe].capacityUnits;
  const days = parsePositive(cycleDays);

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
                label="Target dose (mcg)"
                icon={<TargetIcon className="h-4 w-4" />}
                value={doseMcg}
                onChange={setDoseMcg}
                presets={DOSE_PRESETS}
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
                label="Target dose (mcg)"
                icon={<TargetIcon className="h-4 w-4" />}
                value={doseMcg}
                onChange={setDoseMcg}
                presets={DOSE_PRESETS}
                unit="mcg"
              />
            </div>
          ) : null}

          {mode !== 'units' ? (
            <div className="mt-6">
              <NumberField
                label={mode === 'dose' ? 'Syringe units' : 'Target syringe units'}
                icon={<SyringeIcon className="h-4 w-4" />}
                value={units}
                onChange={setUnits}
                presets={mode === 'bac' ? UNITS_PRESETS : undefined}
                unit="units"
                hint={mode === 'bac' ? 'The syringe mark you want each dose to land on.' : undefined}
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
                  title={size}
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
              {mode === 'dose' ? (
                <ResultRow
                  label="Actual dose"
                  value={result ? `${formatNumber(result.doseMcg, 1)} mcg` : EMPTY_RESULT}
                  emphasis
                />
              ) : null}
              <ResultRow label="Draw volume" value={result ? `${formatNumber(result.drawMl, 3, 3)} mL` : EMPTY_RESULT} />
              {mode === 'units' ? (
                <ResultRow
                  label={`Syringe units (${syringe})`}
                  value={result ? `${formatNumber(result.units, 1, 1)} units` : EMPTY_RESULT}
                  emphasis
                />
              ) : null}
              <ResultRow label="Doses per vial" value={result ? String(result.dosesPerVial) : EMPTY_RESULT} />
            </div>

            {result && result.units > capacityUnits ? (
              <Notice>
                {`${formatNumber(result.units, 1)} units is more than a ${syringe} syringe holds (${capacityUnits} units). `}
                {mode === 'units' ? 'Pick a larger syringe or add more BAC water.' : 'Pick a larger syringe.'}
              </Notice>
            ) : null}
            {result && result.dosesPerVial === 0 ? <Notice>That dose is more than the whole vial contains.</Notice> : null}
          </div>

          <div className="rounded-card border border-line bg-surface-raised p-6 shadow-card">
            <p className="flex items-center gap-2 text-micro font-bold uppercase text-content">
              <RepeatIcon className="h-4 w-4 text-accent" />
              Cycle projection
            </p>
            <div className="mt-4">
              <NumberField label="Cycle length (days)" value={cycleDays} onChange={setCycleDays} />
            </div>
            <p className="mt-3 text-xs text-muted">{describeCycle(result?.dosesPerVial ?? 0, days)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function describeSyringe(size: SyringeSize): string {
  const spec = SYRINGES[size];
  return `${spec.volumeLabel} · ${spec.gauge}${spec.note ? ` (${spec.note})` : ''}`;
}

function describeCycle(dosesInVial: number, cycleDays: number): string {
  if (dosesInVial <= 0) return 'Enter a dose that fits in the vial to project a cycle.';
  const coverage = `Each vial covers ${dosesInVial} ${dosesInVial === 1 ? 'day' : 'days'} at 1 dose/day`;
  const vialsNeeded = vialsForCycle(cycleDays, dosesInVial);
  if (vialsNeeded === null) return `${coverage}.`;
  return `${coverage} (you'll need ~${formatNumber(vialsNeeded, 1)} ${vialsNeeded === 1 ? 'vial' : 'vials'} for a ${formatNumber(cycleDays, 1)}-day cycle).`;
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
