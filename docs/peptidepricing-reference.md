# PeptidePricing.com — Site Reference (INCOMPLETE)

**Target:** https://www.peptidepricing.com/
**Started:** 2026-09-04
**Status:** 🔴 **BLOCKED — site was never loaded.**

---

## ⚠️ READ THIS FIRST — Provenance

This document does **NOT** contain a review of the website. The site could not be
accessed from the session that created this file: the environment's network egress
policy returned `403` to every `CONNECT`, for every domain (a control request to
`example.com` failed identically). Both `WebFetch` and `curl` were blocked, three
separate times.

Everything below comes from **search-engine titles and meta descriptions only**.

| Label | Meaning |
|---|---|
| ✅ CONFIRMED | URL appeared in the search index — the page exists |
| 🟡 CLAIMED | Text from a meta description. Written by the site's own SEO tags. **Not verified against the live page.** May be stale or aspirational. |
| ❌ NOT CAPTURED | Not knowable without loading the page |

**No UI detail of any kind is recorded here** — no colors, popups, buttons, icons,
layout, hover states, animations, or interactions. Do not build against this file
as if it described the real design.

---

## 1. URL inventory ✅ CONFIRMED

These paths were returned by the search index, so the pages exist. Their internal
structure is unknown.

### Top level
| Path | Indexed title |
|---|---|
| `/` | Peptide Price Comparison — Compare 125+ Vendors by Cost per mg |
| `/suppliers` | Peptide Suppliers Directory \| Verified & Trusted Sources |
| `/lab-database` | Compare Peptide Prices Across Top Retailers \| Best Deals 2026 |
| `/lab-reports?supplier=<Name>` | e.g. `?supplier=Bioleno` → "Bioleno HPLC Lab Reports & COA Verification" |
| `/sales` | Peptide Sales & Coupon Codes — Updated Daily |
| `/tools` | Peptide Tools \| Calculators, COA Reader & Pricing Tools |
| `/blog` | Peptide Science Blog \| Research, News & Safety Insights |
| `/about` | About PeptidePricing \| The Transparent Peptide Comparison… |
| `/watchlist` | ❌ no indexed data |
| `/disclaimer` | ❌ no indexed data |

### Dynamic routes
| Pattern | Known slugs |
|---|---|
| `/suppliers/{slug}` | `glow-aminos`, `instant-peptides`, `gen-peptide`, `felix-chem`, `disguised-alpha`, `tegridy-research` |
| `/compare/{compound}` | `retatrutide`, `tirzepatide` |
| `/products/{slug}` | `klow` |
| `/tools/{tool}` | `price-checker`, `coa-reader` |

Supplier profile pages use the title pattern:
`"{name} | Supplier Profile & Reviews | Peptiprices | PeptidePricing"`
— note the **"Peptiprices"** string, which may indicate a rename or a shared template.

---

## 2. Scale claims 🟡 CLAIMED — and inconsistent

The site's own meta tags disagree with each other. Worth resolving:

- "125+ vetted vendors" (homepage)
- "100+ verified peptide suppliers" (suppliers directory)
- "40+ verified suppliers" (lab-database)
- "80+ compounds" (lab-database)

---

## 3. `/tools` 🟡 CLAIMED

Described as a *free, no-login* suite of calculators and verification tools.
Four tools are referenced:

| Tool | URL | Claimed function |
|---|---|---|
| Price Checker | `/tools/price-checker` ✅ | $/mg across vendors; stack up to 4 peptides side-by-side comparing dosage protocol, cost per mg, supplier rating, COA status |
| COA Reader | `/tools/coa-reader` ✅ | Read a Certificate of Analysis, identify red flags, verify HPLC / mass-spec / contaminant data |
| Reconstitution Calculator | ❌ URL unknown | Vial size + BAC water + target dose → syringe units. **Three modes: Find Units, Find Dose, Find BAC Water** |
| Intranasal Dosage Calculator | ❌ URL unknown | mcg per spray, sprays per bottle, cost per dose (Semax, Selank, PT-141) |

A disclaimer is claimed: research / educational / laboratory use only, not medical
advice, verify with third-party COA, consult a qualified professional.

> The "three modes" on the reconstitution calculator is the **only** structural UI
> hint recovered anywhere — probably a tab or segmented control. Unconfirmed.

---

## 4. Supplier attributes 🟡 CLAIMED

Attributes named across meta descriptions. **This is not a verified field list** —
it is vocabulary scraped from marketing copy, and the real card/page schema is unknown.

Mentioned: lab grade · trust score · shipping reliability · reputation · COA
verification status · Trustpilot reviews · product catalog · exclusive discount codes ·
price / cost per mg

One review snippet surfaced in the index:
> "Fast shipping and easy process. Like having the COAs available and the pricing during their sales is great."

Compounds named anywhere: BPC-157, TB-500, semaglutide, tirzepatide, retatrutide, Semax, Selank, PT-141, KLOW.

---

## 5. ❌ NOT CAPTURED — the actual work

Every item the reference was asked to contain is still outstanding:

**Supplier cards** — exact field list, order, badge types, rating scale/format,
truncation, empty & loading states, hover/active behavior.

**Supplier pages** — full section list, tab structure, review rendering, catalog
table columns, discount-code reveal mechanism, COA/lab-report presentation.

**Product pages** — price table columns, sorting/filtering, per-vendor row data,
$/mg calculation display, chart or history, CTA/affiliate link behavior.

**`/watchlist`** — entire page. Auth-gated? localStorage? Add/remove flow? Alerts?

**`/disclaimer`** — full legal text verbatim.

**Global UI** — nav structure, mobile menu, footer, every popup/modal/toast/cookie
banner, all button labels and variants, the full color palette (hex), typography
scale, icon set and source, spacing system, breakpoints, dark mode, animations,
search & filter controls, pagination, empty/error states.

---

## 6. How to finish this

In order of usefulness:

1. **Get the source into a repo.** Best by far — yields exact hex colors, every
   conditional popup, and the true data shape of supplier/product objects,
   including states that are hard to reach by clicking.
2. **Allow the domain in the environment network policy**
   (https://code.claude.com/docs/en/claude-code-on-the-web). Note the policy
   currently blocks *all* egress, so it likely needs widening generally.
   Chromium + Playwright are pre-installed and ready to drive the site.
3. **Saved HTML** (Ctrl+S → "Webpage, Complete") or screenshots pasted into a session.
