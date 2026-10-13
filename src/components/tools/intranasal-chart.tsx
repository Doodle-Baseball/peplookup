import { PUMP_RATES } from '@/components/tools/intranasal-math';

const CONCENTRATIONS_MG_PER_ML = [1, 2, 3, 5];
const MCG_PER_MG = 1000;

/** The two pump sizes the chart compares, smallest volume first. */
const CHART_PUMPS = PUMP_RATES.filter((rate) => rate.actuationsPerMl === 20 || rate.actuationsPerMl === 10).sort(
  (a, b) => b.actuationsPerMl - a.actuationsPerMl,
);

/**
 * Amount per actuation for common concentrations. Worked out from the same pump
 * rates as the calculator rather than typed in, so the two can never disagree.
 */
export function IntranasalChart() {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Amount in each actuation by concentration and pump size</caption>
        <thead className="bg-accent-tint">
          <tr className="border-b border-accent/25">
            <th scope="col" className="whitespace-nowrap px-3 py-3 sm:px-4 text-micro font-bold uppercase tracking-wide text-accent-strong">
              Concentration
            </th>
            {CHART_PUMPS.map((pump) => (
              <th
                key={pump.actuationsPerMl}
                scope="col"
                className="whitespace-nowrap px-3 py-3 sm:px-4 text-micro font-bold uppercase tracking-wide text-accent-strong"
              >
                {pump.pumpVolumeLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CONCENTRATIONS_MG_PER_ML.map((concentrationMgPerMl) => (
            <tr
              key={concentrationMgPerMl}
              className="border-b border-line transition-colors last:border-0 even:bg-surface-raised hover:bg-accent-tint"
            >
              <th scope="row" className="whitespace-nowrap px-3 py-3 sm:px-4 font-black tabular-nums text-content">
                {concentrationMgPerMl} mg/mL
              </th>
              {CHART_PUMPS.map((pump) => (
                <td
                  key={pump.actuationsPerMl}
                  className="whitespace-nowrap px-3 py-3 sm:px-4 font-black tabular-nums text-accent-strong"
                >
                  {((concentrationMgPerMl * MCG_PER_MG) / pump.actuationsPerMl).toLocaleString('en-US')} mcg
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
