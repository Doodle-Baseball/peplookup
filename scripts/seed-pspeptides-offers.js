// Adds PSPeptides' listings, as supplied from pspeptides.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
//
// A "5mg 10-vials kit" is stored as `count: 10` at the same per-vial `mg`, the
// convention used for other vendors' multi-vial packs. Its price is the vendor's
// kit price: pspeptides.com takes 40% off every vial when 10+ of the same size
// are bought together. Bacteriostatic water stores ml on `mg`. The sheet gave
// no stock column, so every listing defaults to in stock.
const { runSeed } = require('./lib/seed-vendor-offers');

const SITE = 'https://pspeptides.com/';
const REF = '?ref=peplookup-com';
const UPLOADS = `${SITE}wp-content/uploads/`;
const COA_PAGE = `${SITE}certifications/${REF}`;
const KIT = 10;

/**
 * @param {string} productSlug compound slug on this site
 * @param {string} path the vendor's product page, without the ref
 * @param {string} image path under wp-content/uploads
 * @param {number} mg per vial (ml for water)
 * @param {number} priceCents
 * @param {{ form?: 'spray', count?: number }} [options]
 */
function listing(productSlug, path, image, mg, priceCents, options = {}) {
  return {
    productSlug,
    ...(options.form ? { form: options.form } : {}),
    mg,
    ...(options.count ? { count: options.count } : {}),
    priceCents,
    imageUrl: `${UPLOADS}${image}`,
    coaUrl: COA_PAGE,
    productUrl: `${SITE}product/${path}/${REF}`,
  };
}

/** One product page's single vials and 10-vial kits: `[mg, priceCents]` pairs. */
function vials(productSlug, path, image, singles, kits = []) {
  return [
    ...singles.map(([mg, priceCents]) => listing(productSlug, path, image, mg, priceCents)),
    ...kits.map(([mg, priceCents]) => listing(productSlug, path, image, mg, priceCents, { count: KIT })),
  ];
}

/** One spray product page: `[mg, priceCents]` pairs. */
function sprays(productSlug, path, image, sizes) {
  return sizes.map(([mg, priceCents]) => listing(productSlug, path, image, mg, priceCents, { form: 'spray' }));
}

