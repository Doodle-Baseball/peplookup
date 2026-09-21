// Adds Axis Peptide Labs' product listings, as supplied from axispeptidelabs.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://axispeptidelabs.com/wp-content/uploads/${path}`;
const product = (path) => `https://axispeptidelabs.com/product/${path}/?ref=peplookup`;

// Prices in integer cents, sizes in mg (a blend's total). inStock: false where the listing was
// supplied as out of stock. coaUrl is null where no certificate was supplied (this vendor has no
// general COA page to fall back to).
//
// The vendor's Retatrutide 20mg and Semaglutide 20mg were supplied with no price at all (both
// already out of stock) and are left out rather than guessing a price.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 5100, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/bpc157-5mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: upload('2026/02/AXIS-COA-BPC5.webp'), productUrl: product('bpc-157-5mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 6800, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/bpc157-10mg-navy-fine-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/02/AXIS-COA-BPC5.webp'), productUrl: product('bpc-157-5mg') },
  { productSlug: 'tb-500', mg: 5, priceCents: 6800, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/tb500-5mg-navy.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/02/AXIS-COA-TB5.webp'), productUrl: product('tb-500-5mg') },
  // 5 mg BPC-157 + 5 mg TB-500 and 10 mg + 10 mg, supplied under the Wolverine compound only.
  { productSlug: 'wolverine', mg: 10, priceCents: 9500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/wolverine-10mg-navy.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-WOLV10-FD.webp'), productUrl: product('wolverine-10mg-bpc-5mg-tb500-5mg') },
  { productSlug: 'wolverine', mg: 20, priceCents: 16500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/wolverine-20mg-navy-fine-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-WOLV10-FD.webp'), productUrl: product('wolverine-10mg-bpc-5mg-tb500-5mg') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 5500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/ghk-cu-50mg-navy-v1.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-GHKCu50-FD.webp'), productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 7900, inStock: false, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/ghk-cu-50mg-navy-v1.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-GHKCu50-FD.webp'), productUrl: product('ghk-cu-50mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp3rt-10mg-navy-fine-v3.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-RT10-APL.pdf'), productUrl: product('rt-glp3-reference') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 16900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp3rt-30mg-navy-fine-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-RT30-FD-v2.webp'), productUrl: product('rt-glp3-reference') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 29900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp3rt-60mg-navy-fine-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-RT30-FD-v2.webp'), productUrl: product('rt-glp3-reference') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 7900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp2tz-10mg-tirzepatide-v3.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-TZ10-APL.pdf'), productUrl: product('tirz-dual-agonist') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 12500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp2tz-20mg-tirzepatide-v3.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/02/AXIS-COA-TIRZ20.webp'), productUrl: product('tirz-dual-agonist') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 15900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp2tz-30mg-tirzepatide-v3.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/02/AXIS-COA-TIRZ20.webp'), productUrl: product('tirz-dual-agonist') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 10000, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glp1-10mg-navy-fine-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/02/AXIS-COA-SM10.webp'), productUrl: product('sema-glp1-analog') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 14600, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/tesa-10mg-navy-fine-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/02/AXIS-COA-TSM10.webp'), productUrl: product('tesamorelin-10mg') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 10000, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/sermorelin-5mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: null, productUrl: product('sermorelin-5mg') },
  { productSlug: 'nad', mg: 500, priceCents: 7900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/nad-500mg-navy.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-NAD500-FD.webp'), productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 5500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/motsc-10mg-navy-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-MOTSC10-FD-v2.webp'), productUrl: product('mots-c-10mg') },
  { productSlug: 'semax', mg: 5, priceCents: 6200, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/semax-5mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: upload('2026/02/AXIS-COA-XA10.webp'), productUrl: product('semax-10mg') },
  { productSlug: 'selank', mg: 5, priceCents: 6200, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/selank-5mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: null, productUrl: product('selank-5mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 5500, inStock: false, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/pt141-10mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: null, productUrl: product('pt-141-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 10400, inStock: false, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/ss31-10mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: null, productUrl: product('ss-31-10mg') },
  { productSlug: 'glutathione', mg: 600, priceCents: 6200, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/gluta-600mg-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: null, productUrl: product('glutathione-600mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4500, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/melanotan2-navy-fine-v2.jpg?resize=764%2C1024&ssl=1', coaUrl: upload('2026/09/AXIS-COA-MT2-10-APL.pdf'), productUrl: product('mt-2-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 9900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/cjc-ipamorelin-navy-v1.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-CJC10-FD.webp'), productUrl: product('ltf-cj-10') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 11900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/glow-70mg-navy-reta-v5.jpg?fit=1045%2C1400&ssl=1', coaUrl: upload('2026/09/AXIS-COA-GLOW70-FD.webp'), productUrl: product('ltf-ow-70') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 12900, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/klow-80mg-navy-reta-v5.jpg?resize=764%2C1024&ssl=1', coaUrl: upload('2026/09/AXIS-COA-KLOW80-FD.webp'), productUrl: product('ltf-kl-80') },
  // Listed by the vendor as "Reconstitution Solution", a "Solution"; stored as a vial like other
  // vendors' water, sizes in mL on the same scale the admin form uses for mL sizes. Both sizes
  // link to the same product page, as supplied.
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 1400, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/08/recon-3ml-navy-v1.jpg?fit=1045%2C1400&ssl=1', coaUrl: null, productUrl: product('bac-water-3ml') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2300, imageUrl: 'https://i0.wp.com/axispeptidelabs.com/wp-content/uploads/2026/09/recon-10ml-navy-v2.jpg?fit=1045%2C1400&ssl=1', coaUrl: null, productUrl: product('bac-water-3ml') },
];

runSeed({ supplierSlug: 'axis-peptide-labs-2', listings });
