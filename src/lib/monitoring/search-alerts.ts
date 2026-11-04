/**
 * The C1 alert rules over daily Search Console totals. Pure, so the rules are
 * tested without calling Google.
 */

export interface DailySearchTotals {
  /** YYYY-MM-DD. */
  date: string;
  clicks: number;
  impressions: number;
  /** Average position that day (1 is the top result). */
  position: number;
}

export interface SearchAlert {
  kind: 'impressions-drop' | 'position-drop';
  message: string;
}

/** Yesterday below this share of the 7-day average is an alert. */
export const IMPRESSIONS_DROP_SHARE = 0.5;
/** The 7-day average position getting worse by more than this many places is an alert. */
export const POSITION_DROP_PLACES = 10;

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;
}

/** Impression-weighted average position, the way Search Console totals it. */
function weightedPosition(days: readonly DailySearchTotals[]): number | null {
  const impressions = days.reduce((total, day) => total + day.impressions, 0);
  if (impressions === 0) return null;
  return days.reduce((total, day) => total + day.position * day.impressions, 0) / impressions;
}

export interface SearchSummary {
  latest: DailySearchTotals | null;
  /** Average daily impressions over the 7 days before `latest`. */
  impressionsSevenDayAverage: number;
  /** Average position over the last 7 days, and over the 7 before them. */
  positionLastWeek: number | null;
  positionWeekBefore: number | null;
  clicksLastWeek: number;
  impressionsLastWeek: number;
}

/**
 * `days` is every day returned, oldest first. "Yesterday" is the newest day
 * Search Console has data for: its figures arrive two to three days late, so
 * the calendar yesterday is usually missing.
 */
export function summarise(days: readonly DailySearchTotals[]): SearchSummary {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.at(-1) ?? null;
  const beforeLatest = sorted.slice(-8, -1);
  const lastWeek = sorted.slice(-7);
  const weekBefore = sorted.slice(-14, -7);
  return {
    latest,
    impressionsSevenDayAverage: average(beforeLatest.map((day) => day.impressions)),
    positionLastWeek: weightedPosition(lastWeek),
    positionWeekBefore: weightedPosition(weekBefore),
    clicksLastWeek: lastWeek.reduce((total, day) => total + day.clicks, 0),
    impressionsLastWeek: lastWeek.reduce((total, day) => total + day.impressions, 0),
  };
}

export function searchAlerts(summary: SearchSummary): SearchAlert[] {
  const alerts: SearchAlert[] = [];
  const { latest, impressionsSevenDayAverage: sevenDay } = summary;
  if (latest && sevenDay > 0 && latest.impressions < sevenDay * IMPRESSIONS_DROP_SHARE) {
    alerts.push({
      kind: 'impressions-drop',
      message: `Impressions on ${latest.date} were ${latest.impressions}, under ${IMPRESSIONS_DROP_SHARE * 100}% of the 7-day average (${Math.round(sevenDay)}/day).`,
    });
  }
  const { positionLastWeek: now, positionWeekBefore: before } = summary;
  // A higher number is a worse position.
  if (now !== null && before !== null && now - before > POSITION_DROP_PLACES) {
    alerts.push({
      kind: 'position-drop',
      message: `Average position over the last 7 days is ${now.toFixed(1)}, ${(now - before).toFixed(1)} places worse than the 7 days before (${before.toFixed(1)}).`,
    });
  }
  return alerts;
}
