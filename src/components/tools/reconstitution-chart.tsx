import { UNITS_PER_ML } from '@/components/tools/reconstitution-math';

const VIAL_SIZES_MG = [5, 10, 20];
const WATER_VOLUMES_ML = [1, 2, 3];
const MCG_PER_MG = 1000;

/** Trims trailing zeros so 5 mg/mL and 1.67 mg/mL sit in the same column naturally. */
function formatFigure(value: number, maxFractionDigits: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits });
}

/**
 * Worked concentrations for common vial and water combinations. Computed from the
 * same units-per-mL scale as the calculator rather than typed in, so the two can
 * never disagree.
 */
export function ReconstitutionChart() {
  const rows = VIAL_SIZES_MG.flatMap((vialMg) =>
    WATER_VOLUMES_ML.map((waterMl) => {
      const concentrationMgPerMl = vialMg / waterMl;
      return {
        key: `${vialMg}-${waterMl}`,
        vialMg,
        waterMl,
        concentrationMgPerMl,
        mcgPerUnit: (concentrationMgPerMl * MCG_PER_MG) / UNITS_PER_ML,
      };
    }),
  );

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Concentration and amount per unit on a U-100 syringe, by vial size and water added
        </caption>
        <thead className="bg-accent-tint">
          <tr className="border-b border-accent/25">
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-micro font-bold uppercase tracking-wide text-accent-strong">
              Vial size
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-micro font-bold uppercase tracking-wide text-accent-strong">
              Water added
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-micro font-bold uppercase tracking-wide text-accent-strong">
              Concentration
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-micro font-bold uppercase tracking-wide text-accent-strong">
              Per unit (U-100)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-line transition-colors last:border-0 even:bg-surface-raised hover:bg-accent-tint">
              <th scope="row" className="whitespace-nowrap px-4 py-3 font-black tabular-nums text-content">
                {row.vialMg} mg
              </th>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">{row.waterMl} mL</td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">{formatFigure(row.concentrationMgPerMl, 2)} mg/mL</td>
              <td className="whitespace-nowrap px-4 py-3 font-black tabular-nums text-accent-strong">{formatFigure(row.mcgPerUnit, 1)} mcg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
