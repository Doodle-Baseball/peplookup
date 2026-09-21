// Adds PrPeps' product listings, as supplied from prpeps.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos are served through WordPress's image CDN at their original fit.
const photo = (path, fit = '1254,1254') => `https://i0.wp.com/wp.prpeps.com/wp-content/uploads/${path}?fit=${fit}&ssl=1`;
const product = (path) => `https://prpeps.com/products/${path}?ref=66`;
// The same general COA page was supplied for every listing.
const COA_PAGE = 'https://prpeps.com/coa';

// Prices in integer cents, sizes in mg (a blend's total).
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 5000, imageUrl: photo('2026/08/BPC-157-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 5000, imageUrl: photo('2026/08/TB-500-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  // 10 mg + 10 mg.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 8000, imageUrl: photo('2025/11/BPC-157-TB-500.jpg', '1097,1164'), coaUrl: COA_PAGE, productUrl: product('wolverine-bpc-157-tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 4000, imageUrl: photo('2026/07/GHK-CU-50MG.jpg', '1024,1024'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 6500, imageUrl: photo('2026/07/GHK-CU-50MG.jpg', '1024,1024'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 8000, imageUrl: photo('2026/08/GLP-3-RT-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-retatrutide') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 15000, imageUrl: photo('2026/08/GLP-3-RT-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-retatrutide') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 20000, imageUrl: photo('2026/08/GLP-3-RT-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-retatrutide') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 38000, imageUrl: photo('2026/08/GLP-3-RT-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-retatrutide') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 6000, imageUrl: photo('2026/08/GLP-2-TZ-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tirzepatide') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 10000, imageUrl: photo('2026/08/GLP-2-TZ-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tirzepatide') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 13500, imageUrl: photo('2026/08/GLP-2-TZ-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tirzepatide') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 24000, imageUrl: photo('2026/08/GLP-2-TZ-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tirzepatide') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 4000, imageUrl: photo('2026/08/GLP-1-SM-10mg.webp', '1600,1600'), coaUrl: COA_PAGE, productUrl: product('glp-1-semaglutide') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 7000, imageUrl: photo('2026/08/GLP-1-SM-10mg.webp', '1600,1600'), coaUrl: COA_PAGE, productUrl: product('glp-1-semaglutide') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 10000, imageUrl: photo('2026/08/GLP-1-SM-10mg.webp', '1600,1600'), coaUrl: COA_PAGE, productUrl: product('glp-1-semaglutide') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 4000, imageUrl: photo('2026/08/CAGRILINTIDE-5MG.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 6500, imageUrl: photo('2026/08/CAGRILINTIDE-5MG.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4500, imageUrl: photo('2026/08/IPAMORELIN-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7500, imageUrl: photo('2026/08/TESAMORELIN-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 6500, imageUrl: photo('2026/08/SERMORELIN.webp'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 6000, imageUrl: photo('2026/08/NAD-500MG.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 10000, imageUrl: photo('2026/08/NAD-500MG.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4500, imageUrl: photo('2026/08/MOTS-C-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 20, priceCents: 7500, imageUrl: photo('2026/08/MOTS-C-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3000, imageUrl: photo('2026/07/EPITHALON-10MG.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 10000, imageUrl: photo('2026/07/EPITHALON-10MG.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 4500, imageUrl: photo('2026/08/SEMAX-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 4500, imageUrl: photo('2026/08/SELANK-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 4000, imageUrl: photo('2026/07/PT-141-10MG.png'), coaUrl: COA_PAGE, productUrl: product('pt141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 2500, imageUrl: photo('2026/07/5-AMINO-1MQ.jpg', '1024,1024'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6000, imageUrl: photo('2026/08/SS-31-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 25000, imageUrl: photo('2026/08/SS-31-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'dihexa', mg: 10, priceCents: 4500, imageUrl: photo('2026/08/DIHEXA-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('dihexa') },
  { productSlug: 'dihexa', mg: 20, priceCents: 6500, imageUrl: photo('2026/08/DIHEXA-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('dihexa') },
  { productSlug: 'dsip', mg: 5, priceCents: 3500, imageUrl: photo('2026/08/DSIP-5MG.webp'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 15, priceCents: 7500, imageUrl: photo('2026/08/DSIP-5MG.webp'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 4500, imageUrl: photo('2026/08/GLUTATHIONE-1500MG.webp'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 4000, imageUrl: photo('2026/07/MELANOTAN-I-10MG.png'), coaUrl: COA_PAGE, productUrl: product('mt-1-melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4000, imageUrl: photo('2026/08/MELANOTAN-II-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('mt-2-melanotan-2') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 4500, imageUrl: photo('2026/07/CJC-W-O-DAC-10MG.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-without-dac') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 7000, imageUrl: photo('2026/08/CJC-IPA-10MG.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-ipamorelin-blend') },
  // 10 mg BPC-157 + 10 mg TB-500 + 50 mg GHK-Cu.
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 9500, imageUrl: photo('2026/07/GLOW-70MG.jpg', '1024,1024'), coaUrl: COA_PAGE, productUrl: product('glow70-bpc157-tb500-ghk-cu-blend') },
  // 10 mg KPV + 10 mg BPC-157 + 10 mg TB-500 + 50 mg GHK-Cu.
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 12000, imageUrl: photo('2026/07/KLOW-80MG.jpg', '1024,1024'), coaUrl: COA_PAGE, productUrl: product('klow80-kpv-bpc157-tb500-ghk-cu-blend') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, sizes in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 600, imageUrl: photo('2026/08/BAC-10ML.webp'), coaUrl: COA_PAGE, productUrl: product('bac-water') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1500, imageUrl: photo('2026/08/BAC-10ML.webp'), coaUrl: COA_PAGE, productUrl: product('bac-water') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 3000, imageUrl: photo('2026/08/BAC-10ML.webp'), coaUrl: COA_PAGE, productUrl: product('bac-water') },
];

runSeed({ supplierSlug: 'prpeps-2', listings });
