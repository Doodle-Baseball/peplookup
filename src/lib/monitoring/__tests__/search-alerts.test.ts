import { describe, expect, it } from 'vitest';
import { searchAlerts, summarise, type DailySearchTotals } from '@/lib/monitoring/search-alerts';

function days(impressions: readonly number[], position = 8): DailySearchTotals[] {
  return impressions.map((value, index) => ({
    date: `2026-10-${String(index + 1).padStart(2, '0')}`,
    clicks: Math.round(value / 20),
    impressions: value,
    position,
  }));
}

describe('searchAlerts (C1)', () => {
  it('alerts when the latest day is under half the 7-day average, as on 28 Oct', () => {
    const summary = summarise(days([700, 690, 710, 705, 700, 698, 702, 20]));
    expect(searchAlerts(summary).map((alert) => alert.kind)).toEqual(['impressions-drop']);
  });

  it('stays quiet on an ordinary dip', () => {
    expect(searchAlerts(summarise(days([700, 690, 710, 705, 700, 698, 702, 500])))).toEqual([]);
  });

  it('alerts when the 7-day average position gets more than 10 places worse', () => {
    const before = days([100, 100, 100, 100, 100, 100, 100], 8);
    const after = days([100, 100, 100, 100, 100, 100, 100], 22).map((day, index) => ({
      ...day,
      date: `2026-10-${String(index + 8).padStart(2, '0')}`,
    }));
    const alerts = searchAlerts(summarise([...before, ...after]));
    expect(alerts.map((alert) => alert.kind)).toEqual(['position-drop']);
  });

  it('says nothing without data rather than guessing', () => {
    expect(searchAlerts(summarise([]))).toEqual([]);
  });
});
