// Adds AminoVault's product listings, as supplied from aminovault.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const SPCDN = 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_webp,s_webp/aminovault.com/wp-content/uploads/';
const SITE = 'https://aminovault.com';
// The vendor's general lab-tests page rather than a certificate per listing, used where no specific link was supplied.
const COA_LIBRARY = `${SITE}/lab-tests/?ref=112`;

const listings = [
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 6205,
    imageUrl: `${SPCDN}2025/07/AminoVault-BPC-1.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/bpc-157/?ref=112`,
  },
  {
    productSlug: 'tb-500',
    mg: 10,
    priceCents: 5865,
    imageUrl: `${SPCDN}2025/07/AminoVault-Tb500.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/tb-500-thymosin-beta-4-43aa/?ref=112`,
  },
  {
    // 10mg + 10mg = 20mg total.
    productSlug: 'wolverine',
    mg: 20,
    priceCents: 11050,
    imageUrl: `${SITE}/wp-content/uploads/2026/06/wolverine20mgv.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/wolverine-blend/?ref=112`,
  },
  {
    productSlug: 'ghk-cu',
    mg: 100,
    priceCents: 7140,
    imageUrl: `${SPCDN}2025/07/AminoVault-GHK.webp`,
    coaUrl: `${SITE}/wp-content/uploads/2026/02/GHK_Cu.pdf?ref=112`,
    productUrl: `${SITE}/product/ghk-cu/?ref=112`,
  },
  {
    // Sold as "AV-III"; the vendor lists this as their Retatrutide product.
    productSlug: 'retatrutide',
    mg: 10,
    priceCents: 10200,
    imageUrl: `${SPCDN}2026/08/AV-III10MG.webp`,
    coaUrl: `${SITE}/wp-content/uploads/2025/07/COA-251462-QC251075-Retatrutide.pdf?ref=112`,
    productUrl: `${SITE}/product/reta-glp-3/?ref=112`,
  },
  {
    productSlug: 'retatrutide',
    mg: 20,
    priceCents: 20400,
    imageUrl: `${SPCDN}2026/08/AV-III20MG.webp`,
    coaUrl: `${SITE}/wp-content/uploads/2025/07/COA-251462-QC251075-Retatrutide.pdf?ref=112`,
    productUrl: `${SITE}/product/reta-glp-3/?ref=112`,
  },
  {
    productSlug: 'retatrutide',
    mg: 30,
    priceCents: 28900,
    imageUrl: `${SPCDN}2026/08/AV-III30MG.webp`,
    coaUrl: `${SITE}/wp-content/uploads/2025/07/COA-251462-QC251075-Retatrutide.pdf?ref=112`,
    productUrl: `${SITE}/product/reta-glp-3/?ref=112`,
  },
  {
    // Sold as "AV-II"; the vendor lists this as their Tirzepatide product.
    productSlug: 'tirzepatide',
    mg: 10,
    priceCents: 8330,
    imageUrl: `${SPCDN}2026/08/AV-II10MG.webp`,
    coaUrl: `${SITE}/wp-content/uploads/2025/07/COA-251464-QC250877-Tirzepatide.pdf?ref=112`,
    productUrl: `${SITE}/product/tirz-glp-2/?ref=112`,
  },
  {
    productSlug: 'tirzepatide',
    mg: 20,
    priceCents: 13430,
    imageUrl: `${SPCDN}2026/08/AV-II20MG_new.webp`,
    coaUrl: `${SITE}/wp-content/uploads/2025/07/COA-251464-QC250877-Tirzepatide.pdf?ref=112`,
    productUrl: `${SITE}/product/tirz-glp-2/?ref=112`,
  },
  {
    // Sold as "AV-I"; the vendor lists this as their Semaglutide product.
    productSlug: 'semaglutide',
    mg: 10,
    priceCents: 6885,
    imageUrl: `${SPCDN}2025/07/AV-I-.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/sema-glp-1-receptor/?ref=112`,
  },
  {
    productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu',
    mg: 80,
    priceCents: 10625,
    imageUrl: `${SPCDN}2026/07/klow80MGnew_20260726_084609_0000-768x768.png`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/klow/?ref=112`,
  },
  {
    productSlug: 'ipamorelin',
    mg: 10,
    priceCents: 6205,
    imageUrl: `${SPCDN}2025/07/AminoVault-IPA.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/ipamorelin/?ref=112`,
  },
  {
    productSlug: 'cjc-1295-no-dac',
    mg: 10,
    priceCents: 8330,
    imageUrl: `${SPCDN}2025/07/cjc1295nodacav.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/cjc-1295-no-dac/?ref=112`,
  },
  {
    // 5mg + 5mg = 10mg total.
    productSlug: 'ipamorelin-cjc-1295-no-dac',
    mg: 10,
    priceCents: 8160,
    imageUrl: `${SPCDN}2025/12/cjcipablend.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/cjc-1295-ipamorelin/?ref=112`,
  },
  {
    productSlug: 'melanotan-2',
    mg: 10,
    priceCents: 5228,
    imageUrl: `${SPCDN}2025/07/Melanotan-10mg.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/melanotan-2/?ref=112`,
  },
  {
    productSlug: 'mots-c',
    mg: 10,
    priceCents: 5949,
    imageUrl: `${SPCDN}2025/07/AminoVault-Mots.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/mots-c/?ref=112`,
  },
  {
    productSlug: 'mots-c',
    mg: 40,
    priceCents: 20315,
    imageUrl: `${SPCDN}2025/07/AminoVault-Mots.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/mots-c/?ref=112`,
  },
  {
    productSlug: 'nad',
    mg: 1000,
    priceCents: 14025,
    imageUrl: `${SPCDN}2025/07/NAD1000-1.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/nad/?ref=112`,
  },
  {
    productSlug: 'sermorelin',
    mg: 5,
    priceCents: 4973,
    imageUrl: `${SPCDN}2025/07/Sermorelin-5mg-3.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/sermorelin/?ref=112`,
  },
  {
    productSlug: 'tesamorelin',
    mg: 10,
    priceCents: 8925,
    imageUrl: `${SITE}/wp-content/uploads/2025/07/AminoVault-TES.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/tesamorelin/?ref=112`,
  },
  {
    productSlug: 'glutathione',
    mg: 1500,
    priceCents: 7268,
    imageUrl: `${SPCDN}2025/07/AminoVault-Glut1500.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/l-glutathione/?ref=112`,
  },
  {
    productSlug: 'bacteriostatic-water',
    mg: 10,
    priceCents: 1450,
    imageUrl: `${SITE}/wp-content/uploads/2026/06/AVBAC10ml.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/bacteriostatic-water-10ml/?ref=112`,
  },
  {
    productSlug: 'bacteriostatic-water',
    mg: 30,
    priceCents: 2350,
    imageUrl: `${SITE}/wp-content/uploads/2026/03/AVWater-30ML_1-1.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `${SITE}/product/bacteriostatic-water-30ml/?ref=112`,
  },
];

runSeed({ supplierSlug: 'aminovault-2', listings });
