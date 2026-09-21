// Adds Sparta Labs' product listings, as supplied from spartalabs.net, to the Supabase `offers`
// table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product renders are served from the vendor's R2 bucket.
const RENDERS = 'https://pub-94a8a169c8fd412599155d2f3e344ae3.r2.dev/renders/crimson/';
const render = (file) => `${RENDERS}${file}`;
const product = (path) => `https://spartalabs.net/us/products/${path}?aff=PEPLOOKUP`;
// The same general lab results page was supplied for every listing.
const COA_PAGE = 'https://spartalabs.net/us/lab-results';

// Prices in integer cents, sizes in mg (a blend's total). Every listing was supplied as in stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 5000, imageUrl: render('bpc-157-10mg.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 9000, imageUrl: render('bpc-157-20mg.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 5, priceCents: 6000, imageUrl: render('tb-500-tb4-10mg.png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 11500, imageUrl: render('tb-500-tb4-10mg.png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 20, priceCents: 16500, imageUrl: render('tb-500-tb4-10mg.png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  // 5 mg + 5 mg and 10 mg + 10 mg.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 8000, imageUrl: render('bpc-157-tb-500-blend-10mg.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend-5-5') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 13500, imageUrl: render('bpc-157-tb-500-blend-20mg.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend-10-10') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3000, imageUrl: render('ghk-cu-50mg.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4500, imageUrl: render('ghk-cu-100mg.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 8000, imageUrl: render('glp-3-rt-10mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12500, imageUrl: render('glp-3-rt-20mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 15500, imageUrl: render('glp-3-rt-30mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 22500, imageUrl: render('glp-3-rt-50mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 5000, imageUrl: render('glp-2-tz-10mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 7000, imageUrl: render('glp-2-tz-20mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 9000, imageUrl: render('glp-2-tz-30mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 50, priceCents: 13000, imageUrl: render('glp-2-tz-50mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 5000, imageUrl: render('glp-1-sg-10mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-1-sg') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 7000, imageUrl: render('glp-1-sg-20mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-1-sg') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 9000, imageUrl: render('glp-1-sg-30mg.png'), coaUrl: COA_PAGE, productUrl: product('glp-1-sg') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 11500, imageUrl: render('cagrilintide-10mg.png'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 20, priceCents: 21000, imageUrl: render('cagrilintide-20mg.png'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 3500, imageUrl: render('ipamorelin-5mg.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 5500, imageUrl: render('ipamorelin-10mg.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 7000, imageUrl: render('tesamorelin-5mg.png'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 12000, imageUrl: render('tesamorelin-10mg.png'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 22500, imageUrl: render('tesamorelin-20mg.png'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 8000, imageUrl: render('sermorelin-5mg.png'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 13500, imageUrl: render('sermorelin-10mg.png'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 6500, imageUrl: render('nad-1000mg.png'), coaUrl: COA_PAGE, productUrl: product('nad-plus') },
  { productSlug: 'nad', mg: 1000, priceCents: 11000, imageUrl: render('nad-1000mg.png'), coaUrl: COA_PAGE, productUrl: product('nad-plus') },
  { productSlug: 'mots-c', mg: 10, priceCents: 5000, imageUrl: render('mots-c-10mg.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 15500, imageUrl: render('mots-c-40mg.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 4000, imageUrl: render('epithalon-10mg.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'epitalon', mg: 40, priceCents: 12500, imageUrl: render('epithalon-40mg.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 13500, imageUrl: render('epithalon-50mg.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 5000, imageUrl: render('semax-10mg.png'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', mg: 30, priceCents: 11000, imageUrl: render('semax-30mg.png'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 5000, imageUrl: render('selank-10mg.png'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', mg: 30, priceCents: 11000, imageUrl: render('selank-30mg.png'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 4500, imageUrl: render('pt-141-10mg.png'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: 'mazdutide', mg: 5, priceCents: 10000, imageUrl: render('mazdutide-5mg.png'), coaUrl: COA_PAGE, productUrl: product('mazdutide') },
  { productSlug: 'mazdutide', mg: 10, priceCents: 17000, imageUrl: render('mazdutide-5mg.png'), coaUrl: COA_PAGE, productUrl: product('mazdutide') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 7500, imageUrl: render('ss-31-10mg.png'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 28000, imageUrl: render('ss-31-50mg.png'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 5, priceCents: 5500, imageUrl: render('dsip-5mg.png'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 10, priceCents: 9500, imageUrl: render('dsip-10mg.png'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 8000, imageUrl: render('glutathione-1500mg.png'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'ghrp-2', mg: 5, priceCents: 3000, imageUrl: render('ghrp-2-acetate-5mg.png'), coaUrl: COA_PAGE, productUrl: product('ghrp-2') },
  { productSlug: 'ghrp-2', mg: 10, priceCents: 4500, imageUrl: render('ghrp-2-acetate-5mg.png'), coaUrl: COA_PAGE, productUrl: product('ghrp-2') },
  { productSlug: 'hexarelin', mg: 5, priceCents: 7000, imageUrl: render('hexarelin-5mg.png'), coaUrl: COA_PAGE, productUrl: product('hexarelin') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5500, imageUrl: render('mt2-10mg.png'), coaUrl: COA_PAGE, productUrl: product('mt2') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 6500, imageUrl: render('cjc-1295-without-dac-5mg.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-without-dac') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 10500, imageUrl: render('cjc-1295-without-dac-10mg.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-without-dac') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 17500, imageUrl: render('klow-blend-80mg.png'), coaUrl: COA_PAGE, productUrl: product('klow-blend') },
];

runSeed({ supplierSlug: 'sparta-labs-2', listings });
