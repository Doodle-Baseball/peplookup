# peplookup

Peptide price-comparison site. Normalizes vendor pricing to **cost per mg** across
many suppliers, with supplier profiles, product pages, COA/lab data, and calculators.

Reference notes on the site being modelled: `docs/peptidepricing-reference.md`
(incomplete — read its provenance warning before trusting anything in it).

**Stack:** Next.js (App Router) · TypeScript (strict) · Tailwind
> Assumed, not yet established — the repo is empty. Correct this line if wrong.

---

## Non-negotiables

1. **Never invent data.** No placeholder suppliers, fake prices, mock COAs, or
   invented review counts — not even temporarily. This site's entire value is that
   its numbers are real. A fake price that ships is a lie to a user making a
   purchase. Use empty states instead.
2. **No `any`.** If a type is hard, model it properly or use `unknown` + a narrowing
   guard.
3. **Server Components by default.** Add `"use client"` only when you need state,
   effects, or event handlers — and push it to the leaf, not the page.
4. **Money and dosage are never floats in logic.** Store integer cents and integer
   micrograms. Convert at the render boundary only. Floating point on prices
   produces `$12.340000000000001` and wrong "cheapest vendor" results.

---

## Domain rules

### Price per mg
The core primitive. Get it wrong and the whole site is wrong.

- `pricePerMg = priceInCents / (vialMg * vialCount)` — always account for multipacks.
- Compare at **full precision**; round only for display. Rounding first creates ties
  that aren't ties.
- A discounted price and a list price are different fields. Never overwrite one with
  the other; show both when a discount is active.
- Out-of-stock items must not win a "best price" comparison. Filter before ranking.
- Always show the unit. `$4.20` is meaningless; `$4.20/mg` is the product.

### Data freshness
Prices go stale and stale prices are worse than no prices.

- Every price carries a `scrapedAt`. Surface it — "updated 2h ago".
- Past a staleness threshold, mark it visibly rather than silently serving old data.
- Never render a price without the vendor attached to it.

### Affiliate & outbound links
- `rel="sponsored noopener"` on monetized outbound links, `target="_blank"`.
- Disclose the affiliate relationship where required. Do not bury it.
- Ranking must be by price/quality, never by commission. If that ever changes, it
  must be disclosed on the page.

### Health-adjacent content (YMYL)
This is research-chemical content and gets held to a higher bar by both search
engines and the law.

- Keep the research-use-only disclaimer present on tool and product pages.
- Never write dosing copy that reads as medical advice. Calculators compute; they
  do not recommend.
- Do not make purity or safety claims the COA doesn't support.

---

## Frontend standards

### Components
- Small, one job each. If it needs a comment to explain what it renders, split it.
- Colocate: `components/supplier-card/` holds the component, its types, its test.
- Props are explicit. No prop-drilling more than two levels — restructure or use
  context.
- No barrel files (`index.ts` re-exports) — they wreck tree-shaking and create
  circular imports.

### Styling
- Tailwind utilities inline. No parallel CSS-module system.
- Design tokens in `tailwind.config` — spacing, color, radius. **No arbitrary values
  in components** (`p-[13px]`, `text-[#3a7d44]`). If a value isn't a token, either it
  should be, or the design is off-grid.
- Conditional classes via `cn()`/`clsx`, never string concatenation.
- Dark mode: use semantic tokens (`bg-surface`, `text-muted`), not `dark:` variants
  scattered per element.

### State & data
- URL is the source of truth for filters, sort, pagination, and comparison
  selections. A user must be able to share a filtered comparison as a link.
- `useState` for local UI. Reach for a store only when genuinely shared.
- No `useEffect` for data fetching in Server Component land. Fetch on the server.
- Debounce search input (~300ms). Cancel in-flight requests on change.

### Every list needs four states
Loading · empty · error · loaded. Build all four. "Empty" is the one that always
gets skipped and it is the one users hit on a filtered comparison.

### Accessibility
- Semantic HTML first. A `<div onClick>` is a bug — use `<button>`.
- Every interactive element reachable and operable by keyboard; visible focus ring.
- Icon-only buttons need `aria-label`.
- Tables of price data are `<table>` with real `<th scope>` — screen readers and
  SEO both depend on it.
- Contrast ≥ 4.5:1 for body text. Check the muted grays; they usually fail.
- Never convey meaning by color alone — "in stock" green needs text or an icon too.

### Performance
- `next/image` always, with explicit dimensions. Supplier logos are the main CLS risk.
- Static-render what can be static; this site is mostly read-only data.
- Paginate or virtualize long vendor tables. Don't ship 500 rows.
- Watch bundle size on client components — a chart library in a leaf card is how
  pages get slow.

### SEO
Programmatic routes are the traffic engine here; treat them as a first-class surface.

- Unique `title` + `description` per route via `generateMetadata`. Never templated
  duplicates.
- JSON-LD: `Product` + `Offer` on product pages, `Organization` on supplier pages,
  `BreadcrumbList` throughout.
- One `<h1>` per page. Heading levels in order.
- Canonical URLs on anything reachable by multiple paths (filter/sort params).
- `sitemap.ts` and `robots.ts` generated from real data, not hand-maintained.

---

## Code style

- Descriptive names. `pricePerMg`, not `ppm`. `isLoadingSuppliers`, not `loading2`.
- Early returns over nested conditionals.
- Comments explain **why**, never what. Delete commented-out code.
- Errors: handle or propagate. Never `catch {}` silently.
- Validate all external data (scrapers, APIs, params) with Zod at the boundary.
- Keep functions pure where practical — especially price math, which must be
  trivially testable.

## Testing

- Unit-test the price math exhaustively: multipacks, discounts, zero/null mg,
  missing price, currency edges. This is where real bugs cost users money.
- Test components by behavior, not implementation. Query by role and label.
- Run typecheck + lint before considering anything done.

## Git

- Small, focused commits with a real message. Explain why in the body.
- Branch off `main`. Never commit secrets, `.env`, or scraped raw dumps.
