// Adds Ascension Peptides' product listings, as supplied from ascensionpeptides.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://ascensionpeptides.com/wp-content/uploads/${path}`;
const product = (path) => `https://ascensionpeptides.com/product/${path}/?ref=products`;
// The same general certificates page was supplied for every listing.
const COA_PAGE = 'https://ascensionpeptides.com/certificates-of-analysis/';

// Prices in integer cents, sizes in mg (a blend's total). No stock status was supplied for
// 5-Amino-1MQ, so it defaults to in stock like every other listing here.
//
// The vendor sells two 100 mg GHK-Cu vials that differ only by volume (10 mL vs 3 mL, at
// different prices) — a distinction this schema has no field for. Both are added as real,
// separately priced listings; because they share the same product/form/size key, a second
// script run (e.g. to attach coa_url once the migration lands) may only update one of the two
// matching database rows rather than both.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4900, imageUrl: upload('2024/03/Ascension-BPC-157-10mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 5, priceCents: 5400, imageUrl: upload('2024/05/Ascension-TB-500-5mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500-5mg') },
  // 10 mg BPC-157 + 10 mg TB-500, supplied under the Wolverine compound only.
  { productSlug: 'wolverine', mg: 20, priceCents: 9000, imageUrl: upload('2025/03/Ascension-Wolverine-Stack-20mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('wolverine-stack') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 6900, imageUrl: upload('2026/07/Ascension-GHK-Cu-100mg-10mL-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-100mg-10ml') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 5900, imageUrl: upload('2024/05/Ascension-GHK-CU-100mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-100mg-3ml') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 5000, imageUrl: upload('2024/05/Ascension-Ipamorelin-5mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('ipamorelin-5mg') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 5000, imageUrl: upload('2024/05/Ascension-Tesamorelin-5mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin-5mg') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 7200, imageUrl: upload('2024/05/Ascension-Sermorelin-10mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('sermorelin-10mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 10400, imageUrl: upload('2025/03/Ascension-NAD-1000mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('nad-1000mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 6200, imageUrl: upload('2024/05/Ascension-MOTS-C-10mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 5000, imageUrl: upload('2024/03/Ascension-Epithalon-10mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 4750, imageUrl: upload('2024/05/Ascension-Semax-10mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'selank', mg: 10, priceCents: 4750, imageUrl: upload('2024/05/Ascension-Selank-10mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 4900, imageUrl: upload('2024/05/Ascension-PT-141-10mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 5200, imageUrl: upload('2025/08/Ascension-5-Amino-1MQ-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-10-mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 7999, imageUrl: upload('2024/05/Ascension-SS-31-10mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 6000, imageUrl: upload('2024/05/Ascension-DSIP-10mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 5000, imageUrl: upload('2024/03/Ascension-Melanotan-1-10mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('melanotan-i-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5000, imageUrl: upload('2024/03/Ascension-Melanotan-2-10mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 5000, imageUrl: upload('2024/05/Ascension-CJC-1295-5mg-1024x1024.jpg'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-5mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 7000, imageUrl: upload('2026/05/Ascension-CJC-1295-10mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-10mg') },
  // 5 mg CJC-1295 (No DAC) + 5 mg Ipamorelin.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 7000, imageUrl: upload('2025/06/Ascension-FIT-Stack-CJC-1295IPAMORELIN-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('fit-stack-cjc-1295-ipamorelin') },
  // 50 mg GHK-Cu + 10 mg BPC-157 + 10 mg TB-500.
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 11000, imageUrl: upload('2025/06/Ascension-Glow-70mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glow-advanced-peptide-blend-for-radiance-recovery') },
  // 50 mg GHK-Cu + 10 mg BPC-157 + 10 mg TB-500 + 10 mg KPV.
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 12000, imageUrl: upload('2025/10/Ascension-KLOW-80mg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('klow-ghk-cu-bpc-157-thymosin-beta4-kpv') },
];

runSeed({ supplierSlug: 'ascension-peptides-2', listings });
