import { wholeCount } from '@/components/tools/calc-ui';

/**
 * Every insulin syringe is graduated at 100 units per mL. "U-50" and "U-30" name
 * smaller barrels (0.5 mL / 0.3 mL) on that same scale, so the syringe choice
 * changes how many units fit, never how many units a given volume reads as.
 */
export const UNITS_PER_ML = 100;
const MCG_PER_MG = 1000;

export const SYRINGES = {
  'U-100': { capacityUnits: 100, volumeLabel: '1 mL', gauge: '29G', note: null },
  'U-50': { capacityUnits: 50, volumeLabel: '0.5 mL', gauge: '30G', note: null },
  'U-30': { capacityUnits: 30, volumeLabel: '0.3 mL', gauge: '31G', note: 'best for small doses' },
} as const;

export type SyringeSize = keyof typeof SYRINGES;
export const SYRINGE_SIZES: SyringeSize[] = ['U-100', 'U-50', 'U-30'];

/** Which variable is unknown: the same equation, solved for a different term. */
export type ReconstitutionMode = 'units' | 'dose' | 'bac';

export interface ReconstitutionInputs {
  vialMg: number;
  /** Used by Find Units and Find Dose. */
  bacWaterMl: number;
  /** Used by Find Units and Find BAC Water. */
  doseMcg: number;
  /** Units drawn (Find Dose) or the mark the dose should land on (Find BAC Water). */
  units: number;
}

export interface ReconstitutionResult {
  concentrationMcgPerMl: number;
  drawMl: number;
  units: number;
  doseMcg: number;
  bacWaterMl: number;
  /** Whole doses only, 0 means a single dose is more than the vial holds. */
  dosesPerVial: number;
}

/**
 * Solves vial mg, BAC water mL, dose mcg and syringe units for whichever one the
 * mode leaves unknown. Multiplications run before divisions so textbook inputs
 * land on exact results (18 units × 5,000 mcg ÷ 200 = 450, not 450.00000000000006).
 * Returns null until every input the mode needs is positive.
 */
export function solveReconstitution(
  mode: ReconstitutionMode,
  { vialMg, bacWaterMl, doseMcg, units }: ReconstitutionInputs,
): ReconstitutionResult | null {
  const vialMcg = vialMg * MCG_PER_MG;
  if (vialMcg <= 0) return null;

  if (mode === 'units') {
    if (bacWaterMl <= 0 || doseMcg <= 0) return null;
    return {
      concentrationMcgPerMl: vialMcg / bacWaterMl,
      drawMl: (doseMcg * bacWaterMl) / vialMcg,
      units: (doseMcg * bacWaterMl * UNITS_PER_ML) / vialMcg,
      doseMcg,
      bacWaterMl,
      dosesPerVial: dosesPerVial(vialMcg, doseMcg),
    };
  }

  if (mode === 'dose') {
    if (bacWaterMl <= 0 || units <= 0) return null;
    const deliveredMcg = (units * vialMcg) / (bacWaterMl * UNITS_PER_ML);
    return {
      concentrationMcgPerMl: vialMcg / bacWaterMl,
      drawMl: units / UNITS_PER_ML,
      units,
      doseMcg: deliveredMcg,
      bacWaterMl,
      dosesPerVial: dosesPerVial(vialMcg, deliveredMcg),
    };
  }

  if (doseMcg <= 0 || units <= 0) return null;
  return {
    concentrationMcgPerMl: (doseMcg * UNITS_PER_ML) / units,
    drawMl: units / UNITS_PER_ML,
    units,
    doseMcg,
    bacWaterMl: (vialMcg * units) / (doseMcg * UNITS_PER_ML),
    dosesPerVial: dosesPerVial(vialMcg, doseMcg),
  };
}

function dosesPerVial(vialMcg: number, doseMcg: number): number {
  return wholeCount(vialMcg / doseMcg) ?? 0;
}

/** Vials needed for a cycle at one dose per day; fractional so a half vial shows as ~0.5. */
export function vialsForCycle(cycleDays: number, dosesInVial: number): number | null {
  if (cycleDays <= 0 || dosesInVial <= 0) return null;
  return cycleDays / dosesInVial;
}
