/**
 * Content v2: the supplier, coupon and review page changes that replace
 * repeated text with facts true only for that supplier. Everything is behind
 * one switch, the CONTENT_V2 environment variable: anything but "true" renders
 * every page exactly as before, so the change can be undone in Vercel without
 * a new deploy.
 */
export function isContentV2(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.CONTENT_V2 === 'true';
}

/**
 * Supplier pages whose content and SEO the site owner wrote by hand. Their
 * supplier page is never changed by content v2 (no summary, no hidden
 * sections, no title edits, no FAQ limit); their coupon and review pages
 * still are. Add or remove slugs here.
 */
export const PROTECTED_SUPPLIERS: ReadonlySet<string> = new Set([
  'ameano-peptides',
  'alpha-peptides',
  'amino-club',
  'royal-peptides',
  'ascension-peptides',
  'gen-peptide',
  'la-peptides',
  'american-peptides',
  'nextgen-peps',
  'apex-peptides',
  'true-peptides',
  'sparta-labs',
  'true-research-labs',
  'zestyrat',
  'renova-peptides',
  'bioinfinity',
  'puratek',
  'kalyx-labs',
  'elite-research-peptides',
  'northline-labs',
  'pure-peptides',
  'aero-peptides',
  'elite-edge-biotech',
  'peptixa-labs',
]);

/** Whether a supplier page gets the v2 content: the switch is on and the page isn't hand-written. */
export function supplierPageUsesContentV2(slug: string, env?: Readonly<Record<string, string | undefined>>): boolean {
  return isContentV2(env) && !PROTECTED_SUPPLIERS.has(slug);
}
