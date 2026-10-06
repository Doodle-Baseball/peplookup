// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { TrafficDashboard } from '../traffic-dashboard';
import type { TrafficSnapshot } from '@/lib/traffic/snapshot';

const NOW = '2026-10-05T12:00:00.000Z';

function snapshot(overrides: Partial<TrafficSnapshot> = {}): TrafficSnapshot {
  return {
    generatedAt: NOW,
    range: 'all',
    totalClicks: 4,
    clicksLastHour: 1,
    destinations: [
      { host: 'acme.com', vendorSlug: 'acme', vendorName: 'Acme Peptides', clicks: 3, lastClickedAt: NOW },
      { host: 'wa.me', vendorSlug: null, vendorName: null, clicks: 1, lastClickedAt: NOW },
    ],
    links: [{ url: 'https://acme.com/?ref=pep', host: 'acme.com', vendorName: 'Acme Peptides', clicks: 3, lastClickedAt: NOW }],
    recent: [
      { id: 2, clickedAt: NOW, url: 'https://acme.com/?ref=pep', host: 'acme.com', vendorName: 'Acme Peptides', sourcePath: '/suppliers/acme' },
    ],
    ...overrides,
  };
}

describe('TrafficDashboard', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('ranks destinations by clicks, naming vendors and falling back to the host', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);

    const table = screen.getAllByRole('table')[0]!;
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]!).getByText('Acme Peptides')).toBeTruthy();
    expect(within(rows[1]!).getByText('Top')).toBeTruthy();
    expect(within(rows[2]!).getByText('wa.me')).toBeTruthy();
    expect(within(rows[1]!).getByText('75.0%')).toBeTruthy();
  });

  it('shows empty states when nothing has been clicked yet', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(
      <TrafficDashboard
        initial={snapshot({ totalClicks: 0, clicksLastHour: 0, destinations: [], links: [], recent: [] })}
        initialError={null}
      />,
    );
    expect(screen.getByText(/No outbound clicks recorded yet/)).toBeTruthy();
  });

  it('shows the load error, such as the missing-migration hint', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<TrafficDashboard initial={null} initialError="The outbound_clicks table is not there yet." />);
    expect(screen.getByRole('alert').textContent).toContain('outbound_clicks table');
  });

  it('adds a click to the live feed when the next poll returns it', async () => {
    vi.useFakeTimers();
    const next = snapshot({
      totalClicks: 5,
      recent: [
        { id: 3, clickedAt: NOW, url: 'https://wa.me/12602181154', host: 'wa.me', vendorName: null, sourcePath: '/' },
        ...snapshot().recent,
      ],
    });
    const responses = [snapshot(), next];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(responses.shift() ?? next), { status: 200 })));

    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15100);
    });

    expect(screen.getAllByText('https://wa.me/12602181154').length).toBeGreaterThan(0);
    expect(screen.getByText('New')).toBeTruthy();
  });
});

