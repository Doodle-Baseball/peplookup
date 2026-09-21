// Adds Elevate Research Co's product listings, as supplied from elevateresearchco.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const SITE = 'https://elevateresearchco.com';
const render = (file) => `${SITE}/assets/img/renders/${file}`;
const product = (page) => `${SITE}/products/${page}.html?ref=PRODUCTS`;

// Prices in integer cents, sizes in mg (a blend's total). Every listing was supplied as in stock.
const listings = [
  { productSlug: 'retatrutide', mg: 10, priceCents: 6300, imageUrl: render('retatrutide.jpg?v=3'), coaUrl: `${SITE}/assets/coa/retatrutide.pdf`, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 10710, imageUrl: render('retatrutide.jpg?v=4'), coaUrl: `${SITE}/assets/coa/retatrutide.pdf`, productUrl: product('glp-3-rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 7650, imageUrl: render('tirzepatide.jpg?v=3'), coaUrl: `${SITE}/assets/coa/tirzepatide.pdf`, productUrl: product('glp-2-tz') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 5850, imageUrl: render('semaglutide.jpg?v=3'), coaUrl: `${SITE}/assets/coa/semaglutide.pdf`, productUrl: product('glp-1-sm') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 4950, imageUrl: render('bpc-157.jpg?v=3'), coaUrl: `${SITE}/assets/coa/bpc-157.pdf`, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 7110, imageUrl: render('bpc-tb-blend.jpg?v=3'), coaUrl: `${SITE}/assets/coa/bpc-tb-blend.pdf`, productUrl: product('bpc-tb-blend') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 8010, imageUrl: render('glow-blend.jpg?v=3'), coaUrl: `${SITE}/coa/glow-blend.html`, productUrl: product('glow-blend') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 8010, imageUrl: render('cjc-ipamorelin-blend.jpg?v=3'), coaUrl: `${SITE}/coa/cjc-ipamorelin-blend.html`, productUrl: product('cjc-ipamorelin-blend') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4950, imageUrl: render('ghk-cu.jpg?v=3'), coaUrl: `${SITE}/coa/ghk-cu.html`, productUrl: product('ghk-cu') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 8900, imageUrl: render('tesamorelin.jpg?v=3'), coaUrl: `${SITE}/coa/tesamorelin.html`, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 13410, imageUrl: render('tesamorelin.jpg?v=4'), coaUrl: `${SITE}/coa/tesamorelin.html`, productUrl: product('tesamorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 6750, imageUrl: render('nad-plus.jpg?v=3'), coaUrl: `${SITE}/coa/nad-plus.html`, productUrl: product('nad-plus') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4950, imageUrl: render('mots-c.jpg?v=3'), coaUrl: `${SITE}/coa/mots-c.html`, productUrl: product('mots-c') },
  { productSlug: 'selank', mg: 10, priceCents: 4050, imageUrl: render('selank.jpg?v=3'), coaUrl: `${SITE}/coa/selank.html`, productUrl: product('selank') },
  { productSlug: 'semax', mg: 10, priceCents: 3510, imageUrl: render('semax.jpg?v=3'), coaUrl: `${SITE}/coa/semax.html`, productUrl: product('semax') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3510, imageUrl: render('melanotan-2.jpg?v=3'), coaUrl: `${SITE}/coa/melanotan-2.html`, productUrl: product('melanotan-2') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 3780, imageUrl: render('melanotan-1.jpg?v=3'), coaUrl: `${SITE}/coa/melanotan-1.html`, productUrl: product('melanotan-1') },
  // Listed by the vendor as "Lab Water", a "Solution"; stored as a vial like other vendors' water, size in mL
  // on the same scale the admin form uses for mL sizes. Its COA link is the vendor's general quality page.
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 360, imageUrl: render('bacteriostatic-water.jpg?v=3'), coaUrl: `${SITE}/quality-coa.html`, productUrl: product('lab-water') },
];

runSeed({ supplierSlug: 'elevate-research-co-2', listings });
