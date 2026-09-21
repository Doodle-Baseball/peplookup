/**
 * Curated running order for compounds, most-wanted first. Drives the default
 * ("Featured") card order on the home page and the search box's recommended
 * list, so both present the catalogue in the same sequence.
 *
 * Anything not listed here sorts after everything listed, alphabetically, so a
 * newly added compound still appears rather than silently dropping out.
 */
export const COMPOUND_ORDER: readonly string[] = [
  'bpc-157',
  'tb-500',
  'tirzepatide',
  'semaglutide',
  'retatrutide',
  'ghk-cu',
  'cjc-1295-no-dac',
  'ipamorelin',
  'cagrilintide',
  'tesamorelin',
  'melanotan-2',
  'mots-c',
  'ss-31-elamipretide',
  'nad',
  'semax',
  'pt-141',
  'sermorelin',
  'ahk-cu',
  'ghrp-2',
  'selank',
  'cagrisema',
  'mazdutide',
  'survodutide',
  'bpc-157-tb-500',
  'glow-ghk-cu-bpc-157-tb-500',
  'klow-bpc-157-tb-500-kpv-ghk-cu',
  'hexarelin',
  '5-amino-1mq',
  'epitalon',
  'glutathione',
  'dihexa',
  'dsip',
  'melanotan-i',
  'wolverine',
  'ipamorelin-cjc-1295-no-dac',
  'bacteriostatic-water',
];

const ORDER_INDEX = new Map(COMPOUND_ORDER.map((slug, index) => [slug, index]));

/** Position in the curated order; unlisted compounds sort to the end. */
export function compoundOrderIndex(slug: string): number {
  return ORDER_INDEX.get(slug) ?? Number.MAX_SAFE_INTEGER;
}

/** Curated order first, then anything unlisted alphabetically by name. */
export function byCompoundOrder<T extends { slug: string; name: string }>(a: T, b: T): number {
  return compoundOrderIndex(a.slug) - compoundOrderIndex(b.slug) || a.name.localeCompare(b.name);
}
