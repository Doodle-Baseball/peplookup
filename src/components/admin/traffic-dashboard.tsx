'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalIcon, GlobeIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/format';
import {
  TRAFFIC_RANGES,
  TRAFFIC_RANGE_LABELS,
  type DestinationStat,
  type TrafficRange,
  type TrafficSnapshot,
} from '@/lib/traffic/snapshot';

const POLL_INTERVAL_MS = 15000;
/**
 * A request still running after this is abandoned. Without it, one request
 * that never settles (a dropped connection) would hold the in-flight slot and
 * every later poll would be skipped, freezing the dashboard for good.
 */
const REQUEST_TIMEOUT_MS = 10000;
/** How long a freshly arrived click stays highlighted in the live feed. */
const FRESH_HIGHLIGHT_MS = 6000;

/** Seconds precision for the live feed, where "just now" for a whole minute would hide the real-time behaviour. */
function agoLabel(iso: string, nowMs: number): string {
  const seconds = Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 1000));
  return seconds < 60 ? `${seconds}s ago` : timeAgo(iso, new Date(nowMs));
}

function destinationLabel(stat: { vendorName: string | null; host: string }): string {
  return stat.vendorName ?? stat.host;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface-raised p-5">
      <p className="text-micro font-bold uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1 truncate text-3xl font-black tracking-tight text-content">{value}</p>
      {hint ? <p className="mt-1 truncate text-xs font-semibold text-muted">{hint}</p> : null}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-surface-raised">
      <header className="border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-base font-black text-content">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs font-semibold text-muted">{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="px-5 py-10 text-center text-sm font-semibold text-muted sm:px-6">{message}</p>;
}

