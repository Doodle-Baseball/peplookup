import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's default type scale. Without this, our
 * custom `text-micro` size is read as a text colour and silently dropped
 * whenever a colour class such as `text-muted` comes after it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['micro'] }],
    },
  },
});

/** Conditional classes. Never build class strings by concatenation. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
