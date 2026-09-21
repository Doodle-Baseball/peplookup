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
  { id: 'pt-141', label: 'PT-141 (Bremelanotide)', vialMg: 10, bacWaterMl: 10, isCustom: false },
  { id: 'melanotan-ii', label: 'Melanotan II', vialMg: 10, bacWaterMl: 10, isCustom: false },
  { id: 'custom', label: 'Custom', vialMg: 10, bacWaterMl: 10, isCustom: true },
];

export const SPRAY_RATES = [
  { spraysPerMl: 10, label: 'fine mist' },
  { spraysPerMl: 20, label: 'standard' },
  { spraysPerMl: 50, label: 'micro-dose' },
] as const;

export interface IntranasalInputs {
  vialMg: number;
  bacWaterMl: number;
  bottleMl: number;
  spraysPerDose: number;
  spraysPerMl: number;
  /** Whole cents; null when no price was entered. */
  vialPriceCents: number | null;
}

export interface IntranasalResult {
  concentrationMcgPerMl: number;
  mcgPerSpray: number;
  mcgPerDose: number | null;
  spraysPerBottle: number | null;
  dosesPerBottle: number | null;
  /** Fractions of a cent are expected here, e.g. 22.5 cents per spray. */
  costPerSprayCents: number | null;
  costPerDoseCents: number | null;
}

/** Returns null until the vial, BAC water and spray rate are all positive. */
export function solveIntranasal({
  vialMg,
  bacWaterMl,
  bottleMl,
  spraysPerDose,
  spraysPerMl,
  vialPriceCents,
}: IntranasalInputs): IntranasalResult | null {
  if (vialMg <= 0 || bacWaterMl <= 0 || spraysPerMl <= 0) return null;

  const vialMcg = vialMg * MCG_PER_MG;
  const mcgPerSpray = vialMcg / (bacWaterMl * spraysPerMl);
  const hasDose = spraysPerDose > 0;

  // The bottle's own volume sets how many sprays it gives, and the vial price
  // is treated as the price of one bottle: $45 over the 10 sprays of a 1 mL
  // bottle at 10 sprays/mL is $4.50 a spray.
  const bottleSprays = bottleMl > 0 ? bottleMl * spraysPerMl : 0;
  const spraysPerBottle = wholeCount(bottleSprays);
  const dosesPerBottle = spraysPerBottle !== null && hasDose ? wholeCount(spraysPerBottle / spraysPerDose) : null;
  const costPerSprayCents =
    vialPriceCents !== null && vialPriceCents > 0 && bottleSprays > 0 ? vialPriceCents / bottleSprays : null;

  return {
    concentrationMcgPerMl: vialMcg / bacWaterMl,
    mcgPerSpray,
    // Multiplied before dividing so 12 sprays of a 5 mg / 15 mL mix is exactly 400 mcg.
    mcgPerDose: hasDose ? (vialMcg * spraysPerDose) / (bacWaterMl * spraysPerMl) : null,
    spraysPerBottle,
    dosesPerBottle,
    costPerSprayCents,
    costPerDoseCents: costPerSprayCents !== null && hasDose ? costPerSprayCents * spraysPerDose : null,
  };
}
