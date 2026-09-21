// Adds Bionova Peptides' product listings, as supplied from bionovapeptides.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://bionovapeptides.com/wp-content/uploads/${path}`;
const product = (path) => `https://bionovapeptides.com/product/${path}/?fpr=peplookup`;
// The same general lab results page was supplied for every listing.
const COA_PAGE = 'https://bionovapeptides.com/lab-results/';

// Prices in integer cents, sizes in mg (a blend's total). Every listing was supplied as in stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3999, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-BPC-157.avif'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 5999, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-TB-500.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  // 10 mg + 10 mg, sold by the vendor as "Wolverine" but supplied under the BPC-157 + TB-500 compound.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 9999, imageUrl: upload('2026/04/BIONOVA-PEPTIDES-PRODUCT-IMAGE-BPC-157-TB-500.avif'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-wolverine') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3500, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-GHK-Cu.avif'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 10000, imageUrl: upload('2026/09/bionova-peptides-product-image-rt-20.webp'), coaUrl: COA_PAGE, productUrl: product('glp3') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 3999, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-IPAMORELIN.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7500, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-TESAMORELIN.avif'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'nad', mg: 1000, priceCents: 9999, imageUrl: upload('2026/03/BIONOVA-PEPTIDES-PRODUCT-IMAGE-NAD-1000.avif'), coaUrl: COA_PAGE, productUrl: product('nad-1000mg') },
  { productSlug: 'mots-c', mg: 40, priceCents: 11999, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-MOTS-C.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'semax', mg: 10, priceCents: 3000, imageUrl: upload('2026/05/BIONOVA-PEPTIDES-PRODUCT-IMAGE-SEMAX.avif'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 5, priceCents: 3000, imageUrl: upload('2026/01/BIONOVA-PEPTIDES-PRODUCT-IMAGE-SELANK.webp'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 3999, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-PT-141.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: 'glutathione', mg: 600, priceCents: 3999, imageUrl: upload('2026/03/BIONOVA-PEPTIDES-PRODUCT-IMAGE-GLUTATHIONE.webp'), coaUrl: COA_PAGE, productUrl: product('glutathione-600mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6499, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-CJC-1295.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-ipamorelin-10-mg-blend') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 8999, imageUrl: upload('2025/12/BIONOVA-PEPTIDES-PRODUCT-IMAGE-GLOW.avif'), coaUrl: COA_PAGE, productUrl: product('glow') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, size in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 999, imageUrl: upload('2026/07/BIONOVA-PEPTIDES-PRODUCT-IMAGE-WATER.avif'), coaUrl: COA_PAGE, productUrl: product('bac-water-reconstitution-solution') },
];

runSeed({ supplierSlug: 'bionova-peptides-2', listings });
