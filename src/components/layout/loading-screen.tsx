'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/** How long the wordmark and progress bar hold before fading, and how long that fade takes. */
const HOLD_MS = 300;
const FADE_MS = 180;

/** Same curve as the bar's CSS fill, so the percentage tracks the bar exactly. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * One-time splash shown while the very first page of a visit loads: the
 * wordmark and a progress bar hold, then fade to reveal the real page
 * underneath. Mounted once in the root layout, so it never reappears on
 * client-side navigations between pages, only on a fresh load of the site.
 */
export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Reduced-motion visitors get the same reveal with none of the hold or fade.
    const skipMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdMs = skipMotion ? 0 : HOLD_MS;
    const fadeMs = skipMotion ? 0 : FADE_MS;

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = holdMs === 0 ? 1 : Math.min(1, (now - start) / holdMs);
      setPercent(Math.round(easeInOutCubic(progress) * 100));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const startFade = setTimeout(() => setHiding(true), holdMs);
    const unmount = setTimeout(() => setVisible(false), holdMs + fadeMs);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(startFade);
      clearTimeout(unmount);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface transition-opacity ease-out',
        hiding ? 'pointer-events-none opacity-0 duration-500' : 'opacity-100 duration-0',
      )}
    >
      <span className="animate-fade-up text-5xl font-black uppercase tracking-tight text-content sm:text-7xl lg:text-splash">
        PEPLOOKUP
      </span>

      <div className="animate-fade-up animate-delay-100 mt-8 w-56 sm:w-72">
        <div className="relative h-1 w-full overflow-hidden rounded-pill bg-line">
          <div
            className="loading-bar-fill absolute inset-0 overflow-hidden rounded-pill bg-accent"
            style={{ '--loading-duration': `${HOLD_MS}ms` } as React.CSSProperties}
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
          <span>Loading prices</span>
          <span className="tabular-nums text-content">{percent}%</span>
        </div>
      </div>
    </div>
  );
}