describe('TrafficDashboard polling lifecycle', () => {
  const POLL_MS = 15_000;
  // The dashboard owns two intervals while visible: the poll and the one-second "Xs ago" ticker.
  const VISIBLE_TIMER_COUNT = 2;

  function setTabHidden(hidden: boolean) {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    document.dispatchEvent(new Event('visibilitychange'));
  }

  function okFetch(body: TrafficSnapshot = snapshot()) {
    return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify(body), { status: 200 }));
  }

  function requestedUrls(fetchMock: ReturnType<typeof okFetch>): string[] {
    return fetchMock.mock.calls.map(([input]) => String(input));
  }

  async function advance(ms: number) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  function newClickSnapshot(): TrafficSnapshot {
    return snapshot({
      totalClicks: 5,
      recent: [
        { id: 3, clickedAt: NOW, url: 'https://wa.me/12602181154', host: 'wa.me', vendorName: null, sourcePath: '/' },
        ...snapshot().recent,
      ],
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
    setTabHidden(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(document, 'hidden');
  });

  it('requests the traffic immediately on mount', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);

    expect(requestedUrls(fetchMock)).toEqual(['/api/admin/traffic?range=all']);
  });

  it('polls every 15 seconds and not before', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(POLL_MS - 1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await advance(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await advance(POLL_MS);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  /** A request that never answers, but rejects when aborted, as the browser's fetch does. */
  function hangingFetch() {
    return vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    );
  }

  it('does not start a second request while one is still running', async () => {
    const fetchMock = hangingFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(5000);

    // Coming back to the tab asks for a refresh, but the first request is still open.
    setTabHidden(true);
    setTabHidden(false);
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up on a request that hangs, says so, and keeps polling', async () => {
    const fetchMock = hangingFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(10_000);

    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(screen.getByRole('alert').textContent).toContain('Connection lost');

    await advance(POLL_MS - 10_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('recovers on the next poll after a request times out', async () => {
    let call = 0;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      call += 1;
      if (call === 1) {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        });
      }
      return Promise.resolve(new Response(JSON.stringify(snapshot()), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(10_000);
    expect(screen.getByRole('alert')).toBeTruthy();

    await advance(POLL_MS - 10_000);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('makes no request while the tab is hidden', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    setTabHidden(true);
    await advance(POLL_MS * 4);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not fetch when mounted in a hidden tab until it becomes visible', async () => {
    setTabHidden(true);
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(POLL_MS * 2);
    expect(fetchMock).not.toHaveBeenCalled();

    setTabHidden(false);
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes once when the tab becomes visible, then resumes the 15 second cycle', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    setTabHidden(true);
    await advance(POLL_MS * 2);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    setTabHidden(false);
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT);

    await advance(POLL_MS);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('fetches a newly selected range immediately and polls only that range afterwards', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);

    fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await advance(0);
    expect(requestedUrls(fetchMock)).toEqual(['/api/admin/traffic?range=all', '/api/admin/traffic?range=7d']);
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT);

    await advance(POLL_MS);
    expect(requestedUrls(fetchMock)).toEqual([
      '/api/admin/traffic?range=all',
      '/api/admin/traffic?range=7d',
      '/api/admin/traffic?range=7d',
    ]);
  });

  it('aborts the previous range request and ignores its late response', async () => {
    const signals: AbortSignal[] = [];
    const resolvers: Array<(response: Response) => void> = [];
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal) signals.push(init.signal);
      return new Promise<Response>((resolve) => resolvers.push(resolve));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);

    fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await advance(0);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);

    // The aborted request resolves anyway, as a slow network response might.
    await act(async () => {
      resolvers[0]?.(new Response(JSON.stringify(newClickSnapshot()), { status: 200 }));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByText('https://wa.me/12602181154')).toBeNull();
    expect(screen.queryByText('New')).toBeNull();
  });

  it('clears every timer when unmounted', async () => {
    vi.stubGlobal('fetch', okFetch());
    const { unmount } = render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborts the in-flight request when unmounted and never polls again', async () => {
    let signal: AbortSignal | undefined;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      signal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    });
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    expect(signal?.aborted).toBe(false);

    unmount();
    expect(signal?.aborted).toBe(true);

    await advance(POLL_MS * 4);
    setTabHidden(true);
    setTabHidden(false);
    await advance(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps a single polling interval across re-renders and range changes', async () => {
    vi.stubGlobal('fetch', okFetch());
    const { rerender } = render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT);

    rerender(<TrafficDashboard initial={snapshot()} initialError={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Last 30 days' }));
    fireEvent.click(screen.getByRole('button', { name: 'Last 24 hours' }));
    await advance(0);
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT);
  });

  it('flags a click that arrives on a poll as New and removes the flag after the highlight window', async () => {
    const responses = [snapshot(), newClickSnapshot()];
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify(responses.shift() ?? newClickSnapshot()), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    expect(screen.queryByText('New')).toBeNull();

    await advance(POLL_MS);
    expect(screen.getByText('New')).toBeTruthy();

    await advance(6000);
    expect(screen.queryByText('New')).toBeNull();
  });

  it('cancels a pending New highlight timer on unmount', async () => {
    const responses = [snapshot(), newClickSnapshot()];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(responses.shift() ?? newClickSnapshot()), { status: 200 })),
    );
    const { unmount } = render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(POLL_MS);
    expect(screen.getByText('New')).toBeTruthy();
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT + 1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the relative time ticking while visible and pauses it while hidden', async () => {
    vi.stubGlobal('fetch', okFetch());
    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await advance(0);
    const label = () => screen.getByText(/s ago$/).textContent;
    const before = label();
    await advance(5000);
    expect(label()).not.toBe(before);

    setTabHidden(true);
    expect(vi.getTimerCount()).toBe(0);
    setTabHidden(false);
    // Let the refresh that coming back triggers finish, so only the two intervals remain.
    await advance(0);
    expect(vi.getTimerCount()).toBe(VISIBLE_TIMER_COUNT);
  });
});
