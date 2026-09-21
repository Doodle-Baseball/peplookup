// Adds Pristine Aminos' product listings, as supplied from pristineaminos.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://pristineaminos.com/wp-content/uploads/${path}`;
const product = (path) => `https://pristineaminos.com/product/${path}/?ref=18`;

// Prices in integer cents, sizes in mg (a blend's total). inStock: false where the listing was
// supplied as out of stock. coaUrl is null where no certificate was supplied (this vendor has no
// general COA page to fall back to).
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 5500, imageUrl: upload('2026/03/BPC-157-10mg-1024x971.png'), coaUrl: null, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 6000, imageUrl: upload('2026/08/ChatGPT-Image-Jun-30-2026-05_11_03-PM.webp'), coaUrl: null, productUrl: product('tb-500') },
  // 10 mg + 10 mg, sold by the vendor as "Wolverine" but supplied under the BPC-157 + TB-500 compound.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 7500, imageUrl: upload('2026/08/WolverineMGF-BPC157-TB500-MGF-10-10-1024x971.webp'), coaUrl: upload('2026/09/wolverinebpc-157-tb-500-20mg-10-10-20260812-7.pdf'), productUrl: product('wolverine-bpc-157-tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 4500, imageUrl: upload('2026/03/GHK-Cu-50mg-1024x971.png'), coaUrl: upload('2026/09/ghk-cu-100mg-260807-4.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 7500, imageUrl: upload('2026/04/GHK-Cu-100mg-1024x971.png'), coaUrl: upload('2026/09/ghk-cu-100mg-260807-4.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 9500, imageUrl: upload('2026/08/GLP3-R-10mg-1024x971.webp'), coaUrl: upload('2026/09/glp3-r-10mg-btch-pe-99-334.pdf'), productUrl: product('glp3-r') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 17500, imageUrl: upload('2026/04/GLP3-R-20mg-1024x971.png'), coaUrl: upload('2026/09/glp3-r-10mg-btch-pe-99-334.pdf'), productUrl: product('glp3-r') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 25000, imageUrl: upload('2026/04/GLP3-R-30mg-1024x971.png'), coaUrl: upload('2026/09/glp3-r-10mg-btch-pe-99-334.pdf'), productUrl: product('glp3-r') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 39500, imageUrl: upload('2026/04/GLP3-R-60mg-1024x971.png'), coaUrl: upload('2026/09/glp3-r-10mg-btch-pe-99-334.pdf'), productUrl: product('glp3-r') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/GLP2-T-10mg-1024x971.webp'), coaUrl: upload('2026/09/glp2-t-60mg-20260819-2.pdf'), productUrl: product('glp2-t') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 11000, imageUrl: upload('2026/04/GLP2-T-20mg-1024x971.png'), coaUrl: upload('2026/09/glp2-t-60mg-20260819-2.pdf'), productUrl: product('glp2-t') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 15000, imageUrl: upload('2026/04/GLP2-T-30mg-1024x971.png'), coaUrl: upload('2026/09/glp2-t-60mg-20260819-2.pdf'), productUrl: product('glp2-t') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 29500, imageUrl: upload('2026/04/GLP2-T-60mg-1024x971.png'), coaUrl: upload('2026/09/glp2-t-60mg-20260819-2.pdf'), productUrl: product('glp2-t') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/GLP1-S-10mg-1-1024x971.webp'), coaUrl: upload('2026/09/glp1-s-10mg-20260807-5.pdf'), productUrl: product('glp1-s') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 9500, imageUrl: upload('2026/08/Cagrilintide-10mg-1024x971.webp'), coaUrl: null, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/Ipamorelin-10mg-1024x971.webp'), coaUrl: null, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7500, imageUrl: upload('2026/08/Tesamorelin-10mg-1024x971.webp'), coaUrl: upload('2026/09/tesamorelin-10mg-20260706-006.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 7500, imageUrl: upload('2026/08/Sermorelin-10mg-1024x971.webp'), coaUrl: null, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 6000, imageUrl: upload('2026/03/NAD-500-5ml-1024x971.png'), coaUrl: upload('2026/09/nad-500mg-batch.pdf'), productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 9500, imageUrl: upload('2026/04/NAD-1000-10ml-1-1024x971.png'), coaUrl: upload('2026/09/nad-1000mg-batch.pdf'), productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 5000, imageUrl: upload('2026/08/MOTS-C-10mg-1024x971.webp'), coaUrl: upload('2026/09/mots-c-10mg-20260702-001.pdf'), productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 6500, imageUrl: upload('2026/03/Epitalon-Epithalon-10mg-1024x971.png'), coaUrl: null, productUrl: product('epitalon-epithalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 15000, inStock: false, imageUrl: upload('2026/04/Epitalon-Epithalon-50mg-1024x971.png'), coaUrl: null, productUrl: product('epitalon-epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 5000, imageUrl: upload('2026/08/Semax-10mg-1024x971.webp'), coaUrl: null, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 5000, imageUrl: upload('2026/08/Selank-10mg-1024x971.webp'), coaUrl: upload('2026/09/selank-10mg-kizn072426.pdf'), productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/PT-141-10mg-1024x971.webp'), coaUrl: null, productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 6000, imageUrl: upload('2026/08/5-Amino-1MQ-10-mg-1024x971.webp'), coaUrl: upload('2026/09/5-amino-1mq-50mg-kizen72826.pdf'), productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 11500, imageUrl: upload('2026/03/SS-31-50mg-1024x971.png'), coaUrl: upload('2026/09/ss-31-50mg-260807-1.pdf'), productUrl: product('ss-31') },
  { productSlug: 'dihexa', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/Dihexa-10mg-transparent-1024x971.webp'), coaUrl: null, productUrl: product('dihexa') },
  { productSlug: 'dsip', mg: 15, priceCents: 7500, imageUrl: upload('2026/09/DSIP-15mg-1024x971.webp'), coaUrl: null, productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 6500, imageUrl: upload('2026/08/Glutathione-20ml-vial-1500-1-1024x971.webp'), coaUrl: upload('2026/09/glutathione-1500mg-batch.pdf'), productUrl: product('glutathione') },
  { productSlug: 'glutathione', mg: 3000, priceCents: 9500, imageUrl: upload('2026/08/ChatGPT-Image-Aug-12-2026-12_51_06-PM-1024x1024.png'), coaUrl: upload('2026/09/glutathione-1500mg-batch.pdf'), productUrl: product('glutathione') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 6000, imageUrl: upload('2026/08/Melanotan-1-10mg-1024x971.webp'), coaUrl: null, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5000, imageUrl: upload('2026/08/Melanotan-2-10mg-1024x971.webp'), coaUrl: null, productUrl: product('melanotan-2') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 9500, imageUrl: upload('2026/08/GLOW-GHK-CU-TB500-BPC157-50-10-10mg-1024x971.webp'), coaUrl: upload('2026/09/glow-70mg-20260813-3.pdf'), productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 12500, imageUrl: upload('2026/08/KLOW-GHKCU-TB500-BPC157-KPV-1-1024x971.webp'), coaUrl: null, productUrl: product('klow') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/CJC1295-Ipamorelin-No-Dac-5-5mg-1024x971.webp'), coaUrl: upload('2026/09/cjc-1295-ipamorelinno-dac-10mg-5-5-batch.pdf'), productUrl: product('cjc-1295-ipamorelinno-dac') },
];

runSeed({ supplierSlug: 'pristine-aminos-2', listings });
