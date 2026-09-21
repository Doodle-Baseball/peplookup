// Adds Trusted Peps' product listings, as supplied from trustedpeps.us, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://trustedpeps.us/wp-content/uploads/${path}`;
const product = (path) => `https://trustedpeps.us/product/${path}/?aff=13`;
// The vendor's general COA page, supplied for most listings; a few came with their own certificate image.
const COA_PAGE = 'https://trustedpeps.us/coas/';

// Prices in integer cents, sizes in mg (a blend's total). inStock: false where the listing was
// supplied as out of stock; a blank stock field defaults to in stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3000, imageUrl: upload('2026/08/bpc-157-10mg-scaled-e1786576092528-768x768.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 4000, imageUrl: upload('2026/08/bpc_tb-500-10mg-scaled-e1786576067606.png'), coaUrl: COA_PAGE, productUrl: product('bpc-tb-blend') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3000, imageUrl: upload('2026/08/GHK-Cu-50mg-scaled-e1786576140601.png'), coaUrl: upload('2026/07/COA-GHK-Cu-50MG.png'), productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 3000, inStock: false, imageUrl: upload('2026/08/Ipamorelin-5mg-scaled-e1786576205455-768x768.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin-5mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 4000, imageUrl: upload('2026/08/CJC-1295-10mg-scaled-e1786576114982.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-5mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 4000, imageUrl: upload('2026/09/cjc-ipa-10-vial-768x1370.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-ipamorelin-blend-10mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5000, imageUrl: upload('2026/08/Tesamorelin-10mg-scaled-e1786575750990.png'), coaUrl: upload('2026/07/COA-Tesa-10MG.png'), productUrl: product('tesamorelin-10mg-2') },
  { productSlug: 'nad', mg: 500, priceCents: 3500, imageUrl: upload('2026/08/NAD-500MG-scaled-e1786576332858.png'), coaUrl: upload('2026/07/COA-NAD-500MG.png'), productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3000, imageUrl: upload('2026/08/MOTS-C-10MG-scaled-e1786576277141-768x768.png'), coaUrl: upload('2026/07/COA-MOTS-C-10MG-3.png'), productUrl: product('mots-c-10mg-2') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 3500, imageUrl: upload('2026/09/TP-31-10MG-Vial-Photo-e1789405029541-768x768.png'), coaUrl: COA_PAGE, productUrl: product('tp-31-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 3000, imageUrl: upload('2026/08/Semax-10mg-scaled-e1786575804896-768x768.png'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'selank', mg: 10, priceCents: 3000, imageUrl: upload('2026/08/Selank-10mg-scaled-e1786575853544.png'), coaUrl: COA_PAGE, productUrl: product('selank-10mg-2') },
  { productSlug: 'glutathione', mg: 500, priceCents: 3000, inStock: false, imageUrl: upload('2026/08/Glutathione-500mg-scaled-e1786576162981-768x768.png'), coaUrl: COA_PAGE, productUrl: product('glutathione-500mg') },
  { productSlug: 'glutathione', mg: 600, priceCents: 2500, imageUrl: upload('2026/08/Glutathione-600mg-scaled-e1786576185526.png'), coaUrl: COA_PAGE, productUrl: product('glutathione-600mg') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 3000, imageUrl: upload('2026/08/mt-1-10mg-scaled-e1786576298787.png'), coaUrl: COA_PAGE, productUrl: product('mt1-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3000, imageUrl: upload('2026/08/mt-2-10mg-scaled-e1786576316296.png'), coaUrl: COA_PAGE, productUrl: product('mt2-10mg-2') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 7500, imageUrl: upload('2026/08/KLOW-80MG-scaled-e1786576242443-768x768.png'), coaUrl: upload('2026/06/img_1227.jpeg'), productUrl: product('klow-80mg-2') },
];

runSeed({ supplierSlug: 'trusted-peps-2', listings });
