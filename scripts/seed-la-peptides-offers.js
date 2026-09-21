// Adds LA Peptides' product listings, as supplied from lapeptides.net, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://lapeptides.net/wp-content/uploads/${path}`;
const product = (path) => `https://lapeptides.net/product/${path}/?ref=products`;
const labTest = (path) => `https://lapeptides.net/lab-test/${path}/`;
// The vendor's general certificates page, supplied for TB500, GLOW and the water.
const CERTIFICATES_PAGE = 'https://lapeptides.net/product-certificates/';

// Prices in integer cents, sizes in mg (a capsule's or blend's total per unit). No listing was
// supplied as out of stock ("Listed" is treated the same as "In stock").
//
// The vendor's "BPC-157/TB500 Spray" was supplied with no size and is left out rather than
// guessing an amount.
const listings = [
  { productSlug: 'bpc-157', form: 'capsule', mg: 0.5, priceCents: 8999, imageUrl: upload('2025/09/bpc-157-capsules-updated.jpg'), coaUrl: upload('2025/06/bpc_157_LAPe2509150143.png'), productUrl: product('bpc-157-capsules') },
  { productSlug: 'tb-500', mg: 10, priceCents: 7999, imageUrl: upload('2025/11/TB500-768x768.png'), coaUrl: CERTIFICATES_PAGE, productUrl: product('tb500') },
  // 10 mg + 10 mg and 20 mg + 20 mg.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 6999, imageUrl: upload('2025/11/TB500-BPC-Blend-600x600.png'), coaUrl: labTest('bpc-tb500-blend'), productUrl: product('bpc-tb500-blend') },
  { productSlug: 'bpc-157-tb-500', mg: 40, priceCents: 12999, imageUrl: upload('2025/11/TB500-BPC-Blend-600x600.png'), coaUrl: labTest('bpc-tb500-blend'), productUrl: product('bpc-tb500-blend') },
  // 500 mcg BPC-157 + 500 mcg TB-500 per capsule.
  { productSlug: 'bpc-157-tb-500', form: 'capsule', mg: 1, priceCents: 14999, imageUrl: upload('2025/11/Repair-and-Fix.png'), coaUrl: labTest('repair-fix'), productUrl: product('repair-fix') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3999, imageUrl: upload('2025/11/GHK-Cu_1.png'), coaUrl: labTest('ghk-cu'), productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', form: 'capsule', mg: 2.5, priceCents: 7999, imageUrl: upload('2025/09/ghk-cu-capsules.jpg'), coaUrl: labTest('ghk-cu-capsules'), productUrl: product('ghk-cu-capsules') },
  // The vendor lists one certificate for all three LAP-3 (R) sizes.
  { productSlug: 'retatrutide', mg: 10, priceCents: 9499, imageUrl: upload('2026/05/lap-3-r-10mg.avif'), coaUrl: upload('2025/06/GLP3-R_10mg_COA3135-scaled.png'), productUrl: product('lap-3-r') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 16999, imageUrl: upload('2025/08/lap-3-r-20mg.avif'), coaUrl: upload('2025/06/GLP3-R_10mg_COA3135-scaled.png'), productUrl: product('lap-3-r') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 22999, imageUrl: upload('2026/05/lap-3r-30mg.avif'), coaUrl: upload('2025/06/GLP3-R_10mg_COA3135-scaled.png'), productUrl: product('lap-3-r') },
  // The vendor lists one certificate for both LAP-2 (T) sizes.
  { productSlug: 'tirzepatide', mg: 15, priceCents: 9999, imageUrl: upload('2026/05/lap-2-t-15mg.avif'), coaUrl: upload('2026/05/glp2-t-15mg-COA520-scaled.png'), productUrl: product('lap-2-t') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 16999, imageUrl: upload('2025/08/lap-2-t-30mg.avif'), coaUrl: upload('2026/05/glp2-t-15mg-COA520-scaled.png'), productUrl: product('lap-2-t') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7499, imageUrl: upload('2025/06/tesamorelin_10mg.jpg'), coaUrl: labTest('tesamorelin'), productUrl: product('tesamorelin') },
  { productSlug: 'mots-c', mg: 10, priceCents: 6999, imageUrl: upload('2025/06/MOTS-C_10mg-768x768.png'), coaUrl: labTest('mots-c'), productUrl: product('mots-c') },
  // 10 mg + 10 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 7499, imageUrl: upload('2025/06/CJC-NO-DAC-Ipamorelin-Blend-10mg.jpg'), coaUrl: labTest('cjc-no-dac-ipamorelin-blend'), productUrl: product('cjc-no-dac-ipamorelin-blend') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 8999, imageUrl: upload('2025/09/la_peptides_glow.jpg'), coaUrl: CERTIFICATES_PAGE, productUrl: product('glow') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, size in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1500, imageUrl: upload('2025/08/BAC-Water.jpg'), coaUrl: CERTIFICATES_PAGE, productUrl: product('bac-water') },
];

runSeed({ supplierSlug: 'la-peptides-2', listings });
