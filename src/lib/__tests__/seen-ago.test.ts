import { describe, expect, it } from 'vitest';
import { seenAgo } from '../format';

const NOW = new Date('2026-10-22T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

describe('seenAgo', () => {
  it('reads like timeAgo for the first six days', () => {
    expect(seenAgo(ago(30_000), NOW)).toBe('just now');
    expect(seenAgo(ago(5 * 60_000), NOW)).toBe('5m ago');
    expect(seenAgo(ago(3 * HOUR), NOW)).toBe('3h ago');
    expect(seenAgo(ago(6 * DAY), NOW)).toBe('6d ago');
  });

  it('switches to whole weeks from seven days', () => {
    expect(seenAgo(ago(7 * DAY), NOW)).toBe('1w ago');
    expect(seenAgo(ago(13 * DAY), NOW)).toBe('1w ago');
    expect(seenAgo(ago(14 * DAY), NOW)).toBe('2w ago');
  });

  it('never uses months or years, and keeps the real number of weeks', () => {
    expect(seenAgo(ago(30 * DAY), NOW)).toBe('4w ago');
    expect(seenAgo(ago(36 * DAY), NOW)).toBe('5w ago');
    expect(seenAgo(ago(400 * DAY), NOW)).toBe('57w ago');
  });

  it('treats a future time as now and an unreadable one as unknown', () => {
    expect(seenAgo(ago(-HOUR), NOW)).toBe('just now');
    expect(seenAgo('not a date', NOW)).toBe('unknown');
  });
});
