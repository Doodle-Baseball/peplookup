import { describe, expect, it } from 'vitest';
import { SYRINGES, solveReconstitution, vialsForCycle } from '../reconstitution-math';

describe('solveReconstitution: Find Units', () => {
  it('10 mg in 2 mL at 500 mcg draws 10 units', () => {
    expect(solveReconstitution('units', { vialMg: 10, bacWaterMl: 2, doseMcg: 500, units: 0 })).toEqual({
      concentrationMcgPerMl: 5000,
      drawMl: 0.1,
      units: 10,
      doseMcg: 500,
      bacWaterMl: 2,
      dosesPerVial: 20,
    });
  });

  it('5 mg in 2 mL at 250 mcg draws 10 units', () => {
    const result = solveReconstitution('units', { vialMg: 5, bacWaterMl: 2, doseMcg: 250, units: 0 });
    expect(result?.concentrationMcgPerMl).toBe(2500);
    expect(result?.units).toBe(10);
    expect(result?.dosesPerVial).toBe(20);
  });

  it('more water spreads the same dose over more units', () => {
    const result = solveReconstitution('units', { vialMg: 10, bacWaterMl: 3, doseMcg: 250, units: 0 });
    expect(result?.units).toBeCloseTo(7.5, 10);
    expect(result?.drawMl).toBeCloseTo(0.075, 10);
  });

  it('ignores the units field entirely', () => {
    const a = solveReconstitution('units', { vialMg: 10, bacWaterMl: 2, doseMcg: 500, units: 0 });
    const b = solveReconstitution('units', { vialMg: 10, bacWaterMl: 2, doseMcg: 500, units: 77 });
    expect(a).toEqual(b);
  });

  it('returns null until vial, water and dose are all positive', () => {
    expect(solveReconstitution('units', { vialMg: 0, bacWaterMl: 2, doseMcg: 500, units: 0 })).toBeNull();
    expect(solveReconstitution('units', { vialMg: 10, bacWaterMl: 0, doseMcg: 500, units: 0 })).toBeNull();
    expect(solveReconstitution('units', { vialMg: 10, bacWaterMl: 2, doseMcg: 0, units: 0 })).toBeNull();
  });

  it('reports 0 doses per vial when one dose exceeds the vial', () => {
    expect(solveReconstitution('units', { vialMg: 1, bacWaterMl: 1, doseMcg: 2000, units: 0 })?.dosesPerVial).toBe(0);
  });
});

describe('solveReconstitution: Find Dose', () => {
  it('18 units from 5 mg in 2 mL delivers exactly 450 mcg', () => {
    const result = solveReconstitution('dose', { vialMg: 5, bacWaterMl: 2, doseMcg: 0, units: 18 });
    expect(result?.doseMcg).toBe(450);
    expect(result?.drawMl).toBe(0.18);
    expect(result?.dosesPerVial).toBe(11);
  });

  it('counts a whole number of doses despite floating-point drift', () => {
    // 10 mg / 3 mL at 10 units is 333.33… mcg, exactly 30 doses.
    expect(solveReconstitution('dose', { vialMg: 10, bacWaterMl: 3, doseMcg: 0, units: 10 })?.dosesPerVial).toBe(30);
  });

  it('returns null without water or units', () => {
    expect(solveReconstitution('dose', { vialMg: 5, bacWaterMl: 0, doseMcg: 0, units: 18 })).toBeNull();
    expect(solveReconstitution('dose', { vialMg: 5, bacWaterMl: 2, doseMcg: 0, units: 0 })).toBeNull();
  });
});

describe('solveReconstitution: Find BAC Water', () => {
  it('250 mcg on the 25-unit mark of a 5 mg vial needs 5 mL', () => {
    const result = solveReconstitution('bac', { vialMg: 5, bacWaterMl: 0, doseMcg: 250, units: 25 });
    expect(result?.bacWaterMl).toBe(5);
    expect(result?.concentrationMcgPerMl).toBe(1000);
    expect(result?.dosesPerVial).toBe(20);
  });

  it('500 mcg on the 10-unit mark of a 10 mg vial needs 2 mL', () => {
    expect(solveReconstitution('bac', { vialMg: 10, bacWaterMl: 0, doseMcg: 500, units: 10 })?.bacWaterMl).toBe(2);
  });

  it('round-trips: the water it suggests draws back to the requested units', () => {
    const bac = solveReconstitution('bac', { vialMg: 10, bacWaterMl: 0, doseMcg: 333, units: 7 });
    const units = solveReconstitution('units', { vialMg: 10, bacWaterMl: bac?.bacWaterMl ?? 0, doseMcg: 333, units: 0 });
    expect(units?.units).toBeCloseTo(7, 10);
  });

  it('returns null without dose or units', () => {
    expect(solveReconstitution('bac', { vialMg: 5, bacWaterMl: 0, doseMcg: 0, units: 25 })).toBeNull();
    expect(solveReconstitution('bac', { vialMg: 5, bacWaterMl: 0, doseMcg: 250, units: 0 })).toBeNull();
  });
});

describe('syringes', () => {
  it('every barrel size shares the 100 units/mL scale', () => {
    expect(SYRINGES['U-100'].capacityUnits).toBe(100);
    expect(SYRINGES['U-50'].capacityUnits).toBe(50);
    expect(SYRINGES['U-30'].capacityUnits).toBe(30);
  });
});

describe('vialsForCycle', () => {
  it('a 20-dose vial covers two thirds of a 30-day cycle', () => {
    expect(vialsForCycle(30, 20)).toBe(1.5);
  });

  it('returns null for an empty cycle or a vial with no whole doses', () => {
    expect(vialsForCycle(0, 20)).toBeNull();
    expect(vialsForCycle(30, 0)).toBeNull();
  });
});
