import { describe, expect, it } from 'vitest';
import { INTRANASAL_PRESETS, solveIntranasal, type IntranasalInputs } from '../intranasal-math';

function inputs(over: Partial<IntranasalInputs> = {}): IntranasalInputs {
  return { vialMg: 30, bacWaterMl: 10, bottleMl: 10, spraysPerDose: 2, spraysPerMl: 20, vialPriceCents: 4500, ...over };
}

describe('solveIntranasal', () => {
  it('Semax: 30 mg in 10 mL at 20 sprays/mL is 150 mcg per spray', () => {
    expect(solveIntranasal(inputs())).toEqual({
      concentrationMcgPerMl: 3000,
      mcgPerSpray: 150,
      mcgPerDose: 300,
      spraysPerBottle: 200,
      dosesPerBottle: 100,
      costPerSprayCents: 22.5,
      costPerDoseCents: 45,
    });
  });

  it('Selank: 5 mg in 10 mL is 25 mcg per spray', () => {
    const result = solveIntranasal(inputs({ vialMg: 5 }));
    expect(result?.concentrationMcgPerMl).toBe(500);
    expect(result?.mcgPerSpray).toBe(25);
    expect(result?.mcgPerDose).toBe(50);
  });

  it('a finer spray rate means less peptide and more sprays per bottle', () => {
    const result = solveIntranasal(inputs({ spraysPerMl: 50 }));
    expect(result?.mcgPerSpray).toBe(60);
    expect(result?.spraysPerBottle).toBe(500);
    expect(result?.dosesPerBottle).toBe(250);
    expect(result?.costPerSprayCents).toBe(9);
  });

  it('Selank in 15 mL, a 1 mL bottle at 10 sprays/mL and a 12-spray dose', () => {
    expect(
      solveIntranasal(inputs({ vialMg: 5, bacWaterMl: 15, bottleMl: 1, spraysPerDose: 12, spraysPerMl: 10 })),
    ).toEqual({
      concentrationMcgPerMl: 5000 / 15,
      mcgPerSpray: 5000 / 150,
      mcgPerDose: 400,
      spraysPerBottle: 10,
      dosesPerBottle: 0,
      costPerSprayCents: 450,
      costPerDoseCents: 5400,
    });
  });

  it('sprays per bottle come from the bottle volume, not the BAC water', () => {
    const result = solveIntranasal(inputs({ bacWaterMl: 5 }));
    expect(result?.concentrationMcgPerMl).toBe(6000);
    expect(result?.spraysPerBottle).toBe(200);
    expect(result?.dosesPerBottle).toBe(100);
  });

  it('spreads the vial price over one bottle of sprays', () => {
    const result = solveIntranasal(inputs({ bottleMl: 5 }));
    expect(result?.spraysPerBottle).toBe(100);
    expect(result?.costPerSprayCents).toBe(45);
    expect(result?.costPerDoseCents).toBe(90);
  });

  it('leaves bottle figures and costs empty without a bottle volume', () => {
    const result = solveIntranasal(inputs({ bottleMl: 0 }));
    expect(result?.spraysPerBottle).toBeNull();
    expect(result?.dosesPerBottle).toBeNull();
    expect(result?.costPerSprayCents).toBeNull();
    expect(result?.mcgPerSpray).toBe(150);
  });

  it('leaves costs empty without a price', () => {
    const result = solveIntranasal(inputs({ vialPriceCents: null }));
    expect(result?.costPerSprayCents).toBeNull();
    expect(result?.costPerDoseCents).toBeNull();
    expect(result?.mcgPerSpray).toBe(150);
  });

  it('leaves per-dose figures empty without a spray count', () => {
    const result = solveIntranasal(inputs({ spraysPerDose: 0 }));
    expect(result?.mcgPerDose).toBeNull();
    expect(result?.dosesPerBottle).toBeNull();
    expect(result?.costPerDoseCents).toBeNull();
  });

  it('returns null until vial, water and spray rate are positive', () => {
    expect(solveIntranasal(inputs({ vialMg: 0 }))).toBeNull();
    expect(solveIntranasal(inputs({ bacWaterMl: 0 }))).toBeNull();
    expect(solveIntranasal(inputs({ spraysPerMl: 0 }))).toBeNull();
  });
});

describe('INTRANASAL_PRESETS', () => {
  it('lists the four compounds then Custom, with only Custom editable', () => {
    expect(INTRANASAL_PRESETS.map((preset) => [preset.label, preset.vialMg, preset.bacWaterMl, preset.isCustom])).toEqual([
      ['Semax 0.25%', 30, 10, false],
      ['Selank 0.05%', 5, 10, false],
      ['PT-141 (Bremelanotide)', 10, 10, false],
      ['Melanotan II', 10, 10, false],
      ['Custom', 10, 10, true],
    ]);
  });
});
