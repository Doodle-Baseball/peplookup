/**
 * Vial artwork in /public/compounds-images, by compound slug. Listed explicitly
 * rather than guessed from names: several files are spelled differently from
 * the compound (e.g. "Imanorelin.png" is the Ipamorelin vial, "Glutathinoe.png"
 * is Glutathione), so a fuzzy match would silently pick the wrong vial or none.
 * A compound with no entry simply shows no image.
 */
const COMPOUND_IMAGE_FILES: Readonly<Record<string, string>> = {
  '5-amino-1mq': '5-Amino-1MQ.png',
  'ahk-cu': 'AHK-Cu.png',
  'bacteriostatic-water': 'Bacteriostatic Water.png',
  'bpc-157': 'BPC-157.png',
  'bpc-157-tb-500': 'BPC-157+TB-500.png',
  cagrilintide: 'Cagrilintide.png',
  cagrisema: 'CagriSema.png',
  'cjc-1295-no-dac': 'CJC-1295.png',
  dihexa: 'Dihexa (2).png',
  dsip: 'DSIP.png',
  epitalon: 'Epitalon.png',
  'ghk-cu': 'GHK-Cu.png',
  'ghrp-2': 'GHRP-2.png',
  glow: 'Glow.png',
  glutathione: 'Glutathinoe.png',
  hexarelin: 'Hexarelin.png',
  ipamorelin: 'Imanorelin.png',
  'ipamorelin-cjc-1295-no-dac': 'Ipamorelin _ CJC-1295 (No DAC).png',
  klow: 'KLOW.png',
  'melanotan-i': 'Melanotan-1.png',
  'melanotan-2': 'Melanotan-2.png',
  'mots-c': 'MOTS-c.png',
  nad: 'NAD+.png',
  'pt-141': 'PT-141.png',
  retatrutide: 'Retatrutide.png',
  selank: 'Selank.png',
  semaglutide: 'Semaglutide.png',
  semax: 'Semax.png',
  sermorelin: 'Sermorelin.png',
  'ss-31-elamipretide': 'SS-31.png',
  survodutide: 'Survodutide.png',
  'tb-500': 'TB-500.png',
  tesamorelin: 'Tesamorelin.png',
  tirzepatide: 'Tirzepatide.png',
  wolverine: 'Wolverine.png',
};

/** Public URL of a compound's vial image, or null if none has been added. */
export function compoundImageSrc(slug: string): string | null {
  const file = COMPOUND_IMAGE_FILES[slug];
  return file ? `/compounds-images/${encodeURIComponent(file)}` : null;
}
