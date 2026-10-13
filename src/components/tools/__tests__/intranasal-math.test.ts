import { describe, expect, it } from 'vitest';
import { INTRANASAL_PRESETS, solveIntranasal, type IntranasalInputs } from '../intranasal-math';

function inputs(over: Partial<IntranasalInputs> = {}): IntranasalInputs {
  return { vialMg: 30, bacWaterMl: 10, bottleMl: 10, actuationsPerMl: 20, vialPriceCents: 4500, ...over };
}

describe('solveIntranasal', () => {
  it('Semax: 30 mg in 10 mL at 20 actuations/mL is 150 mcg per actuation', () => {
    expect(solveIntranasal(inputs())).toEqual({
      concentrationMcgPerMl: 3000,
      mcgPerActuation: 150,
      actuationsPerBottle: 200,
      costPerActuationCents: 22.5,
    });
  });

  it('Selank: 5 mg in 10 mL is 25 mcg per actuation', () => {
    const result = solveIntranasal(inputs({ vialMg: 5 }));
    expect(result?.concentrationMcgPerMl).toBe(500);
    expect(result?.mcgPerActuation).toBe(25);
  });

  it('a smaller pump means less peptide and more actuations per bottle', () => {
    const result = solveIntranasal(inputs({ actuationsPerMl: 50 }));
    expect(result?.mcgPerActuation).toBe(60);
    expect(result?.actuationsPerBottle).toBe(500);
    expect(result?.costPerActuationCents).toBe(9);
  });

  it('Selank in 15 mL with a 1 mL bottle at 10 actuations/mL', () => {
    expect(solveIntranasal(inputs({ vialMg: 5, bacWaterMl: 15, bottleMl: 1, actuationsPerMl: 10 }))).toEqual({
      concentrationMcgPerMl: 5000 / 15,
      mcgPerActuation: 5000 / 150,
      actuationsPerBottle: 10,
      costPerActuationCents: 450,
    });
  });

  it('actuations per bottle come from the bottle volume, not the BAC water', () => {
    const result = solveIntranasal(inputs({ bacWaterMl: 5 }));
    expect(result?.concentrationMcgPerMl).toBe(6000);
    expect(result?.actuationsPerBottle).toBe(200);
  });

  it('spreads the vial price over one bottle of actuations', () => {
    const result = solveIntranasal(inputs({ bottleMl: 5 }));
    expect(result?.actuationsPerBottle).toBe(100);
    expect(result?.costPerActuationCents).toBe(45);
  });

  it('leaves bottle figures and costs empty without a bottle volume', () => {
    const result = solveIntranasal(inputs({ bottleMl: 0 }));
    expect(result?.actuationsPerBottle).toBeNull();
    expect(result?.costPerActuationCents).toBeNull();
    expect(result?.mcgPerActuation).toBe(150);
  });

  it('leaves costs empty without a price', () => {
    const result = solveIntranasal(inputs({ vialPriceCents: null }));
    expect(result?.costPerActuationCents).toBeNull();
    expect(result?.mcgPerActuation).toBe(150);
  });

  it('returns null until vial, water and pump rate are positive', () => {
    expect(solveIntranasal(inputs({ vialMg: 0 }))).toBeNull();
    expect(solveIntranasal(inputs({ bacWaterMl: 0 }))).toBeNull();
    expect(solveIntranasal(inputs({ actuationsPerMl: 0 }))).toBeNull();
  });
});

describe('INTRANASAL_PRESETS', () => {
  it('lists Semax and Selank then Custom, with only Custom editable', () => {
    expect(INTRANASAL_PRESETS.map((preset) => [preset.label, preset.vialMg, preset.bacWaterMl, preset.isCustom])).toEqual([
      ['Semax 0.25%', 30, 10, false],
      ['Selank 0.05%', 5, 10, false],
      ['Custom', 10, 10, true],
    ]);
  });
});
