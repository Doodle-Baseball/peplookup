// Adds Kylo Peptides's product listings, as supplied from kylopeptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general COA page. Bacteriostatic water sizes are in ml,
// stored on the same `mg` field, matching the convention used for other vendors' water.
// No stock status was supplied, so listings take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?wpam_id=72';
const COA_PAGE = `https://kylopeptides.com/coa/${REF}`;
const UPLOADS = 'https://kylopeptides.com/wp-content/uploads/2026/07/';
const product = (slug) => `https://kylopeptides.com/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 4995, imageUrl: `${UPLOADS}BPC-157-5mg-2.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 6995, imageUrl: `${UPLOADS}BPC-157-5mg-2.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },

  { productSlug: 'tb-500', mg: 10, priceCents: 6995, imageUrl: `${UPLOADS}TB-500-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('tb-500') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 3995, imageUrl: `${UPLOADS}GHK-Cu-50mg-2.webp`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 5995, imageUrl: `${UPLOADS}GHK-Cu-50mg-2.webp`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },

  { productSlug: 'retatrutide', mg: 10, priceCents: 8995, imageUrl: `${UPLOADS}GLP-3-RT-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 16995, imageUrl: `${UPLOADS}GLP-3-RT-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 22995, imageUrl: `${UPLOADS}GLP-3-RT-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 45995, imageUrl: `${UPLOADS}GLP-3-RT-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 9995, imageUrl: `${UPLOADS}GLP-2-TZ-10mg-1.png`, coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 24995, imageUrl: `${UPLOADS}GLP-2-TZ-10mg-1.png`, coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },

  { productSlug: 'ipamorelin', mg: 5, priceCents: 7995, imageUrl: `${UPLOADS}Ipamorelin-5mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 10995, imageUrl: `${UPLOADS}Ipamorelin-5mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 9995, imageUrl: `${UPLOADS}Tesamorelin-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },

  { productSlug: 'sermorelin', mg: 10, priceCents: 10995, imageUrl: `${UPLOADS}Sermorelin-10mg-4.webp`, coaUrl: COA_PAGE, productUrl: product('sermorelin') },

  { productSlug: 'nad', mg: 500, priceCents: 9995, imageUrl: `${UPLOADS}NAD-500mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 15995, imageUrl: `${UPLOADS}NAD-500mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('nad') },

  { productSlug: 'mots-c', mg: 10, priceCents: 6495, imageUrl: `${UPLOADS}MTOS-c-10mg.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 16995, imageUrl: `${UPLOADS}MTOS-c-10mg.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c') },

  { productSlug: 'epitalon', mg: 10, priceCents: 6995, imageUrl: `${UPLOADS}Epithalon-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('epithalon') },

  { productSlug: 'semax', mg: 10, priceCents: 4995, imageUrl: `${UPLOADS}SEMAX-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('semax') },

  { productSlug: 'selank', mg: 10, priceCents: 4995, imageUrl: `${UPLOADS}Selank-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('selank') },

  { productSlug: 'pt-141', mg: 10, priceCents: 4995, imageUrl: `${UPLOADS}PT-141-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('pt-141') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5995, imageUrl: `${UPLOADS}SS-31-10mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('ss-31') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 6995, imageUrl: `${UPLOADS}Melanotan-II-2.webp`, coaUrl: COA_PAGE, productUrl: product('melanotan-ii') },

  { productSlug: 'glow', mg: 70, priceCents: 15995, imageUrl: `${UPLOADS}GLOW-70mg-1.webp`, coaUrl: COA_PAGE, productUrl: product('glow') },

  { productSlug: 'klow', mg: 80, priceCents: 17995, imageUrl: `${UPLOADS}KLOW-80mg.webp`, coaUrl: COA_PAGE, productUrl: product('klow') },

  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2499, imageUrl: `${UPLOADS}Kylo-H2O-10ml.webp`, coaUrl: COA_PAGE, productUrl: product('kylo-h2o') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 2999, imageUrl: `${UPLOADS}Kylo-H2O-10ml.webp`, coaUrl: COA_PAGE, productUrl: product('kylo-h2o') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 8995, imageUrl: `${UPLOADS}CJC-1295-IPAMORELIN-10mg.webp`, coaUrl: COA_PAGE, productUrl: product('cjc-1295-ipamorelin-no-dac') },

  { productSlug: 'wolverine', mg: 10, priceCents: 7995, imageUrl: `${UPLOADS}Wolverine-Blend-5mg.webp`, coaUrl: COA_PAGE, productUrl: product('wolverine-blend') },
];

runSeed({ supplierSlug: 'kylo-peptides', listings });
