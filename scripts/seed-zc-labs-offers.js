// Adds ZC Labs's product listings, as supplied from zclabs.shop,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// "10-vials kit" packs are stored as `count: 10` at the same per-vial `mg`, matching the
// convention used for other vendors' multi-vial packs.
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://zclabs.shop/coas/?ea_ref=products';
const UPLOADS = 'https://zclabs.shop/wp-content/uploads/';
const REF = '?ea_ref=products';
const product = (slug) => `https://zclabs.shop/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 2399, imageUrl: `${UPLOADS}2026/09/product-1862-20260905-023151.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, count: 10, priceCents: 19999, imageUrl: `${UPLOADS}2026/09/product-1862-20260905-023151.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },

  { productSlug: 'tb-500', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/09/product-1849-20260905-023453.png`, coaUrl: COA_PAGE, productUrl: product('tb-500-10mg') },
  { productSlug: 'tb-500', mg: 10, count: 10, priceCents: 27499, imageUrl: `${UPLOADS}2026/09/product-1849-20260905-023453.png`, coaUrl: COA_PAGE, productUrl: product('tb-500-10mg') },

  { productSlug: 'ghk-cu', mg: 100, priceCents: 2799, imageUrl: `${UPLOADS}2026/09/zc-ghk-cu-100mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, count: 10, priceCents: 14499, imageUrl: `${UPLOADS}2026/09/zc-ghk-cu-100mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },

  { productSlug: 'retatrutide', mg: 10, priceCents: 2899, imageUrl: `${UPLOADS}2026/09/zc-rt-10mg-vial.jpg`, coaUrl: COA_PAGE, productUrl: product('gl-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 6299, imageUrl: `${UPLOADS}2026/09/zc-rt-30mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('gl-rt') },
  { productSlug: 'retatrutide', mg: 10, count: 10, priceCents: 19999, imageUrl: `${UPLOADS}2026/09/zc-rt-10mg-vial.jpg`, coaUrl: COA_PAGE, productUrl: product('gl-rt') },
  { productSlug: 'retatrutide', mg: 30, count: 10, priceCents: 42499, imageUrl: `${UPLOADS}2026/09/zc-rt-30mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('gl-rt') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 1899, imageUrl: `${UPLOADS}2026/09/zc-tz-10mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('gl-tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 4299, imageUrl: `${UPLOADS}2026/09/zc-tz-30mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('gl-tz') },
  { productSlug: 'tirzepatide', mg: 10, count: 10, priceCents: 14499, imageUrl: `${UPLOADS}2026/09/zc-tz-10mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('gl-tz') },
  { productSlug: 'tirzepatide', mg: 30, count: 10, priceCents: 30499, imageUrl: `${UPLOADS}2026/09/zc-tz-30mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('gl-tz') },

  { productSlug: 'ipamorelin', mg: 10, priceCents: 2399, inStock: false, imageUrl: `${UPLOADS}2026/09/product-1848-20260905-023315.png.webp`, coaUrl: COA_PAGE, productUrl: `https://zclabs.shop/product/ipamorelin-10mg/${REF}#zc-rn-box` },
  { productSlug: 'ipamorelin', mg: 10, count: 10, priceCents: 19999, inStock: false, imageUrl: `${UPLOADS}2026/09/product-1848-20260905-023315.png.webp`, coaUrl: COA_PAGE, productUrl: `https://zclabs.shop/product/ipamorelin-10mg/${REF}#zc-rn-box` },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 4299, imageUrl: `${UPLOADS}2026/05/ChatGPT-Image-Sep-4-2026-10_09_46-PM.png.webp`, coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'tesamorelin', mg: 10, count: 10, priceCents: 35499, imageUrl: `${UPLOADS}2026/05/ChatGPT-Image-Sep-4-2026-10_09_46-PM.png.webp`, coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },

  { productSlug: 'nad', mg: 500, priceCents: 2999, imageUrl: `${UPLOADS}2026/09/zc-nad-500mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('nad-1000mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 4799, imageUrl: `${UPLOADS}2026/09/zc-nad-1000mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('nad-1000mg') },
  { productSlug: 'nad', mg: 500, count: 10, priceCents: 17499, imageUrl: `${UPLOADS}2026/09/zc-nad-500mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('nad-1000mg') },
  { productSlug: 'nad', mg: 1000, count: 10, priceCents: 31999, imageUrl: `${UPLOADS}2026/09/zc-nad-1000mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('nad-1000mg') },

  { productSlug: 'mots-c', mg: 10, priceCents: 2999, imageUrl: `${UPLOADS}2026/09/product-1854-20260905-023408.png.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },
  { productSlug: 'mots-c', mg: 40, priceCents: 5299, imageUrl: `${UPLOADS}2026/09/product-1854-20260905-023408.png.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },
  { productSlug: 'mots-c', mg: 10, count: 10, priceCents: 24999, imageUrl: `${UPLOADS}2026/09/product-1854-20260905-023408.png.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },
  { productSlug: 'mots-c', mg: 40, count: 10, priceCents: 44999, imageUrl: `${UPLOADS}2026/09/product-1854-20260905-023408.png.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },

  { productSlug: 'epitalon', mg: 50, priceCents: 3999, inStock: false, imageUrl: `${UPLOADS}2026/09/zc-epithalon-50mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: `https://zclabs.shop/product/epithalon-10mg/${REF}#zc-rn-box` },
  { productSlug: 'epitalon', mg: 50, count: 10, priceCents: 33999, inStock: false, imageUrl: `${UPLOADS}2026/09/zc-epithalon-50mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: `https://zclabs.shop/product/epithalon-10mg/${REF}#zc-rn-box` },

  { productSlug: 'semax', mg: 10, priceCents: 2399, imageUrl: `${UPLOADS}2026/09/product-1851-20260905-023441.png.webp`, coaUrl: COA_PAGE, productUrl: product('semax-5mg') },
  { productSlug: 'semax', mg: 10, count: 10, priceCents: 19999, imageUrl: `${UPLOADS}2026/09/product-1851-20260905-023441.png.webp`, coaUrl: COA_PAGE, productUrl: product('semax-5mg') },

  { productSlug: 'selank', mg: 10, priceCents: 2399, imageUrl: `${UPLOADS}2026/09/product-1852-20260905-023422.png.webp`, coaUrl: COA_PAGE, productUrl: product('selank-5mg') },
  { productSlug: 'selank', mg: 10, count: 10, priceCents: 19999, imageUrl: `${UPLOADS}2026/09/product-1852-20260905-023422.png.webp`, coaUrl: COA_PAGE, productUrl: product('selank-5mg') },

  { productSlug: '5-amino-1mq', mg: 50, priceCents: 3899, imageUrl: `${UPLOADS}2026/09/product-1860-20260905-040649.png.webp`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50mg') },
  { productSlug: '5-amino-1mq', mg: 50, count: 10, priceCents: 29499, imageUrl: `${UPLOADS}2026/09/product-1860-20260905-040649.png.webp`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50mg') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 4499, imageUrl: `${UPLOADS}2026/09/zc-ss-31-10mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, count: 10, priceCents: 37499, imageUrl: `${UPLOADS}2026/09/zc-ss-31-10mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },

  { productSlug: 'dsip', mg: 10, priceCents: 2799, imageUrl: `${UPLOADS}2026/09/product-1853-20260905-023250.png.webp`, coaUrl: COA_PAGE, productUrl: product('dsip-5mg') },
  { productSlug: 'dsip', mg: 10, count: 10, priceCents: 19999, imageUrl: `${UPLOADS}2026/09/product-1853-20260905-023250.png.webp`, coaUrl: COA_PAGE, productUrl: product('dsip-5mg') },

  { productSlug: 'glutathione', mg: 1500, priceCents: 4599, imageUrl: `${UPLOADS}2026/09/zc-glutathione-1500mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },
  { productSlug: 'glutathione', mg: 1500, count: 10, priceCents: 36000, imageUrl: `${UPLOADS}2026/09/zc-glutathione-1500mg-vial.jpg.webp`, coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },

  { productSlug: 'melanotan-i', mg: 10, priceCents: 1899, imageUrl: `${UPLOADS}2026/09/product-1858-20260905-023348.png.webp`, coaUrl: COA_PAGE, productUrl: product('melanotan-1-10mg') },
  { productSlug: 'melanotan-i', mg: 10, count: 10, priceCents: 15999, imageUrl: `${UPLOADS}2026/09/product-1858-20260905-023348.png.webp`, coaUrl: COA_PAGE, productUrl: product('melanotan-1-10mg') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 1899, imageUrl: `${UPLOADS}2026/09/product-1864-20260905-023355.png.webp`, coaUrl: COA_PAGE, productUrl: product('melanotan-2') },
  { productSlug: 'melanotan-2', mg: 10, count: 10, priceCents: 15999, imageUrl: `${UPLOADS}2026/09/product-1864-20260905-023355.png.webp`, coaUrl: COA_PAGE, productUrl: product('melanotan-2') },

  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 6499, imageUrl: `${UPLOADS}2026/09/product-1855-20260905-023321.png.webp`, coaUrl: COA_PAGE, productUrl: product('klow-80mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, count: 10, priceCents: 54999, imageUrl: `${UPLOADS}2026/09/product-1855-20260905-023321.png.webp`, coaUrl: COA_PAGE, productUrl: product('klow-80mg') },

  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 1799, inStock: false, imageUrl: `${UPLOADS}2026/09/product-1956-20260915-160356.png.webp`, coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-30ml') },
  { productSlug: 'bacteriostatic-water', mg: 30, count: 10, priceCents: 20999, inStock: false, imageUrl: `${UPLOADS}2026/09/product-1956-20260915-160356.png.webp`, coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-30ml') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 3299, imageUrl: `${UPLOADS}2026/09/product-1850-20260905-023228.png.webp`, coaUrl: COA_PAGE, productUrl: product('cjc-no-dac-ipamorelin-5mg-5mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, count: 10, priceCents: 27999, imageUrl: `${UPLOADS}2026/09/product-1850-20260905-023228.png.webp`, coaUrl: COA_PAGE, productUrl: product('cjc-no-dac-ipamorelin-5mg-5mg') },

  { productSlug: 'wolverine', mg: 20, priceCents: 5999, imageUrl: `${UPLOADS}2026/09/ChatGPT-Image-Sep-5-2026-11_53_47-AM.png.webp`, coaUrl: COA_PAGE, productUrl: product('wolverine-20mg') },
  { productSlug: 'wolverine', mg: 20, count: 10, priceCents: 44990, imageUrl: `${UPLOADS}2026/09/ChatGPT-Image-Sep-5-2026-11_53_47-AM.png.webp`, coaUrl: COA_PAGE, productUrl: product('wolverine-20mg') },
];

runSeed({ supplierSlug: 'zc-labs-2', listings });
