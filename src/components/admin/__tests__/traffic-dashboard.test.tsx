// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
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
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(next), { status: 200 })));

    render(<TrafficDashboard initial={snapshot()} initialError={null} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });

    expect(screen.getAllByText('https://wa.me/12602181154').length).toBeGreaterThan(0);
    expect(screen.getByText('New')).toBeTruthy();
  });
});
