import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens only. Values live in globals.css so light/dark swap
        // in one place rather than via per-element `dark:` variants.
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',

        brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-strong': 'rgb(var(--brand-strong) / <alpha-value>)',
        'brand-soft': 'rgb(var(--brand-soft) / <alpha-value>)',
        'brand-tint': 'rgb(var(--brand-tint) / <alpha-value>)',

        promo: 'rgb(var(--promo) / <alpha-value>)',
        'promo-soft': 'rgb(var(--promo-soft) / <alpha-value>)',
        'promo-tint': 'rgb(var(--promo-tint) / <alpha-value>)',

        rating: 'rgb(var(--rating) / <alpha-value>)',
        'lab-soft': 'rgb(var(--lab-soft) / <alpha-value>)',
        'lab-ink': 'rgb(var(--lab-ink) / <alpha-value>)',

        ok: 'rgb(var(--ok) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      borderRadius: { card: '1rem', pill: '9999px', chip: '0.5rem' },
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
      },
      maxWidth: { shell: '80rem' },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
        lift: '0 4px 12px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
