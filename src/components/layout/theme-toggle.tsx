'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@/components/icons/icons';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = (() => {
      try {
        return window.localStorage.getItem('peplookup:theme');
      } catch {
        return null;
      }
    })();
    const initial: Theme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem('peplookup:theme', theme);
    } catch {
      // Preference simply does not persist; the current view is still correct.
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-chip p-2 text-muted transition hover:bg-surface-sunken hover:text-content"
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
