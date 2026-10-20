/**
 * Fixed-window limiter held in memory. Best-effort: each server instance
 * keeps its own counts, and nothing is written anywhere, so a key (such as
 * an IP address) is never stored beyond the window.
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
  now = () => Date.now(),
}: {
  limit: number;
  windowMs: number;
  /** Past this many tracked keys the table is cleared rather than growing without bound. */
  maxKeys?: number;
  now?: () => number;
}) {
  const windows = new Map<string, { startedAt: number; count: number }>();

  /** Records one attempt for `key`; false once `key` has used up the window. */
  return function allow(key: string): boolean {
    const time = now();
    if (windows.size >= maxKeys) windows.clear();
    const entry = windows.get(key);
    if (!entry || time - entry.startedAt >= windowMs) {
      windows.set(key, { startedAt: time, count: 1 });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}
