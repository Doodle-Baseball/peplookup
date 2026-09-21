// Adds Puratek Peptides' product listings, as supplied from puratekpeptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://puratekpeptides.com/wp-content/uploads/${path}`;
const product = (path) => `https://puratekpeptides.com/product/${path}/?ref=370`;

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no certificate was supplied.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 2995, imageUrl: upload('2026/01/BPC-157-889x1024.webp'), coaUrl: upload('2026/06/bpc-157-batch-5-1-724x1024.png'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 5995, imageUrl: upload('2026/01/Generated-Image-April-01-2026-1_08PM-889x1024.webp'), coaUrl: upload('2026/07/tb-500-batch-4-1-724x1024.png'), productUrl: product('tb-500') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 5195, imageUrl: upload('2026/01/BPC-157-TB-500-2-889x1024.webp'), coaUrl: upload('2026/09/bpctb-batch-6-1-724x1024.png'), productUrl: product('bpc-157-tb-500-blend') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 2895, imageUrl: upload('2026/01/GHK-CU-1-889x1024.jpg'), coaUrl: upload('2026/06/ghk-50-batch-2-1-724x1024.png'), productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3495, imageUrl: upload('2026/01/GHK-CU-1-889x1024.jpg'), coaUrl: upload('2026/06/ghk-50-batch-2-1-724x1024.png'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 4495, imageUrl: upload('2026/01/PUR-3R--889x1024.jpg'), coaUrl: upload('2026/07/pur3r-30-batch-7-1-724x1024.png'), productUrl: product('pur-3r') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 6495, imageUrl: upload('2026/01/PUR-3R--889x1024.jpg'), coaUrl: upload('2026/07/pur3r-30-batch-7-1-724x1024.png'), productUrl: product('pur-3r') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 8995, imageUrl: upload('2026/01/PUR-3R--889x1024.jpg'), coaUrl: upload('2026/07/pur3r-30-batch-7-1-724x1024.png'), productUrl: product('pur-3r') },
  { productSlug: 'tirzepatide', mg: 15, priceCents: 3995, imageUrl: upload('2026/01/PUR-2T-889x1024.jpg'), coaUrl: upload('2026/06/pur2t-30-batch-4-1-724x1024.png'), productUrl: product('pur-2t') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 5995, imageUrl: upload('2026/01/PUR-2T-889x1024.jpg'), coaUrl: upload('2026/06/pur2t-30-batch-4-1-724x1024.png'), productUrl: product('pur-2t') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 8995, imageUrl: upload('2026/01/PUR-2T-889x1024.jpg'), coaUrl: upload('2026/06/pur2t-30-batch-4-1-724x1024.png'), productUrl: product('pur-2t') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 3495, imageUrl: upload('2026/01/PUR-1S-889x1024.jpg'), coaUrl: upload('2026/01/GLP-1s-5mg-791x1024.webp'), productUrl: product('pur-1s') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 4595, imageUrl: upload('2026/01/Cagrilintide-889x1024.webp'), coaUrl: upload('2026/06/cagrilintide-5-batch-3-1-724x1024.png'), productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 7295, imageUrl: upload('2026/01/Cagrilintide-889x1024.webp'), coaUrl: upload('2026/06/cagrilintide-5-batch-3-1-724x1024.png'), productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 3795, imageUrl: upload('2026/01/Ipamorelin--889x1024.webp'), coaUrl: upload('2026/08/Ipamorelin-batch-3-1-724x1024.png'), productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5495, imageUrl: upload('2026/05/product-vial-TESA-888x1024.png'), coaUrl: upload('2026/05/TESA-10-BATCH-5-1-791x1024.png'), productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 10495, imageUrl: upload('2026/05/product-vial-TESA-888x1024.png'), coaUrl: upload('2026/05/TESA-10-BATCH-5-1-791x1024.png'), productUrl: product('tesamorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 4295, imageUrl: upload('2026/01/NAD-889x1024.webp'), coaUrl: upload('2026/07/nad-500-batch-3-1-724x1024.png'), productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 6895, imageUrl: upload('2026/01/NAD-889x1024.webp'), coaUrl: upload('2026/07/nad-500-batch-3-1-724x1024.png'), productUrl: product('nad') },
  { productSlug: 'epitalon', mg: 10, priceCents: 2695, imageUrl: upload('2026/01/Epithalon-889x1024.webp'), coaUrl: upload('2026/04/EPITHALON-BATCH-2-1-791x1024.png'), productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 3295, imageUrl: upload('2026/01/Semax--889x1024.webp'), coaUrl: upload('2026/06/semax-batch-4-1-724x1024.png'), productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 3295, imageUrl: upload('2026/01/Selank-889x1024.webp'), coaUrl: upload('2026/07/selank-batch-4-1-724x1024.png'), productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 3145, imageUrl: upload('2026/04/PT-141-889x1024.jpg'), coaUrl: upload('2026/04/PT-141-10MG-BATCH-1-1-791x1024.png'), productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 3495, imageUrl: upload('2026/01/5-Amino-1MQ-889x1024.webp'), coaUrl: upload('2026/07/5-amino-10mg-batch-5-1-724x1024.png'), productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 6495, imageUrl: upload('2026/01/5-Amino-1MQ-889x1024.webp'), coaUrl: upload('2026/07/5-amino-10mg-batch-5-1-724x1024.png'), productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 30, priceCents: 7495, imageUrl: upload('2026/05/Gemini_Generated_Image_psris9psris9psri-889x1024.png'), coaUrl: upload('2026/08/PUR31-30-BATCH-5-1-724x1024.png'), productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 10, priceCents: 3495, imageUrl: upload('2026/04/DSIP.jpg'), coaUrl: upload('2026/07/dsip-batch-2-1-724x1024.png'), productUrl: product('dsip-10mg') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 5195, imageUrl: upload('2026/04/IMAGE-28-889x1024.webp'), coaUrl: upload('2026/07/gluta-batch-2-1-724x1024.png'), productUrl: product('glutathione-1500mg') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 2795, imageUrl: upload('2026/01/Melanotan-1-889x1024.webp'), coaUrl: upload('2026/07/melanotan-1-batch-4-1-724x1024.png'), productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2795, imageUrl: upload('2026/01/Melanotan-2-889x1024.webp'), coaUrl: upload('2026/05/mt2-batch-3-1-1-724x1024.png'), productUrl: product('melanotan-2') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 4495, imageUrl: upload('2026/01/CJC-1295-3-889x1024.webp'), coaUrl: upload('2026/07/Cjc-no-dac-batch-2-1-724x1024.png'), productUrl: product('cjc-1295-no-dac') },
  // 5 mg + 5 mg blend.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5195, imageUrl: upload('2026/02/image-889x1024.png'), coaUrl: upload('2026/08/cjcipa-1010-batch-3-1-724x1024.png'), productUrl: product('cjc-ipa-10mg') },
  // 10 mg + 10 mg blend.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 6995, imageUrl: upload('2026/02/image-889x1024.png'), coaUrl: upload('2026/08/cjcipa-1010-batch-3-1-724x1024.png'), productUrl: product('cjc-ipa-10mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 5995, imageUrl: upload('2026/05/Gemini_Generated_Image_q0a0etq0a0etq0a0-889x1024.png'), coaUrl: upload('2026/06/glow-batch-2-1-724x1024.png'), productUrl: product('glow-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 6995, imageUrl: upload('2026/01/KLOW-1-889x1024.webp'), coaUrl: upload('2026/08/KLOW-BATCH-5-1-724x1024.png'), productUrl: product('klow') },
  // Sizes in mL, stored on the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1095, imageUrl: upload('2026/01/BW-30mL-889x1024.webp'), coaUrl: null, productUrl: product('bw') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 1395, imageUrl: upload('2026/01/BW-30mL-889x1024.webp'), coaUrl: null, productUrl: product('bw') },
];

runSeed({ supplierSlug: 'puratek-peptides-2', listings });
