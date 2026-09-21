// Adds Peptide Titans's product listings, as supplied from peptidetitans.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor's general COA page rather than a certificate per listing; it is the link supplied for every product.
const COA_PAGE = 'https://peptidetitans.com/certificate-of-analysis/?ref=PEPLOOKUP';
const UPLOADS = 'https://peptidetitans.com/wp-content/uploads/';
const REF = '?ref=PEPLOOKUP';
const product = (slug) => `https://peptidetitans.com/product/${slug}${REF}`;

const listings = [
  { productSlug: '5-amino-1mq', mg: 5, priceCents: 2499, imageUrl: `${UPLOADS}2026/07/5-Amino-1MQ-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/5-Amino-1MQ-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 6999, imageUrl: `${UPLOADS}2026/07/5-Amino-1MQ-50mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', form: 'capsule', mg: 50, priceCents: 11999, imageUrl: `${UPLOADS}2026/07/5A1MQ-50-Capsules-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50-mg-capsules') },
  { productSlug: 'ahk-cu', mg: 100, priceCents: 6999, imageUrl: `${UPLOADS}2026/08/AHK-Cu-100mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  { productSlug: 'bpc-157', mg: 5, priceCents: 3999, imageUrl: `${UPLOADS}2026/07/BPC-157-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 6999, imageUrl: `${UPLOADS}2026/07/BPC-157-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 4999, imageUrl: `${UPLOADS}2026/07/BPC-157-TB-500-Blend-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 9999, inStock: false, imageUrl: `${UPLOADS}2026/07/BPC-157-TB-500-Blend-20mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend') },
  { productSlug: 'bpc-157-tb-500', form: 'capsule', mg: 1, priceCents: 15499, imageUrl: `${UPLOADS}2026/07/BPTB-500-Capsules-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-500-500-mcg-capsules') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3999, imageUrl: `${UPLOADS}2026/07/MOTS-C-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 20, priceCents: 5999, imageUrl: `${UPLOADS}2026/07/MOTS-C-20mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 9999, imageUrl: `${UPLOADS}2026/08/MOTS-C-40mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 5999, imageUrl: `${UPLOADS}2026/07/Cagrilintide-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 10999, imageUrl: `${UPLOADS}2026/07/Cagrilintide-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 4999, imageUrl: `${UPLOADS}2026/07/CJC-1295-with-DAC-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 7499, imageUrl: `${UPLOADS}2026/07/CJC-1295-No-DAC-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 4999, imageUrl: `${UPLOADS}2026/07/CJC-1295-No-DAC-and-Ipamorelin-Blend-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-ipamorelin-blend') },
  { productSlug: 'dsip', mg: 5, priceCents: 2999, imageUrl: `${UPLOADS}2026/07/DSIP-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 10, priceCents: 4499, inStock: false, imageUrl: `${UPLOADS}2026/07/DSIP-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/Epitalon-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 8999, imageUrl: `${UPLOADS}2026/07/Epitalon-50mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3499, inStock: false, imageUrl: `${UPLOADS}2026/07/GHK-Cu-50mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 5499, imageUrl: `${UPLOADS}2026/07/GHK-Cu-100mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghrp-2', mg: 5, priceCents: 1999, imageUrl: `${UPLOADS}2026/07/GHRP-2-10mg.jpg`, coaUrl: COA_PAGE, productUrl: product('ghrp-2') },
  { productSlug: 'ghrp-2', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/GHRP-2-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ghrp-2') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 7999, imageUrl: `${UPLOADS}2026/07/GLOW-70mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('glow') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 6999, imageUrl: `${UPLOADS}2026/07/Glutathione-1500mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'hexarelin', mg: 5, priceCents: 4499, imageUrl: `${UPLOADS}2026/07/Hexarelin-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('hexarelin') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 4499, imageUrl: `${UPLOADS}2026/07/Ipamorelin-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 8499, imageUrl: `${UPLOADS}2026/07/Ipamorelin-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 10999, imageUrl: `${UPLOADS}2026/07/KLOW-80mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('klow') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/Melanotan-I-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/Melanotan-II-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('melanotan-ii') },
  { productSlug: 'nad', mg: 1000, priceCents: 9999, imageUrl: `${UPLOADS}2026/07/NAD-1000mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'selank', mg: 5, priceCents: 2499, imageUrl: `${UPLOADS}2026/07/Selank-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/Selank-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', mg: 30, priceCents: 8999, imageUrl: `${UPLOADS}2026/08/Selank-30mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'semax', mg: 5, priceCents: 2499, imageUrl: `${UPLOADS}2026/07/Semax-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', mg: 10, priceCents: 3499, imageUrl: `${UPLOADS}2026/07/Semax-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', mg: 30, priceCents: 8999, imageUrl: `${UPLOADS}2026/08/Semax-30mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 3999, imageUrl: `${UPLOADS}2026/07/Sermorelin-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 7499, imageUrl: `${UPLOADS}2026/07/Sermorelin-10mg.jpg`, coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'sermorelin', form: 'capsule', mg: 0.5, priceCents: 7999, imageUrl: `${UPLOADS}2026/07/SER-500-Capsules-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('sermorelin-500-mcg-capsules') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 7999, imageUrl: `${UPLOADS}2026/07/SS-31-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'tb-500', mg: 5, priceCents: 2999, imageUrl: `${UPLOADS}2026/07/TB-500-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4499, imageUrl: `${UPLOADS}2026/07/TB-500-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 3999, imageUrl: `${UPLOADS}2026/07/Tesamorelin-5mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 6999, imageUrl: `${UPLOADS}2026/07/Tesamorelin-10mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 10999, imageUrl: `${UPLOADS}2026/08/Tesamorelin-20mg-768x768.jpg`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 699, imageUrl: `${UPLOADS}2026/07/Bacteriostatic-Water-3mL-1-768x768.jpg`, coaUrl: COA_PAGE, productUrl: `https://peptidetitans.com/product-category/bacteriostatic-water/${REF}` },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 999, imageUrl: `${UPLOADS}2026/07/Bacteriostatic-Water-10mL-1-768x768.jpg`, coaUrl: COA_PAGE, productUrl: `https://peptidetitans.com/product-category/bacteriostatic-water/${REF}` },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 2499, imageUrl: `${UPLOADS}2026/07/Bacteriostatic-Water-30mL-768x603.jpg`, coaUrl: COA_PAGE, productUrl: `https://peptidetitans.com/product-category/bacteriostatic-water/${REF}` },
];

runSeed({ supplierSlug: 'peptide-titans-2', listings });
