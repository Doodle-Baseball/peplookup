// Adds Elite Edge Biotech's product listings, as supplied from
// eliteedgebiotech.com, to the Supabase `offers` table.
// See scripts/lib/seed-vendor-offers.js.
//
// MOTS-c ($49.99, $125.00) and one Glutathione listing ($31.00) were originally
// supplied with "CHECK" instead of a size; the user later confirmed these as
// MOTS-c 10mg/40mg and Glutathione 600mg.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://eliteedgebiotech.com/wp-content/uploads/${path}`;
const product = (path) => `https://eliteedgebiotech.com/peptides/${path}/?ref=74`;

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no certificate was supplied.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 2300, imageUrl: upload('2025/10/BPC-157-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/05/BPC-157-5mg-01-scaled.webp'), productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 3800, imageUrl: upload('2025/10/BPC-157-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/05/BPC-157-5mg-01-scaled.webp'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 3800, imageUrl: upload('2025/10/TB-500-10mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_Thymosin_beta4_2026-05-28_20260612_EEB.pdf'), productUrl: product('tb-500') },
  // 5 mg + 5 mg, 10 mg + 10 mg and 15 mg + 15 mg blends.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 3799, imageUrl: upload('2025/10/BPC-157-TB-500-5mg-5mg-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('bpc-157-tb-500-10mg') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 6499, imageUrl: upload('2025/10/BPC-157-TB-500-5mg-5mg-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('bpc-157-tb-500-10mg') },
  { productSlug: 'bpc-157-tb-500', mg: 30, priceCents: 12000, imageUrl: upload('2025/10/BPC-157-TB-500-5mg-5mg-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('bpc-157-tb-500-10mg') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3000, imageUrl: upload('2025/10/GHK-Cu-100mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_GHK-Cu_50mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4800, imageUrl: upload('2025/10/GHK-Cu-100mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_GHK-Cu_50mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 6500, imageUrl: upload('2025/10/GLP-3-R-30mg-01-2-768x768.webp'), coaUrl: upload('2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('elite-3rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 11000, imageUrl: upload('2025/10/GLP-3-R-30mg-01-2-768x768.webp'), coaUrl: upload('2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('elite-3rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 14500, imageUrl: upload('2025/10/GLP-3-R-30mg-01-2-768x768.webp'), coaUrl: upload('2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('elite-3rt') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 24000, imageUrl: upload('2025/10/GLP-3-R-30mg-01-2-768x768.webp'), coaUrl: upload('2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('elite-3rt') },
  { productSlug: 'retatrutide', mg: 100, priceCents: 46000, imageUrl: upload('2025/10/GLP-3-R-30mg-01-2-768x768.webp'), coaUrl: upload('2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('elite-3rt') },
  { productSlug: 'tirzepatide', mg: 15, priceCents: 4500, imageUrl: upload('2026/07/GLP-T-2-30mg-01-768x768.webp'), coaUrl: upload('2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('elite-2tz') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 6300, imageUrl: upload('2026/07/GLP-T-2-30mg-01-768x768.webp'), coaUrl: upload('2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('elite-2tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 7500, imageUrl: upload('2026/07/GLP-T-2-30mg-01-768x768.webp'), coaUrl: upload('2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('elite-2tz') },
  { productSlug: 'tirzepatide', mg: 40, priceCents: 9800, imageUrl: upload('2026/07/GLP-T-2-30mg-01-768x768.webp'), coaUrl: upload('2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('elite-2tz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 11500, imageUrl: upload('2026/07/GLP-T-2-30mg-01-768x768.webp'), coaUrl: upload('2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('elite-2tz') },
  { productSlug: 'tirzepatide', mg: 120, priceCents: 19950, imageUrl: upload('2026/07/GLP-T-2-30mg-01-768x768.webp'), coaUrl: upload('2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf'), productUrl: product('elite-2tz') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 3000, imageUrl: upload('2026/07/GLP-1S-01-768x768.webp'), coaUrl: upload('2026/08/COA_SLP-1_S_10mg_2026-07-22_2026-08-11_EEB-1.pdf'), productUrl: product('elite-1sg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 3800, imageUrl: upload('2026/07/GLP-1S-01-768x768.webp'), coaUrl: upload('2026/08/COA_SLP-1_S_10mg_2026-07-22_2026-08-11_EEB-1.pdf'), productUrl: product('elite-1sg') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 6300, imageUrl: upload('2025/10/GLP-1-C-10mg-768x768.webp'), coaUrl: upload('2026/06/COA_Cagrilintide_2026-05-28_20260612_EEB.pdf'), productUrl: product('glp-c-10mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4500, imageUrl: upload('2025/10/Ipamorelin-10mg-01-mockup-768x768.webp'), coaUrl: upload('2026/05/Ipamorelin-10mg-01-scaled.webp'), productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5500, imageUrl: upload('2025/10/Tesamorelin-10mg-01-mockup-768x768.webp'), coaUrl: upload('2026/08/COA_Tesamorelin_20mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 8500, imageUrl: upload('2025/10/Tesamorelin-10mg-01-mockup-768x768.webp'), coaUrl: upload('2026/08/COA_Tesamorelin_20mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 4900, imageUrl: upload('2025/10/sermorelin-10mg-768x768.webp'), coaUrl: upload('2026/08/COA_Sermorelin_10mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 5800, imageUrl: upload('2025/10/NAD-500mg-10ml-768x768.webp'), coaUrl: upload('2026/06/COA_NADplus_blue_2026-05-28_20260612_EEB.pdf'), productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 9000, imageUrl: upload('2025/10/NAD-500mg-10ml-768x768.webp'), coaUrl: upload('2026/06/COA_NADplus_blue_2026-05-28_20260612_EEB.pdf'), productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4999, imageUrl: upload('2025/10/MOTS-c-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 12500, imageUrl: upload('2025/10/MOTS-c-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3000, imageUrl: upload('2025/10/Epithalon-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('epithalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 6000, imageUrl: upload('2025/10/Epithalon-10mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 30, priceCents: 4000, imageUrl: upload('2025/10/Semax-30mg-01-mockup-768x768.webp'), coaUrl: upload('2026/05/Semax-30mg-01-scaled.webp'), productUrl: product('semax') },
  { productSlug: 'selank', mg: 5, priceCents: 2800, imageUrl: upload('2025/10/Selank-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_Selank_2026-05-28_20260612_EEB.pdf'), productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 2800, imageUrl: upload('2025/10/PT-141-10mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_PT-141_2026-05-28_20260612_EEB.pdf'), productUrl: product('pt-141-10mg') },
  { productSlug: '5-amino-1mq', mg: 5, priceCents: 3000, imageUrl: upload('2025/10/5-Amino-1mq-mockup-768x768.webp'), coaUrl: null, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 8000, imageUrl: upload('2025/10/5-Amino-1mq-mockup-768x768.webp'), coaUrl: null, productUrl: product('5-amino-1mq') },
  { productSlug: 'dsip', mg: 5, priceCents: 2000, imageUrl: upload('2025/10/DSIP-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_DSIP_2026-05-28_20260612_EEB.pdf'), productUrl: product('dsip-5mg') },
  { productSlug: 'glutathione', mg: 600, priceCents: 3100, imageUrl: upload('2025/12/Glutathione-1500mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('glutathione') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 6000, imageUrl: upload('2025/12/Glutathione-1500mg-01-mockup-768x768.webp'), coaUrl: null, productUrl: product('glutathione') },
  { productSlug: 'ghrp-2', mg: 5, priceCents: 2500, imageUrl: upload('2025/10/GHRP-2-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/08/COA_GHRP-2_5mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('ghrp-2-5mg') },
  { productSlug: 'ahk-cu', mg: 100, priceCents: 4250, imageUrl: upload('2026/07/AHK-CU-100mg-768x768.webp'), coaUrl: upload('2026/08/AHK-100mg.png'), productUrl: product('ahk-cu') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2700, imageUrl: upload('2025/10/Melanotan-II-01-10-mg-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_Melanotan2_2026-05-28_20260612_EEB.pdf'), productUrl: product('melanotan-mt-2-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3500, imageUrl: upload('2025/10/CJC-1295-No-DAC-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/08/COA_CJC-1295_noDAC_10mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 5400, imageUrl: upload('2025/10/CJC-1295-No-DAC-5mg-01-mockup-768x768.webp'), coaUrl: upload('2026/08/COA_CJC-1295_noDAC_10mg_2026-07-22_2026-08-11_EEB.pdf'), productUrl: product('cjc-1295-no-dac') },
  // 5 mg + 5 mg and 10 mg + 10 mg blends.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 4000, imageUrl: upload('2025/11/Ipamorelin-CJC-1295-No-DAC-5-5-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_Ipamorelin_CJC-1295_nD_2026-05-28_20260612_EEB.pdf'), productUrl: product('cjc-1295-no-dac-ipamorelin-5mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 8000, imageUrl: upload('2025/11/Ipamorelin-CJC-1295-No-DAC-5-5-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_Ipamorelin_CJC-1295_nD_2026-05-28_20260612_EEB.pdf'), productUrl: product('cjc-1295-no-dac-ipamorelin-5mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 6000, imageUrl: upload('2025/10/glow-70mg-01-mockup-1-768x768.webp'), coaUrl: upload('2026/06/COA_GLOW_2026-05-28_20260612_EEB.pdf'), productUrl: product('glow-blend') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 9000, imageUrl: upload('2025/12/KLOW-80mg-01-mockup-768x768.webp'), coaUrl: upload('2026/06/COA_KLOW_2026-05-28_20260612_EEB.pdf'), productUrl: product('klow-80mg') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, sizes in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1500, imageUrl: upload('2025/10/Bacteriostatic-Water-10ml-01-768x768.webp'), coaUrl: null, productUrl: product('bac-water') },
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 1000, imageUrl: upload('2025/11/3ml-bac-water-768x768.webp'), coaUrl: null, productUrl: product('reconstitution-water-3ml') },
];

runSeed({ supplierSlug: 'elite-edge-biotech-2', listings });
