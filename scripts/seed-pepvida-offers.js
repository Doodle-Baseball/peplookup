// Adds Pepvida's product listings, as supplied from pepvida.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const photo = (file) => `https://pepvida.com/wp-content/themes/pepvida/assets/${file}`;
// Most certificates are on the vendor's COA site; two are WordPress uploads.
const coa = (file) => `https://pepvida-coas.pages.dev/${file}`;
const upload = (path) => `https://pepvida.com/wp-content/uploads/${path}`;
const product = (path) => `https://pepvida.com/product/${path}/?ref=peplookup`;

// Prices in integer cents, sizes in mg (a blend's total).
const listings = [
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 7201, imageUrl: photo('vial-heal-grey.jpg'), coaUrl: coa('heal.pdf'), productUrl: product('heal-bpc-157tb-500-10mg') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 4321, imageUrl: photo('vial-attract-grey.jpg'), coaUrl: upload('2026/08/PEPVIDA-GHK-CU-50-010526.pdf'), productUrl: product('attract-ghk-cu-50mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 8641, imageUrl: photo('vial-reset-grey.jpg'), coaUrl: coa('reset.pdf'), productUrl: product('reset-retatrutide-10mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 8626, imageUrl: photo('vial-activate-grey.jpg'), coaUrl: coa('activate.pdf'), productUrl: product('activate-mots-c') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 8641, imageUrl: photo('vial-amplify-grey.jpg'), coaUrl: coa('amplify.pdf'), productUrl: product('amplify-tesamorelin-10mg') },
  { productSlug: 'nad', mg: 500, priceCents: 7201, imageUrl: photo('vial-renew-grey.jpg'), coaUrl: coa('renew.pdf'), productUrl: product('renew-nad-500mg') },
  { productSlug: 'glutathione', mg: 1200, priceCents: 4321, imageUrl: photo('vial-detox-grey.jpg'), coaUrl: coa('detox.pdf'), productUrl: product('detox-l-glutathione-1200mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 14402, imageUrl: photo('vial-bloom-grey.jpg'), coaUrl: upload('2026/08/PEPVIDA-KLOW-80-032026.pdf'), productUrl: product('bloom-klow-80mg') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, sizes in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2160, imageUrl: photo('vial-water-grey.jpg'), coaUrl: coa('water.pdf'), productUrl: product('water-bacteriostatic-water-10ml-30ml') },
];

runSeed({ supplierSlug: 'pepvida-2', listings });
