// Adds Ventra Sciences's product listings, as supplied from ventrasciences.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor's general COA page rather than a certificate per listing; it is the link supplied for every product.
const COA_PAGE = 'https://ventrasciences.com/coas-2/?ref=PRODUCTS';
const IMAGES = 'https://ventrasciences.com/media/uploads/';
const REF = '?ref=PRODUCTS';

const listings = [
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3500, imageUrl: `${IMAGES}2026/06/VSC-CU50_GHK-Cu_50MG_white.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/ghk-cu-50mg/${REF}` },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 5950, imageUrl: `${IMAGES}2026/09/VSC-CU100_GHK-Cu_100-MG_white-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/ghk-cu-50mg/${REF}` },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 7000, imageUrl: `${IMAGES}2026/06/VSC-KBT80_KLOW_50-10-10-10MG_navy.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/klow-ghk-cu-bpc-157-tb-500-kpv/${REF}` },
  { productSlug: 'semax', mg: 10, priceCents: 4550, imageUrl: `${IMAGES}2026/08/VSC-XA10_SEMAX_10-MG_black-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/semax/${REF}` },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5250, imageUrl: `${IMAGES}2026/08/VSC-TSM10_TESAMORELIN_10-MG_navy-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/tesamorelin/${REF}` },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5250, imageUrl: `${IMAGES}2026/06/VSC-CP10_CJC-1295-Ipamorelin_5-5MG_navy.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/cjc-1295-no-dac-ipamorelin/${REF}` },
  { productSlug: 'mots-c', mg: 10, priceCents: 3850, imageUrl: `${IMAGES}2026/08/VSC-MS10_MOTS-C_10-MG_white-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/mots-c/${REF}` },
  { productSlug: 'nad', mg: 500, priceCents: 4900, imageUrl: `${IMAGES}2026/08/VSC-NJ500_NAD_500-MG_white-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/nad-500mg/${REF}` },
  { productSlug: 'nad', mg: 1000, priceCents: 7700, imageUrl: `${IMAGES}2026/08/VSC-NJ1000_NAD_1000-MG_white-v5.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/nad-500mg/${REF}` },
  { productSlug: 'selank', mg: 10, priceCents: 4620, imageUrl: `${IMAGES}2026/08/VSC-SK10_SELANK_10-MG_black-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/selank/${REF}` },
  { productSlug: 'bpc-157', mg: 10, priceCents: 4550, imageUrl: `${IMAGES}2026/06/VSC-BC10_BPC-157_10MG_navy.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/bpc-157-5mg/${REF}` },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 8400, imageUrl: `${IMAGES}2026/08/VSC-BB20_BPC-157-TB-500_10-10-MG_navy-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/bpc-tb-blend/${REF}` },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 2800, imageUrl: `${IMAGES}2026/08/VSC-IP5_IPAMORELIN_5-MG_navy-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/ipamorelin-5mg/${REF}` },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4550, imageUrl: `${IMAGES}2026/08/VSC-IP10_IPAMORELIN_10-MG_navy-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/ipamorelin-5mg/${REF}` },
  { productSlug: 'sermorelin', mg: 10, priceCents: 5600, imageUrl: `${IMAGES}2026/08/VSC-SMO10_SERMORELIN_10-MG_navy-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/semorelin/${REF}` },
  { productSlug: 'tb-500', mg: 10, priceCents: 4200, imageUrl: `${IMAGES}2026/08/VSC-BT10_TB-500_10-MG_navy-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/tb-500/${REF}` },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2800, imageUrl: `${IMAGES}2026/06/VSC-ML10_Melanotan-II_10MG_white.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/mt-ii/${REF}` },
  { productSlug: 'glutathione', mg: 500, priceCents: 4200, imageUrl: `${IMAGES}2026/08/VSC-GSH500_GLUTATHIONE_500-MG_white-v5.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/glutathione/${REF}` },
  { productSlug: 'glutathione', mg: 1500, priceCents: 5600, imageUrl: `${IMAGES}2026/08/VSC-GSH1500_GLUTATHIONE_1500-MG_white-v5.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/glutathione/${REF}` },
  { productSlug: 'epitalon', mg: 10, priceCents: 3150, imageUrl: `${IMAGES}2026/08/VSC-ET10_EPITALON_10-MG_white-v6.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/epitalon-10mg/${REF}` },
  { productSlug: 'epitalon', mg: 50, priceCents: 7700, imageUrl: `${IMAGES}2026/08/VSC-ET50_EPITALON_50-MG_white-v5.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/epitalon-10mg/${REF}` },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 7000, imageUrl: `${IMAGES}2026/06/VSC-BBG70_GLOW_50-10-10MG_navy.webp`, coaUrl: COA_PAGE, productUrl: `https://ventrasciences.com/product/glow-ghk-cu-bpc-157-tb-500/${REF}` },
];

runSeed({ supplierSlug: 'ventra-sciences-2', listings });
