import { wholeCount } from '@/components/tools/calc-ui';

const MCG_PER_MG = 1000;

export interface IntranasalPreset {
  id: string;
  label: string;
  vialMg: number;
  bacWaterMl: number;
  /** Named compounds fix the vial size; only Custom lets it be edited. */
  isCustom: boolean;
}

export const INTRANASAL_PRESETS: readonly [IntranasalPreset, ...IntranasalPreset[]] = [
  { id: 'semax', label: 'Semax 0.25%', vialMg: 30, bacWaterMl: 10, isCustom: false },
  { id: 'selank', label: 'Selank 0.05%', vialMg: 5, bacWaterMl: 10, isCustom: false },
  { id: 'custom', label: 'Custom', vialMg: 10, bacWaterMl: 10, isCustom: true },
];

/** Pump actuations per mL, labelled by the volume each actuation delivers. */
export const PUMP_RATES = [
  { actuationsPerMl: 10, pumpVolumeLabel: '0.1 mL pump' },
  { actuationsPerMl: 20, pumpVolumeLabel: '0.05 mL pump' },
  { actuationsPerMl: 50, pumpVolumeLabel: '0.02 mL pump' },
] as const;

export interface IntranasalInputs {
  vialMg: number;
  bacWaterMl: number;
  bottleMl: number;
  actuationsPerMl: number;
  /** Whole cents; null when no price was entered. */
  vialPriceCents: number | null;
}

export interface IntranasalResult {
  concentrationMcgPerMl: number;
  mcgPerActuation: number;
  actuationsPerBottle: number | null;
  /** Fractions of a cent are expected here, e.g. 22.5 cents per actuation. */
  costPerActuationCents: number | null;
}

/** Returns null until the vial, BAC water and pump rate are all positive. */
export function solveIntranasal({
  vialMg,
  bacWaterMl,
  bottleMl,
  actuationsPerMl,
  vialPriceCents,
}: IntranasalInputs): IntranasalResult | null {
  if (vialMg <= 0 || bacWaterMl <= 0 || actuationsPerMl <= 0) return null;

  const vialMcg = vialMg * MCG_PER_MG;

  // The bottle's own volume sets how many actuations it gives, and the vial
  // price is treated as the price of one bottle: $45 over the 10 actuations of
  // a 1 mL bottle at 10 per mL is $4.50 an actuation.
  const bottleActuations = bottleMl > 0 ? bottleMl * actuationsPerMl : 0;
  const costPerActuationCents =
    vialPriceCents !== null && vialPriceCents > 0 && bottleActuations > 0 ? vialPriceCents / bottleActuations : null;

  return {
    concentrationMcgPerMl: vialMcg / bacWaterMl,
    mcgPerActuation: vialMcg / (bacWaterMl * actuationsPerMl),
    actuationsPerBottle: wholeCount(bottleActuations),
    costPerActuationCents,
  };
}
