'use client';

import { useEffect, useRef, useTransition, type InputHTMLAttributes } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/** Wait this long after the last keystroke before re-querying, so every letter isn't its own request. */
const DEBOUNCE_MS = 250;

/**
 * A search input for server-rendered result pages that updates the results as
 * you type. It writes its value into the URL's `name` query param (the same
 * param the surrounding GET form submits), so the server page re-renders with
 * the new results; pressing Enter in the form still works as before. The input
 * stays uncontrolled, so a re-render never fights the cursor mid-word.
 */
export function LiveSearchInput({
  name,
  ...inputProps
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> & { name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const push = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    const trimmed = value.trim();
    if (trimmed) params.set(name, trimmed);
    else params.delete(name);
    // A new query starts from the first page of results.
    params.delete('page');
    const qs = params.toString();
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false }));
  };

  return (
    <input
      {...inputProps}
      name={name}
      type="search"
      onChange={(event) => {
        const value = event.target.value;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => push(value), DEBOUNCE_MS);
      }}
    />
  );
}