const listings = [
  ...vials('bpc-157', 'buy-bpc-157', '2026/05/bpc10mg.png', [[5, 4999], [10, 8999]], [[5, 29994], [10, 53994]]),
  ...vials('tb-500', 'buy-tb-500', '2026/05/tb500-10mg.png', [[5, 4499], [10, 7999]], [[5, 26994], [10, 47994]]),
  // Sold as "Wolverine Blend"; the sheet names the compound BPC-157 + TB-500.
  ...vials('bpc-157-tb-500', 'buy-wolverine-blend', '2026/05/wolverine20mg.png', [[10, 5999], [20, 7999]], [[10, 35994], [20, 47994]]),
  ...vials('ghk-cu', 'buy-ghk-cu-peptide', '2026/05/ghk50mg.png', [[50, 3499], [100, 4499]], [[50, 20994], [100, 26994]]),
  ...sprays('ghk-cu', 'buy-ghk-cu-spray', '2026/07/GHK-SPRAY.png', [[50, 4999]]),
  ...vials(
    'retatrutide',
    'buy-retatrutide',
    '2026/05/rt30mg.png',
    [[5, 3999], [10, 7499], [15, 8999], [20, 10499], [30, 14499], [40, 16499], [50, 19999], [60, 22999], [100, 32999]],
    [[5, 23994], [10, 44994], [15, 53994], [20, 62994], [30, 86994], [40, 98994], [50, 119994], [60, 137994], [100, 197994]],
  ),
  ...vials(
    'tirzepatide',
    'buy-tirzepatide',
    '2026/06/tirz30mg.png',
    [[10, 5499], [15, 6499], [20, 7999], [30, 11499], [40, 14499], [50, 17499], [60, 19999], [100, 27999], [120, 32999]],
    [[10, 32994], [15, 38994], [20, 47994], [30, 68994], [40, 86994], [50, 104994], [60, 119994], [100, 167994], [120, 197994]],
  ),
  ...vials('semaglutide', 'buy-semaglutide', '2026/08/sema-10mg.png', [[10, 6499]], [[10, 38994]]),
  ...vials('cagrilintide', 'buy-cagrilintide', '2026/06/CAG-5mg-1.png', [[5, 8999], [10, 12599]], [[5, 53994], [10, 75594]]),
  ...vials('ipamorelin', 'buy-ipamorelin', '2026/05/ipa-5mg.png', [[5, 3999], [10, 4999]], [[5, 23994], [10, 29994]]),
  ...sprays('ipamorelin', 'buy-ipamorelin-spray', '2026/07/ipamorelin-spray.png', [[10, 5999]]),
  ...vials('tesamorelin', 'buy-tesamorelin', '2026/05/tesa5mg.png', [[5, 5999], [10, 8999], [20, 13999]], [[5, 32994], [10, 53994], [20, 83994]]),
  ...sprays('tesamorelin', 'buy-tesamorelin-spray', '2026/07/tesa-spray.png', [[10, 6999]]),
  ...vials('sermorelin', 'sermorelin-1-vial', '2026/05/sermorelin-10mg.png', [[10, 7999]], [[10, 47994]]),
  ...sprays('sermorelin', 'buy-sermorelin-spray', '2026/07/Sermorelin-spray.png', [[10, 5999]]),
  ...vials('nad', 'buy-nad', '2026/07/NAD-500mg.png', [[100, 2999], [500, 7999], [1000, 10599]], [[100, 17994], [500, 47994], [1000, 63594]]),
  ...sprays('nad', 'buy-nad-spray', '2026/07/NAD-Spray.png', [[500, 8999], [1000, 13999]]),
  ...vials('mots-c', 'buy-mots-c', '2026/05/motsc50mg.png', [[10, 6999], [50, 18999]], [[10, 41994], [50, 113994]]),
  ...sprays('mots-c', 'buy-mots-c-spray', '2026/07/MOTS-C-Spray.png', [[10, 4999], [50, 9999]]),
  ...vials('epitalon', 'buy-epitalon', '2026/05/epitalon50mg.png', [[10, 5999], [50, 12999]], [[10, 35994], [50, 77994]]),
  ...sprays('epitalon', 'buy-epitalon-spray', '2026/07/Epitalon-Spray.png', [[10, 5499], [50, 9999]]),
  ...vials('semax', 'semax-1-vial', '2026/05/semax11mg.png', [[11, 4299]], [[11, 25794]]),
  ...sprays('semax', 'buy-semax-nasal-spray', '2026/06/Semax-11mg-spray.png', [[11, 5599]]),
  ...vials('selank', 'buy-selank', '2026/05/selank11mg.png', [[11, 3299]], [[11, 19794]]),
  ...sprays('selank', 'buy-selank-nasal-spray', '2026/06/Selank-11mg-spray.png', [[11, 5599]]),
  ...vials('pt-141', 'buy-pt-141', '2026/05/pt141-10mg.png', [[10, 4499]], [[10, 26994]]),
  ...vials('5-amino-1mq', 'buy-5-amino-1mq', '2026/07/5AM-5mg.png', [[5, 3499], [10, 4999], [50, 6499]], [[5, 20994], [10, 29994], [50, 38994]]),
  ...vials('mazdutide', 'buy-mazdutide', '2026/07/maz5mg.png', [[5, 5499]], [[5, 32994]]),
  ...vials('ss-31-elamipretide', 'buy-ss-31-10mg', '2026/06/ss31-10mg.png', [[10, 6499], [50, 17999]], [[10, 38994]]),
  ...vials('dsip', 'buy-dsip', '2026/06/dsip-5mg.png', [[5, 3999], [10, 5499]], [[10, 32994]]),
  ...sprays('dsip', 'buy-dsip-nasal-spray', '2026/06/DSIP-NASALpng.png', [[5, 4499]]),
  ...vials('glutathione', 'buy-glutathione', '2026/06/glutathione-500mg.png', [[500, 2999], [1500, 6999]]),
  ...vials('ghrp-2', 'buy-ghrp-2', '2026/06/GHRP2-5mg.png', [[5, 2999], [10, 3999]], [[5, 17994], [10, 23994]]),
  ...vials('survodutide', 'buy-survodutide', '2026/07/survo5mg.png', [[5, 5499]], [[5, 32994]]),
  ...vials('hexarelin', 'buy-hexarelin', '2026/09/hexa.png', [[10, 5999]], [[10, 35994]]),
  ...vials('ahk-cu', 'buy-ahk-cu', '2026/07/ahkcu.png', [[50, 2999], [100, 4599]], [[50, 17994], [100, 27594]]),
  ...vials('cagrisema', 'buy-cagrisema', '2026/06/CagriSema-10mg-1.png', [[5, 5499], [10, 8999]], [[10, 53994]]),
  ...vials('melanotan-1', 'buy-melanotan-1', '2026/05/mt1-10mg.png', [[10, 3999]], [[10, 23994]]),
  ...sprays('melanotan-1', 'buy-melanotan-i-spray', '2026/06/MT1-spray.png', [[10, 4999]]),
  ...vials('melanotan-2', 'buy-melanotan-ii', '2026/05/mt2-10mg.png', [[10, 3999]], [[10, 23994]]),
  // "10mg (100 sprays, 100mcg/spray)".
  ...sprays('melanotan-2', 'buy-melanotan-ii-nasal-spray', '2026/06/MT2-spray.png', [[10, 4999]]),
  ...vials('cjc-1295-no-dac', 'cjc-1295-no-dac-1-vial', '2026/05/cjc-nodac-5mg.png', [[5, 3599], [10, 5999]], [[5, 21594]]),
  ...vials('glow', 'buy-glow-blend', '2026/05/glow70mg.png', [[70, 8499]], [[70, 50994]]),
  ...vials('klow', 'buy-klow-blend', '2026/05/klow80mg.png', [[80, 10999]], [[80, 65994]]),
  ...vials('bacteriostatic-water', 'bacteriostatic-water', '2025/11/bac-10mL.png', [[10, 1499]], [[10, 8999]]),
  ...vials(
    'ipamorelin-cjc-1295-no-dac',
    'buy-cjc-1295-ipamorelin-blend',
    '2026/05/cjcipa-10mg.png',
    [[10, 6599], [20, 9499]],
    [[10, 39594]],
  ),
  ...sprays('ipamorelin-cjc-1295-no-dac', 'buy-cjc-no-dac-ipamorelin-spray', '2026/07/CJCIPA-spray.png', [[10, 7499]]),
];

runSeed({ supplierSlug: 'pspeptides', listings });
