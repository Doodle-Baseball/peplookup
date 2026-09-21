'use client';

import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';

/** One full run of the splash (1.4s hold + 0.5s fade) plus a short pause before it replays. */
const CYCLE_MS = 2600;

/** Remounts the real splash on a loop so the animation can be watched without reloading. */
export function LoadingPreview() {
  const [run, setRun] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRun((n) => n + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return <LoadingScreen key={run} />;
}
