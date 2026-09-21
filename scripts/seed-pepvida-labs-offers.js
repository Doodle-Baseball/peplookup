// Adds Pepvida Labs' product listings, as supplied from pepvidalabs.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos are served through WordPress's image CDN at the size supplied.
const photo = (path, size = 768) =>
  `https://i0.wp.com/pepvidalabs.com/wp-content/uploads/${path}?resize=${size}%2C${size}&ssl=1`;
const product = (path) => `https://pepvidalabs.com/product/${path}/?aff=27`;
// The same general certificates page was supplied for every listing.
const COA_PAGE = 'https://pepvidalabs.com/certificates-of-analysis/';

// Prices in integer cents, sizes in mg (a blend's total). No stock status was supplied, so every
// listing defaults to in stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 2997, imageUrl: photo('2025/09/BPC-157-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 3650, imageUrl: photo('2025/09/TB-500-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('tb-500-10mg-thymosin-beta-4-43-aa') },
  // 5 mg + 5 mg.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 4500, imageUrl: photo('2025/09/BPC-157-TB-500-5mg-5mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend-5mg-5mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3500, imageUrl: photo('2025/09/GHKCU-100mg-vial.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-100mg-blue-purple-color') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 9900, imageUrl: photo('2025/09/GLP-3-10mg-vial.png', 450), coaUrl: COA_PAGE, productUrl: product('glp-3r-10mg') },
  { productSlug: 'retatrutide', mg: 22, priceCents: 19500, imageUrl: photo('2025/09/GLP-3-22mg-vial.png', 450), coaUrl: COA_PAGE, productUrl: product('glp-3r-22mg') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 25900, imageUrl: photo('2025/09/GLP-3-Vial.png', 450), coaUrl: COA_PAGE, productUrl: product('glp-3r-30mg') },
  { productSlug: 'tirzepatide', mg: 12, priceCents: 9900, imageUrl: photo('2025/09/GLP-2-12mg-vial.png', 450), coaUrl: COA_PAGE, productUrl: product('glp-2t-12mg') },
  { productSlug: 'tirzepatide', mg: 32, priceCents: 24900, imageUrl: photo('2025/09/GLP-2-32mg-vial.png', 450), coaUrl: COA_PAGE, productUrl: product('glp-2t-32mg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 3030, imageUrl: photo('2025/09/GLP-1-10mg-vial.png'), coaUrl: COA_PAGE, productUrl: product('glp-1s-10mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 2996, imageUrl: photo('2025/09/Ipamorelin-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin-10mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 4370, imageUrl: photo('2025/09/Tesamorelin-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'sermorelin', mg: 13, priceCents: 6250, imageUrl: photo('2025/09/Sermorelin-13mg.png'), coaUrl: COA_PAGE, productUrl: product('sermorelin-13mg') },
  { productSlug: 'nad', mg: 700, priceCents: 7375, imageUrl: photo('2025/12/NAD-700mg.png'), coaUrl: COA_PAGE, productUrl: product('nad-700mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3000, imageUrl: photo('2025/09/MOTS-C-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('mots-c-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 2625, imageUrl: photo('2025/09/Epithalon-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 2500, imageUrl: photo('2025/09/Semax-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'selank', mg: 10, priceCents: 2500, imageUrl: photo('2025/09/Selank-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  // Supplied as 3 mg; its photo is the vendor's 10 mg vial image.
  { productSlug: 'pt-141', mg: 3, priceCents: 2250, imageUrl: photo('2025/09/PT-141-10mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 5625, imageUrl: photo('2026/03/50AM-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50mg') },
  { productSlug: 'glutathione', mg: 1200, priceCents: 5500, imageUrl: photo('2025/09/Glutathione-1200mg-vial.png'), coaUrl: COA_PAGE, productUrl: product('glutathione-1200mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2375, imageUrl: photo('2026/03/Melanotan-II-10mg-vial.png'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3000, imageUrl: photo('2025/09/CJC-NO-DAC-5mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-w-o-dac-5mg-cjc-no-dac') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 4375, imageUrl: photo('2025/09/CJC-1295-W-O-DAC-Ipamorelin-Blend-5mg-5mg-cjc-NO-DAC-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-w-o-dac-ipamorelin-blend-5mg-5mg-cjc-no-dac') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 5500, imageUrl: photo('2025/09/Glow-Blend-70mg-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('glow-blend') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 7375, imageUrl: photo('2025/12/KLOW-80-vial-png.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-cu-klow-cu-ghk-cu-tb-500-bpc-kpv') },
];

runSeed({ supplierSlug: 'pepvida-labs-2', listings });
