// Adds Pure Amino's product listings, as supplied from pureamino.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Prices in integer cents, sizes in mg per vial. coaUrl is null where the
// vendor publishes no certificate for that size.
const listings = [
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 3999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/bpc-157-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/bpc-157-10mg-PA25080201.png',
    productUrl: 'https://www.pureamino.com/product/bpc-157/?ref=PRODUCTS',
  },
  {
    productSlug: 'tb-500',
    mg: 10,
    priceCents: 3999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/tb-500-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/tb-500-10mg-PA25060201.png',
    productUrl: 'https://www.pureamino.com/product/tb-500/?ref=PRODUCTS',
  },
  {
    productSlug: 'ghk-cu',
    mg: 50,
    priceCents: 2999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/04/ghk-cu-50mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/ghk-cu-50mg-PA25020101.png',
    productUrl: 'https://www.pureamino.com/product/ghk-cu/?ref=PRODUCTS',
  },
  {
    productSlug: 'ghk-cu',
    mg: 100,
    priceCents: 5499,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/04/ghk-cu-100mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/ghk-cu-100mg-PA25050102.png',
    productUrl: 'https://www.pureamino.com/product/ghk-cu/?ref=PRODUCTS',
  },
  {
    // Sold by Pure Amino as "GLP-3".
    productSlug: 'retatrutide',
    mg: 10,
    priceCents: 6999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/04/glp-3rt-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/glp-3-10mg-PA26011401.png',
    productUrl: 'https://www.pureamino.com/product/glp-3/?ref=PRODUCTS',
  },
  {
    productSlug: 'retatrutide',
    mg: 30,
    priceCents: 17999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/04/glp-3rt-30mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/glp-3-30mg-PA26021502.png',
    productUrl: 'https://www.pureamino.com/product/glp-3/?ref=PRODUCTS',
  },
  {
    productSlug: 'ipamorelin-cjc-1295-no-dac',
    mg: 10,
    priceCents: 5999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/cjc-1295-ipamorelin-10mg-0001.png',
    coaUrl: null,
    productUrl: 'https://www.pureamino.com/product/cjc-1295-ipamorelin/?ref=PRODUCTS',
  },
  {
    productSlug: 'mots-c',
    mg: 10,
    priceCents: 3999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/mots-c-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/mots-c-10mg-PA25030201.png',
    productUrl: 'https://www.pureamino.com/product/mots-c/?ref=PRODUCTS',
  },
  {
    productSlug: 'mots-c',
    mg: 30,
    priceCents: 9999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/mots-c-30mg-0001.png',
    coaUrl: null,
    productUrl: 'https://www.pureamino.com/product/mots-c/?ref=PRODUCTS',
  },
  {
    productSlug: 'nad',
    mg: 500,
    priceCents: 6999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/nad-500mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/nad-500mg-PA-NAD-002.pdf',
    productUrl: 'https://www.pureamino.com/product/nad/?ref=PRODUCTS',
  },
  {
    productSlug: 'tesamorelin',
    mg: 10,
    priceCents: 6999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/tesamorelin-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/tesamorelin-10mg-PA-TES-002.pdf',
    productUrl: 'https://www.pureamino.com/product/tesamorelin/?ref=PRODUCTS',
  },
  {
    productSlug: 'semax',
    mg: 10,
    priceCents: 2999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/semax-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/semax-10mg-PA25070501.png',
    productUrl: 'https://www.pureamino.com/product/semax/?ref=PRODUCTS',
  },
  {
    productSlug: 'selank',
    mg: 10,
    priceCents: 2999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/selank-10mg-0001.png',
    coaUrl: null,
    productUrl: 'https://www.pureamino.com/product/selank/?ref=PRODUCTS',
  },
  {
    productSlug: 'pt-141',
    mg: 10,
    priceCents: 2999,
    imageUrl: 'https://www.pureamino.com/wp-content/uploads/2026/05/pt-141-10mg-0001.png',
    coaUrl: 'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/pt-141-10mg-PA25021602.png',
    productUrl: 'https://www.pureamino.com/product/pt-141/?ref=PRODUCTS',
  },
];

runSeed({ supplierSlug: 'pure-amino-2', listings });
