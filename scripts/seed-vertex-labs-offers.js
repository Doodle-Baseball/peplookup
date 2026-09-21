// Adds Vertex Peptides Lab's product listings, as supplied from
// vertexpeptideslab.org, to the Supabase `offers` table.
// See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://vertexpeptideslab.org/wp-content/uploads/${path}`;
// Most product photos are served through WordPress's image CDN at 768px.
const photo = (file) => `https://i0.wp.com/vertexpeptideslab.org/wp-content/uploads/2026/08/${file}?resize=768%2C768&ssl=1`;
const product = (path) => `https://vertexpeptideslab.org/product/${path}/?coupon=products`;

const RETATRUTIDE_PHOTO = upload('2026/04/GLP3.png');

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no certificate was supplied.
const listings = [
  { productSlug: 'retatrutide', mg: 10, priceCents: 7900, imageUrl: RETATRUTIDE_PHOTO, coaUrl: upload('2026/07/GLP3RT10_RT0000033_01.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 15, priceCents: 10900, imageUrl: RETATRUTIDE_PHOTO, coaUrl: upload('2026/08/GLP3RT_RT0000040_15MG.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 13900, imageUrl: RETATRUTIDE_PHOTO, coaUrl: upload('2026/04/GLP3RT20.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 18900, imageUrl: RETATRUTIDE_PHOTO, coaUrl: upload('2026/08/GLP3RT_RT0000041_30MG.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 29900, imageUrl: RETATRUTIDE_PHOTO, coaUrl: upload('2026/08/GLP3RT_RT0000039_60MG.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 4900, imageUrl: photo('GLP1_30.png'), coaUrl: upload('2026/04/GLP-1-SM_SM0000038.pdf'), productUrl: product('glp-1-sem') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 7900, imageUrl: photo('GLP1_30.png'), coaUrl: upload('2026/04/GLP-1-SM_SM0000038.pdf'), productUrl: product('glp-1-sem') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 11900, imageUrl: photo('GLP1_30.png'), coaUrl: upload('2026/04/GLP-1-SM_SM0000038.pdf'), productUrl: product('glp-1-sem') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 11900, imageUrl: photo('GLP2_20.png'), coaUrl: upload('2026/08/GLP2TRZ_TZ0000033_30MG.pdf'), productUrl: product('glp-2-trz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 16900, imageUrl: photo('GLP2_20.png'), coaUrl: upload('2026/08/GLP2TRZ_TZ0000033_30MG.pdf'), productUrl: product('glp-2-trz') },
  { productSlug: 'tirzepatide', mg: 40, priceCents: 20900, imageUrl: photo('GLP2_20.png'), coaUrl: upload('2026/08/GLP2TRZ_TZ0000033_30MG.pdf'), productUrl: product('glp-2-trz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 26900, imageUrl: photo('GLP2_20.png'), coaUrl: upload('2026/08/GLP2TRZ_TZ0000033_30MG.pdf'), productUrl: product('glp-2-trz') },
  { productSlug: 'bpc-157', mg: 5, priceCents: 4900, imageUrl: photo('BPC157_10.png'), coaUrl: upload('2026/04/BPC-157_BP0000046.pdf'), productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 6900, imageUrl: photo('BPC157_10.png'), coaUrl: upload('2026/04/BPC-157_BP0000046.pdf'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 5, priceCents: 4900, imageUrl: photo('TB500_10.png'), coaUrl: upload('2026/04/TB-5000_TB0000030.pdf'), productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 8900, imageUrl: photo('TB500_10.png'), coaUrl: upload('2026/04/TB-5000_TB0000030.pdf'), productUrl: product('tb-500') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 7900, imageUrl: photo('TESA_10.png'), coaUrl: upload('2026/04/TESA10MG_0000043.pdf'), productUrl: product('tesa') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 11900, imageUrl: photo('TESA_10.png'), coaUrl: upload('2026/04/TESA10MG_0000043.pdf'), productUrl: product('tesa') },
  { productSlug: 'mots-c', mg: 20, priceCents: 7900, imageUrl: photo('MOTSC_20.png'), coaUrl: upload('2026/04/MOTSC_MC0000028.pdf'), productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 12900, imageUrl: photo('MOTSC_20.png'), coaUrl: upload('2026/04/MOTSC_MC0000028.pdf'), productUrl: product('mots-c') },
  { productSlug: 'nad', mg: 500, priceCents: 7900, imageUrl: photo('NAD_1000.png'), coaUrl: upload('2026/04/NAD_NAD.00000030.pdf'), productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 12900, imageUrl: photo('NAD_1000.png'), coaUrl: upload('2026/04/NAD_NAD.00000030.pdf'), productUrl: product('nad') },
  { productSlug: 'glutathione', mg: 600, priceCents: 7900, imageUrl: photo('GLUTA_1500.png'), coaUrl: upload('2026/04/Gluta_GL000000038.pdf'), productUrl: product('glutathione') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 12900, imageUrl: photo('GLUTA_1500.png'), coaUrl: upload('2026/04/Gluta_GL000000038.pdf'), productUrl: product('glutathione') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 6900, imageUrl: photo('GHKCU_100.png'), coaUrl: upload('2026/04/GHK-Cu_GH0000023.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6900, imageUrl: photo('IPA_10.png'), coaUrl: upload('2026/04/IPA_IP0000030.pdf'), productUrl: product('ipamorelin') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 6900, imageUrl: photo('SERMORELIN_5.png'), coaUrl: null, productUrl: product('sermorelin') },
  { productSlug: 'semax', mg: 10, priceCents: 6900, imageUrl: photo('Semax_10.png'), coaUrl: upload('2026/04/SEMAX_SX0000028.pdf'), productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 6900, imageUrl: photo('Selank_10.png'), coaUrl: upload('2026/04/Selank_SK0000025.pdf'), productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 7900, imageUrl: photo('PT141_10.png'), coaUrl: null, productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 5900, imageUrl: photo('5AMINO1MQ_10.png'), coaUrl: upload('2026/04/5-amino-1mq_AM0000042.pdf'), productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5900, imageUrl: photo('SS31_10.png'), coaUrl: null, productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 5, priceCents: 5900, imageUrl: photo('DSIP_5.png'), coaUrl: upload('2026/09/DP0000019.pdf'), productUrl: product('dsip') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3900, imageUrl: photo('CJCNODAC_5.png'), coaUrl: upload('2026/06/CJND000043.pdf'), productUrl: product('cjc-1295-no-dac') },
  // 5 mg + 5 mg blend.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 9900, imageUrl: photo('CJCIPA.png'), coaUrl: upload('2026/04/CJC-IPA_CJIP000012.pdf'), productUrl: product('cjc-1295-5mg-no-dac-ipamorelin-5mg-blend') },
  // 50 mg + 10 mg + 10 mg blend.
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 11900, imageUrl: photo('GLOW.png'), coaUrl: upload('2026/04/GLOW_GW0000015.pdf'), productUrl: product('glow-blend') },
  // 50 mg + 10 mg + 10 mg + 10 mg blend.
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 15900, imageUrl: photo('KLOW.png'), coaUrl: upload('2026/07/KLOW_KL0000080_01.pdf'), productUrl: product('klow-blend') },
  // 5 mg + 5 mg blend.
  { productSlug: 'wolverine', mg: 10, priceCents: 9900, imageUrl: photo('WOLVERINE_10.png'), coaUrl: upload('2026/04/Wolverin_W00000015.pdf'), productUrl: product('wolverine-blend') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water. 10 mL, on the same
  // scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1900, imageUrl: photo('BACWATER_10.png'), coaUrl: upload('2026/07/BW000000047_10_01.pdf'), productUrl: product('bacteriostatic-water') },
];

runSeed({ supplierSlug: 'vertex-labs-2', listings });
