// Adds Axon Chems's product listings, as supplied from axonchems.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://axonchems.com/coa?aff=Dlj7pbr';
const IMG = 'https://axonchems.com/product-variants/';
const REF = '?aff=Dlj7pbr';
const shopProduct = (slug) => `https://shop.axonchems.com/product/${slug}/${REF}`;
const product = (slug) => `https://axonchems.com/products/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 3000, imageUrl: `${IMG}bpc-157-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 4500, imageUrl: `${IMG}bpc-157-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 7500, imageUrl: `${IMG}bpc-157-20mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', form: 'spray', mg: 5, priceCents: 4000, imageUrl: `${IMG}bpc-157-nasal-spray-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157-nasal-spray') },
  { productSlug: 'bpc-157', form: 'spray', mg: 10, priceCents: 5500, imageUrl: `${IMG}bpc-157-nasal-spray-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157-nasal-spray') },
  { productSlug: 'tb-500', mg: 5, priceCents: 3500, imageUrl: `${IMG}tb-500-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 5500, imageUrl: `${IMG}tb-500-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3000, imageUrl: `${IMG}ghk-cu-50mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4500, imageUrl: `${IMG}ghk-cu-100mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('ghk-cu') },
  { productSlug: 'retatrutide', mg: 5, priceCents: 5500, imageUrl: `${IMG}axon-rt-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-rt') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7000, imageUrl: `${IMG}axon-rt-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 9500, imageUrl: `${IMG}axon-rt-20mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 13000, imageUrl: `${IMG}axon-rt-30mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-rt') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 15500, imageUrl: `${IMG}axon-rt-40mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-rt') },
  { productSlug: 'tirzepatide', mg: 15, priceCents: 6000, imageUrl: `${IMG}axon-tz-15mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-tz') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 7000, imageUrl: `${IMG}axon-tz-20mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 8500, imageUrl: `${IMG}axon-tz-30mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-tz') },
  { productSlug: 'tirzepatide', mg: 45, priceCents: 10500, imageUrl: `${IMG}axon-tz-45mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-tz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 13000, imageUrl: `${IMG}axon-tz-60mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-tz') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 3500, imageUrl: `${IMG}axon-sm-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-sm') },
  { productSlug: 'semaglutide', mg: 15, priceCents: 5000, imageUrl: `${IMG}axon-sm-15mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-sm') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 7000, imageUrl: `${IMG}axon-sm-20mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-sm') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 10000, imageUrl: `${IMG}axon-sm-30mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('axon-sm') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 5500, imageUrl: `${IMG}cagrilintide-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 9000, imageUrl: `${IMG}cagrilintide-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 3500, imageUrl: `${IMG}ipamorelin-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 5000, imageUrl: `${IMG}ipamorelin-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: shopProduct('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 8000, imageUrl: 'https://shop.axonchems.com/wp-content/uploads/2026/06/tesamorelin-10mg-vial-1024x1024.webp', coaUrl: COA_PAGE, productUrl: shopProduct('tesamorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 6500, imageUrl: `${IMG}sermorelin-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 5500, imageUrl: `${IMG}nad-plus-500mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('nad-plus') },
  { productSlug: 'nad', mg: 1000, priceCents: 9000, imageUrl: `${IMG}nad-plus-1000mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('nad-plus') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4000, imageUrl: `${IMG}mots-c-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3500, imageUrl: `${IMG}epithalon-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 5000, imageUrl: `${IMG}semax-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', form: 'spray', mg: 5, priceCents: 4500, imageUrl: `${IMG}semax-nasal-spray-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('semax-nasal-spray') },
  { productSlug: 'semax', form: 'spray', mg: 10, priceCents: 5500, imageUrl: `${IMG}semax-nasal-spray-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('semax-nasal-spray') },
  { productSlug: 'selank', mg: 10, priceCents: 5000, imageUrl: `${IMG}selank-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', form: 'spray', mg: 5, priceCents: 4500, imageUrl: `${IMG}selank-nasal-spray-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('selank-nasal-spray') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 5500, imageUrl: `${IMG}selank-nasal-spray-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('selank-nasal-spray') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 4500, imageUrl: `${IMG}5-amino-1mq-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5500, imageUrl: `${IMG}ss-31-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 10, priceCents: 5000, imageUrl: `${IMG}dsip-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', form: 'spray', mg: 5, priceCents: 4000, imageUrl: `${IMG}dsip-nasal-spray-5mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('dsip-nasal-spray') },
  { productSlug: 'dsip', form: 'spray', mg: 10, priceCents: 5500, imageUrl: `${IMG}dsip-nasal-spray-10mg-1024x1024.webp`, coaUrl: COA_PAGE, productUrl: product('dsip-nasal-spray') },
  { productSlug: 'glutathione', mg: 600, priceCents: 4500, imageUrl: `${IMG}glutathione-600mg-600x600.webp`, coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'ahk-cu', mg: 100, priceCents: 7000, imageUrl: 'https://shop.axonchems.com/wp-content/uploads/2026/06/ahkcu-100mg-vial-1-1024x1024.webp', coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 4000, imageUrl: 'https://shop.axonchems.com/wp-content/uploads/2026/06/melanotan-1-10mg-vial-600x600.webp', coaUrl: COA_PAGE, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4000, imageUrl: 'https://shop.axonchems.com/wp-content/uploads/2026/06/melanotan-2-10mg-vial-600x600.webp', coaUrl: COA_PAGE, productUrl: product('melanotan-2') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 7000, imageUrl: `${IMG}cjc-1295-no-dac-10mg-600x600.webp`, coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 7500, imageUrl: `${IMG}glow-peptide-blend-50mg-600x600.webp`, coaUrl: COA_PAGE, productUrl: product('glow-peptide-blend') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 10500, imageUrl: 'https://shop.axonchems.com/wp-content/uploads/2026/06/klow-80mg-vial-1-600x600.webp', coaUrl: COA_PAGE, productUrl: product('klow-peptide-blend') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 899, imageUrl: `${IMG}bacteriostatic-water-10ml-600x600.webp`, coaUrl: COA_PAGE, productUrl: `https://shop.axonchems.com/product/bacteriostatic-water/?attribute_size=10mL&aff=Dlj7pbr` },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 2500, imageUrl: `${IMG}bacteriostatic-water-30ml-600x600.webp`, coaUrl: COA_PAGE, productUrl: `https://shop.axonchems.com/product/bacteriostatic-water/?attribute_size=30mL&aff=Dlj7pbr` },
  { productSlug: 'wolverine', mg: 10, priceCents: 6000, imageUrl: `${IMG}bpc-157-tb-500-blend-10mg-total-600x600.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-blend') },
];

runSeed({ supplierSlug: 'axon-chems-2', listings });
