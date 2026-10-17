// Adds Simms Research's product listings, as supplied from simmsresearch.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general lab-results page. Research Water's 10 ml is
// stored on the same `mg` field, matching the convention used for other vendors' water.
// No stock status was supplied, so listings take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?sr_ref=PEPLOOKUP';
const COA_PAGE = `https://simmsresearch.com/lab-results/${REF}`;
const upload = (file) => `https://simmsresearch.com/wp-content/uploads/${file}`;
const product = (slug) => `https://simmsresearch.com/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 6900, imageUrl: upload('2026/06/product-bpc-157-product-card-v03.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 10900, imageUrl: upload('2026/06/product-bpc-157-20mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },

  { productSlug: 'tb-500', mg: 10, priceCents: 6600, imageUrl: upload('2026/09/product-tb-500-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 3800, imageUrl: upload('2026/06/product-ghk-cu-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 5600, imageUrl: upload('2026/06/product-ghk-cu-100mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },

  { productSlug: 'retatrutide', mg: 10, priceCents: 8400, imageUrl: upload('2026/06/product-glp-3-rt-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12900, imageUrl: upload('2026/06/product-retatrutide-20mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 15900, imageUrl: upload('2026/06/product-retatrutide-30mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 25900, imageUrl: upload('2026/06/product-retatrutide-60mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('retatrutide') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 6500, imageUrl: upload('2026/07/ChatGPT-Image-Jul-7-2026-07_17_45-PM.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 9500, imageUrl: upload('2026/07/product-tirzepatide-20mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 15500, imageUrl: upload('2026/07/product-tirzepatide-30mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 18600, imageUrl: upload('2026/07/product-tirzepatide-60mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },

  { productSlug: 'ipamorelin', mg: 10, priceCents: 5400, imageUrl: upload('2026/06/product-ipamorelin-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 9500, imageUrl: upload('2026/06/product-tesamorelin-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 15800, imageUrl: upload('2026/06/product-tesamorelin-20mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },

  { productSlug: 'sermorelin', mg: 10, priceCents: 7800, imageUrl: upload('2026/06/product-sermorelin-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },

  { productSlug: 'nad', mg: 500, priceCents: 7600, imageUrl: upload('2026/06/product-nad-plus-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 10400, imageUrl: upload('2026/06/product-nad-1000mg-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('nad') },

  { productSlug: 'mots-c', mg: 10, priceCents: 6500, imageUrl: upload('2026/06/product-mots-c-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3900, imageUrl: upload('2026/06/product-epithalon-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 4500, imageUrl: upload('2026/06/product-semax-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 4500, imageUrl: upload('2026/06/product-selank-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 4400, imageUrl: upload('2026/09/product-pt-141-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5800, imageUrl: upload('2026/09/product-ss-31-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 10, priceCents: 5100, imageUrl: upload('2026/06/product-dsip-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 6900, imageUrl: upload('2026/06/product-glutathione-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'melanotan-1', mg: 10, priceCents: 4500, imageUrl: upload('2026/06/product-melanotan-i-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('melanotan-i') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4500, imageUrl: upload('2026/06/product-melanotan-ii-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii') },

  { productSlug: 'glow', mg: 70, priceCents: 9600, imageUrl: upload('2026/06/ChatGPT-Image-Jul-5-2026-11_51_52-AM.png'), coaUrl: COA_PAGE, productUrl: product('glow-peptide') },
  { productSlug: 'klow', mg: 80, priceCents: 12200, imageUrl: upload('2026/06/ChatGPT-Image-Jul-5-2026-11_37_57-AM.png'), coaUrl: COA_PAGE, productUrl: product('klow-peptide') },

  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2000, imageUrl: upload('2026/06/product-research-water-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('research-water') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 7800, imageUrl: upload('2026/06/ChatGPT-Image-Jul-4-2026-05_35_55-PM.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-nodac-ipamorelin') },

  { productSlug: 'wolverine', mg: 20, priceCents: 7900, imageUrl: upload('2026/09/product-wolverine-product-card-v01.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-peptide-stack') },
];

runSeed({ supplierSlug: 'simms-research', listings });
