// Adds Dynotides' product listings, as supplied from dynotides.shop, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos and COA previews are both served from the vendor's catalog plugin.
const CATALOG = 'https://dynotides.shop/wp-content/plugins/dynotides-catalog/app';
const photo = (file) => `${CATALOG}/assets/${file}`;
const coa = (file) => `${CATALOG}/certificates/previews/${file}`;
const product = (path) => `https://dynotides.shop/research-catalog/${path}/?aff=31`;

// Prices in integer cents, sizes in mg (a blend's total). No stock status was supplied, so every
// listing defaults to in stock.
const listings = [
  // The vendor lists its 5 mg certificate for the 10 mg vial as well.
  { productSlug: 'bpc-157', mg: 5, priceCents: 3900, imageUrl: photo('bpc-157-5mg-BQ6dVZTa.webp'), coaUrl: coa('bpc-157-5mg-coa-js.webp'), productUrl: product('bpc-157-5mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 6000, imageUrl: photo('bpc-157-DYClf7by.webp'), coaUrl: coa('bpc-157-5mg-coa-js.webp'), productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 5, priceCents: 7800, imageUrl: photo('tb-500-5mg-Det7fXv1.webp'), coaUrl: coa('tb-500-5mg-coa-js.webp'), productUrl: product('thymosin-beta-4-tb500-5mg') },
  // The vendor lists its 50 mg certificate for the 100 mg vial as well.
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3800, imageUrl: photo('ghk-cu-50mg-LQQIp_VX.webp'), coaUrl: coa('ghk-cu-50mg-coa-fr4.webp'), productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 6000, imageUrl: photo('ghk-cu-jhCZIV9s.webp'), coaUrl: coa('ghk-cu-50mg-coa-fr4.webp'), productUrl: product('ghk-cu-100mg') },
  // 5 mg CJC-1295 (No DAC) + 5 mg Ipamorelin.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 8200, imageUrl: photo('cjc-ipamorelin-B9IuPis6.webp'), coaUrl: coa('cjc-ipamorelin-coa-js.webp'), productUrl: product('cjc-1295-no-dac-ipamorelin-5mg-5mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6800, imageUrl: photo('ipamorelin-MCdnatyd.webp'), coaUrl: coa('ipamorelin-coa-js.webp'), productUrl: product('ipamorelin-10mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7800, imageUrl: photo('tesamorelin-DjiC8mcX.webp'), coaUrl: coa('tesamorelin-coa-fr.webp'), productUrl: product('tesamorelin-10mg') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 10800, imageUrl: photo('sermorelin-BFNJaKup.webp'), coaUrl: coa('sermorelin-coa-js.webp'), productUrl: product('sermorelin-10mg') },
  // The vendor lists its 500 mg certificate for the 1000 mg vial as well.
  { productSlug: 'nad', mg: 500, priceCents: 7800, imageUrl: photo('nad-plus-500-DMq13KlY.webp'), coaUrl: coa('nad-plus-500-coa-js.webp'), productUrl: product('nad-plus-500mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 14800, imageUrl: photo('nad-plus-1000-CRHQ0zj2.webp'), coaUrl: coa('nad-plus-500-coa-js.webp'), productUrl: product('nad-plus-1000mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 6400, imageUrl: photo('mots-c-10mg-CKCbysO7.webp'), coaUrl: coa('mots-c-10mg-coa-js.webp'), productUrl: product('mots-c-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 6400, imageUrl: photo('epitalon-10mg-CSQRbc6F.webp'), coaUrl: coa('epitalon-10mg-coa-js.webp'), productUrl: product('epitalon-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 6800, imageUrl: photo('semax-fgiGTiDN.webp'), coaUrl: coa('semax-coa-js.webp'), productUrl: product('semax-10mg') },
  { productSlug: 'selank', mg: 10, priceCents: 6800, imageUrl: photo('selank-B4jTFDTx.webp'), coaUrl: coa('selank-coa-js.webp'), productUrl: product('selank-10mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 6400, imageUrl: photo('dsip-BV0i0dJ7.webp'), coaUrl: coa('dsip-10mg-coa-endo.webp'), productUrl: product('dsip-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4800, imageUrl: photo('melanotan-ii-jMW6W60B.webp'), coaUrl: coa('melanotan-ii-coa-js.webp'), productUrl: product('melanotan-ii-10mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 16800, imageUrl: photo('glow-blend-BCIMZdUM.webp'), coaUrl: coa('glow-blend-coa-js.webp'), productUrl: product('glow-blend-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 19800, imageUrl: photo('klow-blend-DWMX-f25.webp'), coaUrl: coa('klow-blend-coa-js.webp'), productUrl: product('klow-blend-80mg') },
];

runSeed({ supplierSlug: 'dynotides-2', listings });
