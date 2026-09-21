// Adds Reta One Labs' product listings, as supplied from retaonelabs.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://retaonelabs.com/wp-content/uploads/${path}`;
const product = (path) => `https://retaonelabs.com/product/${path}/?ref=owc70`;
// The same general COA page was supplied for every listing.
const COA_PAGE = 'https://retaonelabs.com/coa/';

// Prices in integer cents, sizes in mg (a blend's total). inStock: false where the listing was
// supplied as out of stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 2200, inStock: false, imageUrl: upload('2026/03/BPC-10MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  // 10 mg + 10 mg.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 6000, imageUrl: upload('2026/05/BPC-TB500-BLEND-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend-10mg-10mg') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 2900, imageUrl: upload('2026/03/GHK-CU-50MG-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3900, imageUrl: upload('2026/04/GHK-CU-100mg-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-100mg') },
  // A 30 mL topical serum. Its GHK-Cu content wasn't supplied, so the size is the volume, on the same
  // scale the admin form uses for mL sizes; it is only ranked against other serums.
  { productSlug: 'ghk-cu', form: 'serum', mg: 30, priceCents: 3900, imageUrl: upload('2025/12/GHK-Serum-Individual-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ghk-serum-30ml') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 3000, imageUrl: upload('2026/04/3r-10mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-10mg') },
  { productSlug: 'retatrutide', mg: 12, priceCents: 3500, imageUrl: upload('2026/08/RT-12MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3rt-12mg') },
  { productSlug: 'retatrutide', mg: 15, priceCents: 4500, imageUrl: upload('2026/08/RT-15MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3rt-15mg') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 6000, imageUrl: upload('2026/04/3r-20mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-20mg') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 8500, imageUrl: upload('2026/04/3r-30mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-30mg') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 12900, imageUrl: upload('2026/04/3r-40mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-40mg') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 18900, imageUrl: upload('2026/04/3r-50mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-50mg') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 23900, imageUrl: upload('2026/04/3r-60mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-60mg') },
  { productSlug: 'retatrutide', mg: 70, priceCents: 25900, imageUrl: upload('2026/07/RT-70mg-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-3r-70mg') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 2400, imageUrl: upload('2026/04/2t-10mg-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-2t-10mg') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 7200, imageUrl: upload('2026/04/2t-30mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-2t-30mg') },
  { productSlug: 'tirzepatide', mg: 40, priceCents: 8200, imageUrl: upload('2026/08/TZ-40MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-2tz-40mg') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 13900, imageUrl: upload('2026/04/2t-60mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-2t-60mg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 2900, inStock: false, imageUrl: upload('2026/04/1s-10mg-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-1s-10mg') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 3900, imageUrl: upload('2026/04/1s-20mg-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ro-1s-20mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 3900, imageUrl: upload('2026/03/TESAMORELIN-10MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 7700, imageUrl: upload('2026/05/TESAMORELIN-20MG-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('tesamorelin-20mg') },
  { productSlug: 'nad', mg: 500, priceCents: 4600, imageUrl: upload('2026/03/NAD-500MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 2900, inStock: false, imageUrl: upload('2026/03/MOTS-C-10MG-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 5500, imageUrl: upload('2026/05/MOTS-C-40MG-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('mots-c-40mg') },
  { productSlug: 'semax', mg: 10, priceCents: 2600, imageUrl: upload('2026/07/SEMAX-10mg-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 2400, imageUrl: upload('2026/05/PT-141-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 2700, imageUrl: upload('2026/06/ss-31-10mg-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('ss31-10mg') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 3400, imageUrl: upload('2026/07/GLUTATHIONE-1500MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 4500, imageUrl: upload('2026/03/GLOW-70MG-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('glow-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 7900, imageUrl: upload('2026/03/KLOW-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('klow-blend-80mg') },
  // 5 mg + 5 mg and 10 mg + 10 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 3700, imageUrl: upload('2026/05/CJCIPA-BLEND-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('cjc-ipa-blend') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 6300, imageUrl: upload('2026/09/CJCIPA-BLEND-10-10-scaled-300x300.jpg'), coaUrl: COA_PAGE, productUrl: product('cjc-ipamorelin-blend-10mg-10mg') },
];

runSeed({ supplierSlug: 'reta-one-labs-2', listings });
