import { z } from 'zod';

/** Shapes shared by the server store, the admin API route and the dashboard. */

export const TRAFFIC_RANGES = ['24h', '7d', '30d', 'all'] as const;
export type TrafficRange = (typeof TRAFFIC_RANGES)[number];

export const TRAFFIC_RANGE_LABELS: Record<TrafficRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  all: 'All time',
};

export const trafficRangeSchema = z.enum(TRAFFIC_RANGES);

const RANGE_MS: Record<Exclude<TrafficRange, 'all'>, number> = {
  '24h': 24 * 3_600_000,
  '7d': 7 * 24 * 3_600_000,
  '30d': 30 * 24 * 3_600_000,
};

/** ISO start of the range, or null for all time. */
export function sinceForRange(range: TrafficRange, now: Date = new Date()): string | null {
  if (range === 'all') return null;
  return new Date(now.getTime() - RANGE_MS[range]).toISOString();
}

export interface DestinationStat {
  host: string;
  vendorSlug: string | null;
  vendorName: string | null;
  clicks: number;
  lastClickedAt: string;
}

export interface LinkStat {
  url: string;
  host: string;
  vendorName: string | null;
  clicks: number;
  lastClickedAt: string;
}

export interface RecentClick {
  id: number;
  clickedAt: string;
  url: string;
  host: string;
  vendorName: string | null;
  sourcePath: string | null;
}

export interface TrafficSnapshot {
  generatedAt: string;
  range: TrafficRange;
  totalClicks: number;
  clicksLastHour: number;
  /** Most-clicked first. */
  destinations: DestinationStat[];
  links: LinkStat[];
  /** Newest first, regardless of range, so the live feed always shows what just happened. */
  recent: RecentClick[];
}
