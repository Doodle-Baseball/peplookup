// Adds Nextgen Peptides's product listings, as supplied from ngpeptide.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general COA page. Capsules are `mg` per capsule
// with `count` capsules; 10-vial kits are `count: 10`. Bacteriostatic Water's 30 ml
// is stored on the `mg` field, matching the convention used for other vendors' water.
// Listings marked out of stock by the vendor are `inStock: false`; the rest take the shared default.
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?ref=peplookup';
const COA_PAGE = `https://www.ngpeptide.com/coa${REF}`;
const upload = (file) => `https://ngpeptide.com/wp-content/uploads/${file}`;
const product = (slug) => `https://www.ngpeptide.com/product/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3000, inStock: false, imageUrl: upload('2026/06/BPC-157-10MG-01-mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 5500, inStock: false, imageUrl: upload('2026/06/BPC-157-10MG-01-mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', form: 'capsule', mg: 0.5, count: 100, priceCents: 11000, imageUrl: upload('2026/06/BPC-500MCG-100-caps-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-caps') },

  { productSlug: 'tb-500', mg: 10, priceCents: 3500, imageUrl: upload('2026/06/TB-500-10MG-01-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 20, priceCents: 6400, imageUrl: upload('2026/06/TB-500-10MG-01-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500') },

  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 5500, imageUrl: upload('2026/06/BPC-TB-5MG-5MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-tb-blend') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 6500, imageUrl: upload('2026/06/BPC-TB-5MG-5MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-tb-blend') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 2000, imageUrl: upload('2026/06/GHK-Cu-50MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', form: 'spray', mg: 50, priceCents: 6500, imageUrl: upload('2026/08/GHKcu-50mg30ml-nasal-spray-1.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg-30ml-liquid-spray') },

  { productSlug: 'retatrutide', mg: 10, priceCents: 4000, imageUrl: upload('2026/06/GLP-3-10MG-01-Mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 6400, imageUrl: upload('2026/06/GLP-3-10MG-01-Mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 8700, imageUrl: upload('2026/06/GLP-3-10MG-01-Mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 15000, imageUrl: upload('2026/06/GLP-3-10MG-01-Mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3') },

  { productSlug: 'tirzepatide', mg: 20, priceCents: 4000, imageUrl: upload('2026/06/TRZ-20MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('trz-2') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 5500, imageUrl: upload('2026/06/TRZ-20MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('trz-2') },
  { productSlug: 'tirzepatide', mg: 40, priceCents: 7500, imageUrl: upload('2026/06/TRZ-20MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('trz-2') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 10000, imageUrl: upload('2026/06/TRZ-20MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('trz-2') },

  { productSlug: 'cagrilintide', mg: 5, priceCents: 4000, imageUrl: upload('2026/06/CAGRI-10MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('cagri') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 6500, imageUrl: upload('2026/06/CAGRI-10MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('cagri') },

  { productSlug: 'ipamorelin', mg: 5, priceCents: 2800, imageUrl: upload('2026/06/IPA-5MG-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4200, imageUrl: upload('2026/06/IPA-5MG-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 5000, imageUrl: upload('2026/06/TESA-10MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 9000, imageUrl: upload('2026/06/TESA-10MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },

  { productSlug: 'sermorelin', mg: 10, priceCents: 4500, imageUrl: upload('2026/06/sermorelin-10mg-01-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 5000, imageUrl: upload('2026/06/NAD-500MG-01-mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 40, priceCents: 8000, imageUrl: upload('2026/06/MOTS-C-40MG-01-mockup.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },

  { productSlug: 'epitalon', mg: 50, priceCents: 7500, imageUrl: upload('2026/06/epithalon-50MG-01-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'epitalon', form: 'spray', mg: 50, priceCents: 16500, imageUrl: upload('2026/09/nextgen-epithalon-spray-50mg-mockup.jpg'), coaUrl: COA_PAGE, productUrl: product('epithalon-spray-50mg') },

  { productSlug: 'semax', mg: 10, priceCents: 3500, imageUrl: upload('2026/06/SEMAX-10MG-01-Mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'semax', mg: 30, priceCents: 9000, imageUrl: upload('2026/06/SEMAX-10MG-01-Mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'semax', form: 'spray', mg: 50, priceCents: 14000, imageUrl: upload('2026/06/Semax-50mg-30ml-nasal-spray.webp'), coaUrl: COA_PAGE, productUrl: product('semax-spray') },

  { productSlug: 'selank', mg: 10, priceCents: 3000, imageUrl: upload('2026/06/SELANK-10MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', mg: 30, priceCents: 7500, imageUrl: upload('2026/06/SELANK-10MG-01-Mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', form: 'spray', mg: 40, priceCents: 16000, imageUrl: upload('2026/06/Selank-40mg-30ml-nasal-spray.webp'), coaUrl: COA_PAGE, productUrl: product('selank-spray') },

  { productSlug: 'pt-141', mg: 10, priceCents: 2499, imageUrl: upload('2026/06/PT-141-10MG-01-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },

  { productSlug: '5-amino-1mq', mg: 5, priceCents: 2000, inStock: false, imageUrl: upload('2026/06/5-Amino-MQ-5MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 4000, imageUrl: upload('2026/06/5-Amino-MQ-5MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-mq') },
  { productSlug: '5-amino-1mq', form: 'capsule', mg: 50, count: 60, priceCents: 11000, imageUrl: upload('2026/06/5-Amino-mq-50mg-60-capsule-MOCKUP-3.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-mq-capsules-2') },

  { productSlug: 'dsip', mg: 10, priceCents: 3500, imageUrl: upload('2026/06/DSIP-10MG-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', form: 'spray', mg: 30, priceCents: 14000, imageUrl: upload('2026/08/DSIP-30mg30ml-nasal-spray.webp'), coaUrl: COA_PAGE, productUrl: product('dsip-30mg-liquid-spray') },

  { productSlug: 'glutathione', mg: 1500, priceCents: 4500, inStock: false, imageUrl: upload('2026/06/glutathione-1500mg-01-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'ahk-cu', mg: 100, priceCents: 3000, inStock: false, imageUrl: upload('2026/06/AHK-Cu-100mg-mockup-1.webp'), coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  { productSlug: 'melanotan-1', mg: 10, priceCents: 2500, imageUrl: upload('2026/08/MT-1-10MG-mockup.webp'), coaUrl: COA_PAGE, productUrl: product('mt-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2499, imageUrl: upload('2026/07/MT2-10MG-01-mockup.webp'), coaUrl: COA_PAGE, productUrl: product('mt-2-10mg') },

  { productSlug: 'glow', mg: 70, priceCents: 5000, imageUrl: upload('2026/06/GLOW-70MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('glow') },
  { productSlug: 'glow', mg: 70, count: 10, priceCents: 38999, imageUrl: upload('2026/06/GLOW-70MG-01-mockup-1-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('glow-10vials') },
  { productSlug: 'klow', mg: 80, priceCents: 7000, imageUrl: upload('2026/06/KLOW-80MG-01-mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('klow-blend') },
  { productSlug: 'klow', mg: 80, count: 10, priceCents: 47000, inStock: false, imageUrl: upload('2026/06/KLOW-80MG-01-mockup-scaled.webp'), coaUrl: COA_PAGE, productUrl: product('klow-10-vials') },

  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 3000, inStock: false, imageUrl: upload('2026/06/HOSPIRA-MOCKUP.webp'), coaUrl: COA_PAGE, productUrl: product('add-on-only-hospira-30ml-bac-water') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 4000, imageUrl: upload('2026/06/CJC-IPA-10MG-01-mockup.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-ipa-5-5mg-no-dac') },
];

runSeed({ supplierSlug: 'nextgen-peptides', listings });
