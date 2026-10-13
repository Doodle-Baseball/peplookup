/**
 * Illustrative peaks matching the example peak table on the COA reader page.
 * Heights are exaggerated for the two minor peaks so they stay visible; at true
 * scale a 0.4% peak would be a flat line beside the main one.
 */
const PEAKS = [
  { label: '1', retentionMin: 3.2, relativeHeight: 0.05, width: 0.12 },
  { label: '2', retentionMin: 11.8, relativeHeight: 1, width: 0.15 },
  { label: '3', retentionMin: 12.6, relativeHeight: 0.08, width: 0.12 },
];

const RUN_MINUTES = 16;
const TICK_EVERY_MIN = 2;
const SAMPLE_COUNT = 480;

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 230;
const PLOT_LEFT = 36;
const PLOT_RIGHT = 584;
const PLOT_TOP = 28;
const BASELINE = 186;

function signalAt(minutes: number): number {
  return PEAKS.reduce(
    (sum, peak) => sum + peak.relativeHeight * Math.exp(-((minutes - peak.retentionMin) ** 2) / (2 * peak.width ** 2)),
    0,
  );
}

const xFor = (minutes: number) => PLOT_LEFT + (minutes / RUN_MINUTES) * (PLOT_RIGHT - PLOT_LEFT);
const yFor = (signal: number) => BASELINE - signal * (BASELINE - PLOT_TOP);

export function ChromatogramIllustration() {
  const points = Array.from({ length: SAMPLE_COUNT + 1 }, (_, index) => {
    const minutes = (index / SAMPLE_COUNT) * RUN_MINUTES;
    return `${xFor(minutes).toFixed(1)},${yFor(signalAt(minutes)).toFixed(1)}`;
  });
  const tracePath = `M${points.join(' L')}`;
  const areaPath = `${tracePath} L${PLOT_RIGHT},${BASELINE} L${PLOT_LEFT},${BASELINE} Z`;
  const ticks = Array.from({ length: RUN_MINUTES / TICK_EVERY_MIN + 1 }, (_, index) => index * TICK_EVERY_MIN);

  return (
    <figure className="rounded-card border border-line bg-surface p-3 shadow-card sm:p-4">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Illustrative HPLC chromatogram: a small peak at 3.2 minutes, the main peak at 11.8 minutes and a small related peak at 12.6 minutes"
        className="h-auto w-full"
      >
        {ticks.map((minutes) => (
          <g key={minutes}>
            <line
              x1={xFor(minutes)}
              x2={xFor(minutes)}
              y1={PLOT_TOP}
              y2={BASELINE}
              className="stroke-line"
              strokeDasharray="2 4"
            />
            <text x={xFor(minutes)} y={BASELINE + 18} textAnchor="middle" className="fill-muted font-mono" fontSize="11">
              {minutes}
            </text>
          </g>
        ))}
        <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={BASELINE} y2={BASELINE} className="stroke-muted" strokeWidth="1.5" />
        <line x1={PLOT_LEFT} x2={PLOT_LEFT} y1={PLOT_TOP - 8} y2={BASELINE} className="stroke-muted" strokeWidth="1.5" />

        <path d={areaPath} className="fill-accent/10" />
        <path d={tracePath} className="stroke-accent" fill="none" strokeWidth="2" strokeLinejoin="round" />

        {PEAKS.map((peak) => (
          <g key={peak.label}>
            <circle cx={xFor(peak.retentionMin)} cy={yFor(peak.relativeHeight) - 13} r="8" className="fill-accent" />
            <text
              x={xFor(peak.retentionMin)}
              y={yFor(peak.relativeHeight) - 9.5}
              textAnchor="middle"
              className="fill-surface-raised font-mono"
              fontSize="10"
              fontWeight="700"
            >
              {peak.label}
            </text>
          </g>
        ))}

        <text x={PLOT_RIGHT} y={VIEW_HEIGHT - 4} textAnchor="end" className="fill-muted font-mono" fontSize="11">
          Retention time (min)
        </text>
        <text
          x={12}
          y={(PLOT_TOP + BASELINE) / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${(PLOT_TOP + BASELINE) / 2})`}
          className="fill-muted font-mono"
          fontSize="11"
        >
          Signal
        </text>
      </svg>
      <figcaption className="mt-2 px-1 font-mono text-micro font-bold uppercase tracking-wide text-muted">
        Illustrative chromatogram for the peak table below
      </figcaption>
    </figure>
  );
}