function Destinations({ destinations, totalClicks }: { destinations: DestinationStat[]; totalClicks: number }) {
  if (destinations.length === 0) return <EmptyState message="No outbound clicks in this period yet." />;
  const topClicks = Math.max(1, destinations[0]?.clicks ?? 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-micro font-bold uppercase tracking-wide text-faint">
            <th scope="col" className="px-5 py-3 sm:px-6">Supplier / website</th>
            <th scope="col" className="px-3 py-3 text-right">Clicks</th>
            <th scope="col" className="px-3 py-3 text-right">Share</th>
            <th scope="col" className="px-5 py-3 text-right sm:px-6">Last click</th>
          </tr>
        </thead>
        <tbody>
          {destinations.map((destination, index) => (
            <tr key={destination.host} className="border-b border-line last:border-b-0">
              <td className="px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <span className="rounded-pill bg-brand px-2 py-0.5 text-micro font-black uppercase text-white">Top</span>
                  ) : null}
                  <span className="font-bold text-content">{destinationLabel(destination)}</span>
                </div>
                {destination.vendorName ? <p className="font-mono text-xs text-muted">{destination.host}</p> : null}
                <div className="mt-2 h-1.5 rounded-pill bg-surface-sunken" aria-hidden="true">
                  <div
                    className="h-full rounded-pill bg-brand"
                    style={{ width: `${Math.max(2, (destination.clicks / topClicks) * 100)}%` }}
                  />
                </div>
              </td>
              <td className="px-3 py-3 text-right text-lg font-black text-content">{destination.clicks.toLocaleString('en-US')}</td>
              <td className="px-3 py-3 text-right font-semibold text-muted">
                {totalClicks > 0 ? `${((destination.clicks / totalClicks) * 100).toFixed(1)}%` : '—'}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold text-muted sm:px-6">
                <time dateTime={destination.lastClickedAt} suppressHydrationWarning>
                  {timeAgo(destination.lastClickedAt)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExternalLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="inline-flex max-w-full items-center gap-1.5 text-accent hover:underline"
    >
      <span className="truncate">{url}</span>
      <ExternalIcon className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}

export function TrafficDashboard({
  initial,
  initialError,
}: {
  initial: TrafficSnapshot | null;
  initialError: string | null;
}) {
  const [range, setRange] = useState<TrafficRange>('all');
  const [snapshot, setSnapshot] = useState<TrafficSnapshot | null>(initial);
  const [error, setError] = useState<string | null>(initialError);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [freshIds, setFreshIds] = useState<ReadonlySet<number>>(new Set());
  const knownIds = useRef<Set<number> | null>(initial ? new Set(initial.recent.map((click) => click.id)) : null);
  const highlightTimers = useRef<Set<number>>(new Set());

  // The whole polling lifecycle for one range lives in this single effect, so its cleanup is the only place that
  // has to stop it: changing range or unmounting aborts the request, clears the interval and removes the listener.
  useEffect(() => {
    let isActive = true;
    let inFlight: AbortController | null = null;
    let pollTimer: number | null = null;
    let requestTimer: number | null = null;

    const clearRequestTimer = () => {
      if (requestTimer === null) return;
      window.clearTimeout(requestTimer);
      requestTimer = null;
    };

    const refresh = async () => {
      if (inFlight) return;
      const controller = new AbortController();
      inFlight = controller;
      let timedOut = false;
      requestTimer = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);
      // A response that was aborted or superseded must never reach state, even if it resolves late.
      const isStale = () => !isActive || controller.signal.aborted;
      // The one abort worth telling the admin about: their own request gave up, not a range change or leaving the page.
      const reportTimeout = () => {
        if (isActive && timedOut) setError('Connection lost. Retrying…');
      };
      try {
        const response = await fetch(`/api/admin/traffic?range=${range}`, { cache: 'no-store', signal: controller.signal });
        const body: unknown = await response.json().catch(() => null);
        if (isStale()) {
          reportTimeout();
          return;
        }
        if (!response.ok) {
          const message =
            typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
              ? body.error
              : 'Traffic could not be loaded.';
          setError(message);
          return;
        }
        const next = body as TrafficSnapshot;
        const known = knownIds.current;
        // Nothing is "fresh" on the first load: only clicks that arrive while this page is open should flash.
        const arrived = known ? next.recent.filter((click) => !known.has(click.id)).map((click) => click.id) : [];
        knownIds.current = new Set(next.recent.map((click) => click.id));
        setSnapshot(next);
        setError(null);
        if (arrived.length > 0) {
          setFreshIds((current) => new Set([...current, ...arrived]));
          const timeoutId = window.setTimeout(() => {
            highlightTimers.current.delete(timeoutId);
            setFreshIds((current) => new Set([...current].filter((id) => !arrived.includes(id))));
          }, FRESH_HIGHLIGHT_MS);
          highlightTimers.current.add(timeoutId);
        }
      } catch {
        if (isStale()) {
          reportTimeout();
          return;
        }
        setError('Connection lost. Retrying…');
      } finally {
        if (inFlight === controller) {
          clearRequestTimer();
          inFlight = null;
        }
      }
    };

    const stopPolling = () => {
      if (pollTimer === null) return;
      window.clearInterval(pollTimer);
      pollTimer = null;
    };

    const startPolling = () => {
      stopPolling();
      pollTimer = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        return;
      }
      void refresh();
      startPolling();
    };

    // A dashboard opened in a background tab waits for the tab to become visible instead of fetching.
    if (!document.hidden) {
      void refresh();
      startPolling();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isActive = false;
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearRequestTimer();
      inFlight?.abort();
      inFlight = null;
    };
  }, [range]);

  useEffect(() => {
    const timers = highlightTimers.current;
    return () => {
      timers.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timers.clear();
    };
  }, []);

  // Keeps the "Xs ago" labels ticking while the tab is visible; no point waking a hidden tab every second.
  useEffect(() => {
    let tickTimer: number | null = null;

    const stopTicking = () => {
      if (tickTimer === null) return;
      window.clearInterval(tickTimer);
      tickTimer = null;
    };

    const startTicking = () => {
      stopTicking();
      tickTimer = window.setInterval(() => setNowMs(Date.now()), 1000);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopTicking();
        return;
      }
      setNowMs(Date.now());
      startTicking();
    };

    if (!document.hidden) startTicking();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stopTicking();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const top = snapshot?.destinations[0] ?? null;
  const isLive = snapshot !== null && error === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Time range" className="flex flex-wrap gap-2">
          {TRAFFIC_RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={cn(
                'rounded-pill border px-4 py-2 text-sm font-bold transition-colors',
                range === option
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-surface-raised text-muted hover:border-brand hover:text-brand',
              )}
            >
              {TRAFFIC_RANGE_LABELS[option]}
            </button>
          ))}
        </div>
        <p role="status" className="flex items-center gap-2 text-xs font-bold text-muted">
          <span
            aria-hidden="true"
            className={cn('h-2.5 w-2.5 rounded-pill', isLive ? 'bg-ok' : 'bg-warn')}
          />
          {isLive ? 'Live · updates every few seconds' : 'Not updating'}
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-card border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}

      {snapshot ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Outbound clicks" value={snapshot.totalClicks.toLocaleString('en-US')} hint={TRAFFIC_RANGE_LABELS[range]} />
            <StatCard label="Last hour" value={snapshot.clicksLastHour.toLocaleString('en-US')} hint="Clicks in the past 60 minutes" />
            <StatCard label="Websites reached" value={snapshot.destinations.length.toLocaleString('en-US')} hint="Distinct destinations" />
            <StatCard
              label="Most clicked"
              value={top ? destinationLabel(top) : '—'}
              hint={top ? `${top.clicks.toLocaleString('en-US')} ${top.clicks === 1 ? 'click' : 'clicks'}` : 'No clicks yet'}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="Clicks by supplier / website" hint="Ranked by clicks. Suppliers are matched from their homepage or affiliate link.">
              <Destinations destinations={snapshot.destinations} totalClicks={snapshot.totalClicks} />
            </Section>

            <Section title="Live outbound clicks" hint="Newest first. Appears as visitors leave the site.">
              {snapshot.recent.length === 0 ? (
                <EmptyState message="No outbound clicks recorded yet. They will appear here the moment a visitor clicks a link that leaves the site." />
              ) : (
                <ol className="divide-y divide-line">
                  {snapshot.recent.map((click) => (
                    <li
                      key={click.id}
                      className={cn(
                        'px-5 py-3 transition-colors duration-700 sm:px-6',
                        freshIds.has(click.id) && 'bg-accent-tint',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-content">
                          <GlobeIcon className="h-4 w-4 shrink-0 text-brand" />
                          <span className="truncate">{destinationLabel(click)}</span>
                          {freshIds.has(click.id) ? (
                            <span className="rounded-pill bg-danger px-2 py-0.5 text-micro font-black uppercase text-white">New</span>
                          ) : null}
                        </p>
                        <time
                          dateTime={click.clickedAt}
                          title={new Date(click.clickedAt).toLocaleString()}
                          className="shrink-0 font-mono text-xs font-bold text-muted"
                          suppressHydrationWarning
                        >
                          {agoLabel(click.clickedAt, nowMs)}
                        </time>
                      </div>
                      <div className="mt-1 min-w-0 text-xs font-semibold">
                        <ExternalLink url={click.url} />
                      </div>
                      {click.sourcePath ? (
                        <p className="mt-0.5 truncate text-xs text-muted">from {click.sourcePath}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          </div>

          <Section title="Clicks by exact link" hint="Every distinct URL that was clicked, with its own total.">
            {snapshot.links.length === 0 ? (
              <EmptyState message="No outbound clicks in this period yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-micro font-bold uppercase tracking-wide text-faint">
                      <th scope="col" className="px-5 py-3 sm:px-6">Link</th>
                      <th scope="col" className="px-3 py-3">Supplier / website</th>
                      <th scope="col" className="px-3 py-3 text-right">Clicks</th>
                      <th scope="col" className="px-5 py-3 text-right sm:px-6">Last click</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.links.map((link) => (
                      <tr key={link.url} className="border-b border-line last:border-b-0">
                        <td className="max-w-xs px-5 py-3 font-semibold sm:px-6 lg:max-w-md">
                          <ExternalLink url={link.url} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold text-content">{destinationLabel(link)}</td>
                        <td className="px-3 py-3 text-right text-lg font-black text-content">{link.clicks.toLocaleString('en-US')}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold text-muted sm:px-6">
                          <time dateTime={link.lastClickedAt} suppressHydrationWarning>
                            {timeAgo(link.lastClickedAt)}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      ) : null}
    </div>
  );
}
