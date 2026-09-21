import type { Config } from 'tailwindcss';

const config: Config = {
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

        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--accent-strong) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        'accent-tint': 'rgb(var(--accent-tint) / <alpha-value>)',

        'cat-1': 'rgb(var(--cat-1) / <alpha-value>)',
        'cat-2': 'rgb(var(--cat-2) / <alpha-value>)',
        'cat-3': 'rgb(var(--cat-3) / <alpha-value>)',
        'cat-4': 'rgb(var(--cat-4) / <alpha-value>)',
        'cat-5': 'rgb(var(--cat-5) / <alpha-value>)',

        promo: 'rgb(var(--promo) / <alpha-value>)',
        'promo-soft': 'rgb(var(--promo-soft) / <alpha-value>)',
        'promo-tint': 'rgb(var(--promo-tint) / <alpha-value>)',

        coupon: 'rgb(var(--coupon) / <alpha-value>)',
        'coupon-soft': 'rgb(var(--coupon-soft) / <alpha-value>)',
        'coupon-tint': 'rgb(var(--coupon-tint) / <alpha-value>)',
        'coupon-ink': 'rgb(var(--coupon-ink) / <alpha-value>)',

        rating: 'rgb(var(--rating) / <alpha-value>)',
        'lab-soft': 'rgb(var(--lab-soft) / <alpha-value>)',
        'lab-ink': 'rgb(var(--lab-ink) / <alpha-value>)',

        ok: 'rgb(var(--ok) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',

        // One-off literal colour requested for the footer border, fixed in both
        // themes, unlike the semantic `line` token above.
        'footer-border': '#90908D',
      },
      borderRadius: { card: '1.25rem', panel: '2rem', pill: '9999px', chip: '0.75rem', box: '50px', bar: '20px' },
      // Exact-pixel gutters requested for the newsletter panel and the boxed footer,
      // kept as tokens (rather than arbitrary `[100px]` values) so they stay reusable.
      // '30' is '100' cut by 70%, for the footer's margin after it read as too wide.
      spacing: { '30': '30px', '100': '100px' },
      fontFamily: {
        sans: ['var(--font-body)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        icon: ['FontAwesome', 'dashicons', 'sans-serif'],
      },
      fontSize: {
        // For the mini watchlist-count badge, smaller than `micro`, so it still fits the h-4 pill.
        nano: ['0.5625rem', { lineHeight: '0.75rem', letterSpacing: '0.02em' }],
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
        // Exact 130px requested for the "PEPLOOKUP" loading-screen wordmark on laptop-size
        // screens and up; smaller breakpoints use the ordinary type scale instead.
        splash: ['130px', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      maxWidth: { shell: '80rem' },
      // Mobile menu panel: viewport minus the sticky header and a bottom gap,
      // so the last link is never hidden behind the browser's toolbar.
      maxHeight: { menu: 'calc(100dvh - 6rem)' },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.03), 0 10px 24px -16px rgb(0 0 0 / 0.16)',
        lift: '0 4px 10px -4px rgb(0 0 0 / 0.06), 0 24px 44px -20px rgb(0 0 0 / 0.22)',
        panel: '0 2px 6px -2px rgb(0 0 0 / 0.05), 0 40px 70px -30px rgb(0 0 0 / 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
