'use client';

import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { CheckIcon, ChevronDownIcon } from '@/components/icons/icons';

export type CatalogFilterOption = {
  value: string;
  label: string;
  /** How many listings this option matches, shown beside its label when given. */
  count?: number;
};

const ALL_OPTION: CatalogFilterOption = { value: '', label: 'All' };

/**
 * Writes the chosen option into the URL's `paramName` param so the
 * server-rendered catalogue re-filters and the filtered view can be shared as
 * a link. An "All" option, which clears the param, always comes first.
 *
 * A custom listbox rather than a native <select>, because the browser draws a
 * native option list with OS colours that the theme can't reach.
 */
export function CatalogFilterSelect({
  label,
  paramName,
  options,
  value,
}: {
  label: string;
  paramName: string;
  options: readonly CatalogFilterOption[];
  value: string | undefined;
}) {
  const allOptions = [ALL_OPTION, ...options];
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    allOptions.findIndex((option) => option.value === (value ?? '')),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  // Long lists scroll, so keep the keyboard-highlighted option in view.
  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const open = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const choose = (index: number) => {
    setIsOpen(false);
    triggerRef.current?.focus();
    if (index === selectedIndex) return;

    const params = new URLSearchParams(window.location.search);
    const nextValue = allOptions[index]?.value;
    if (nextValue) params.set(paramName, nextValue);
    else params.delete(paramName);
    // A narrower list starts from its first page.
    params.delete('page');
    const queryString = params.toString();
    startTransition(() =>
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      }),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(allOptions.length - 1, index + 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(allOptions.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        return;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        return;
      case 'Tab':
        setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="inline-flex items-center gap-2 text-sm font-bold text-content">
      <span id={labelId}>{label}</span>
      {/* Hover opens it; click and keyboard still do, for touch screens and keyboard users. */}
      <div className="relative" onMouseEnter={() => !isOpen && open()} onMouseLeave={() => setIsOpen(false)}>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
          onClick={() => !isOpen && open()}
          onKeyDown={handleKeyDown}
          className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-line bg-accent-tint py-1.5 pl-3 pr-2.5 text-sm font-bold text-accent-strong transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {allOptions[selectedIndex]?.label}
          <ChevronDownIcon className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {/* Padding, not margin, spaces the list from the button so the pointer
            never leaves the hover area on its way down to an option. */}
        <div hidden={!isOpen} className="absolute right-0 top-full z-30 min-w-full pt-2">
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="themed-scrollbar max-h-72 overflow-y-auto rounded-chip border border-line bg-surface-raised p-1 shadow-lift"
          >
            {allOptions.map((option, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  // Keep focus on the trigger so the click isn't lost to a blur.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-4 whitespace-nowrap rounded-chip px-3 py-2 text-sm font-bold transition-colors',
                    index === activeIndex ? 'bg-accent-tint text-accent-strong' : 'text-content',
                  )}
                >
                  {option.label}
                  <span className="ml-auto flex items-center gap-2">
                    {option.count !== undefined ? (
                      <span className="min-w-6 rounded-pill bg-accent px-2 py-0.5 text-center text-xs font-black text-surface-raised">
                        {option.count}
                      </span>
                    ) : null}
                    <CheckIcon className={cn('h-4 w-4 text-accent-strong', !isSelected && 'invisible')} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
