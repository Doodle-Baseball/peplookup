// Adds Gen Peptide's product listings, as supplied from genpeptide.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://genpeptide.com/wp-content/uploads/${path}`;
const product = (path) => `https://genpeptide.com/product/${path}/?ref=peplookup`;
// The same general COA lookup page was supplied for every listing.
const COA_PAGE = 'https://genpeptide.com/coa-lookup/';

// Prices in integer cents, sizes in mg (a blend's total per vial). `count` is vials in the pack
// (5 for the vendor's Tirz-GP kits, where the price covers all of them).
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3500, imageUrl: upload('2026/03/BPC-157.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4500, imageUrl: upload('2026/03/TB500-150x188.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500-10mg') },
  // The vendor's BPC-157 / TB4 blend, 10 mg + 10 mg, supplied under the BPC-157 + TB-500 compound.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 7500, imageUrl: upload('2026/03/BPC-157_TB4-150x188.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb4-blend') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3000, imageUrl: upload('2026/03/ghk50-150x188.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4500, imageUrl: upload('2026/03/ghk100.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 12, priceCents: 7500, imageUrl: upload('2026/03/retagp12.webp'), coaUrl: COA_PAGE, productUrl: product('reta-gp-glp-3rt') },
  { productSlug: 'retatrutide', mg: 24, priceCents: 11500, imageUrl: upload('2026/03/retagp24.webp'), coaUrl: COA_PAGE, productUrl: product('reta-gp-glp-3rt') },
  { productSlug: 'retatrutide', mg: 48, priceCents: 20000, imageUrl: upload('2026/03/retagp48.webp'), coaUrl: COA_PAGE, productUrl: product('reta-gp-glp-3rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 5000, imageUrl: upload('2026/03/tirz10-1.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 8500, imageUrl: upload('2026/03/tirz20.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 9500, imageUrl: upload('2026/03/tirz30.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 13500, imageUrl: upload('2026/03/tirz60.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz') },
  { productSlug: 'tirzepatide', mg: 10, count: 5, priceCents: 20000, imageUrl: upload('2026/05/Tirz-Kit.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz-kit') },
  { productSlug: 'tirzepatide', mg: 20, count: 5, priceCents: 34000, imageUrl: upload('2026/05/tirz20kit.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz-kit') },
  { productSlug: 'tirzepatide', mg: 30, count: 5, priceCents: 38000, imageUrl: upload('2026/05/tirzkit30.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz-kit') },
  { productSlug: 'tirzepatide', mg: 60, count: 5, priceCents: 54000, imageUrl: upload('2026/05/tirzkit60.webp'), coaUrl: COA_PAGE, productUrl: product('tirz-gp-glp-2tz-kit') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 3500, imageUrl: upload('2026/03/semagp5.webp'), coaUrl: COA_PAGE, productUrl: product('sema-gp-glp-1sg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 4500, imageUrl: upload('2026/03/semagp10.webp'), coaUrl: COA_PAGE, productUrl: product('sema-gp-glp-1sg') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 4000, imageUrl: upload('2026/03/cagrilintide-150x188.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide-5mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5500, imageUrl: upload('2026/03/tesamorelin.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'nad', mg: 500, priceCents: 5500, imageUrl: upload('2026/03/NAD-150x188.webp'), coaUrl: COA_PAGE, productUrl: product('nad-buffered-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4500, imageUrl: upload('2026/03/MOTS-C.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3500, imageUrl: upload('2026/03/Epithalon.webp'), coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 3300, imageUrl: upload('2026/03/PT141.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 6800, imageUrl: upload('2026/03/5-Amino-1q-1.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 4500, imageUrl: upload('2026/03/DSIP.webp'), coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 3800, imageUrl: upload('2026/03/melanotan-I.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-i-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3000, imageUrl: upload('2026/03/melanotan-II.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3500, imageUrl: upload('2026/03/CJCnoDAC.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5000, imageUrl: upload('2026/03/CJC1295_ipa-1.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-ipamorelin-blend') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 8800, imageUrl: upload('2026/03/glow-1-2.webp'), coaUrl: COA_PAGE, productUrl: product('glow-ghk-cu-bpc-157-tb4-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 8800, imageUrl: upload('2026/03/klow-2.webp'), coaUrl: COA_PAGE, productUrl: product('klow-ghk-cu-bpc-157-tb4-kpv-80mg') },
  // Stored as a vial like other vendors' water, size in mL on the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1500, imageUrl: upload('2026/03/Bacteriostatic-water.webp'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-10ml') },
];

runSeed({ supplierSlug: 'gen-peptide-2', listings });
