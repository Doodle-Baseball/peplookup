// Adds Heez Research's product listings, as supplied from heezresearch.com, to
// the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor serves its product photos through its own Next.js image route.
const render = (file) => `https://heezresearch.com/_next/image/?q=75&url=%2Frenders%2F${file}&w=3840`;
const coa = (file) => `https://heezresearch.com/coa/${file}`;
const product = (path) => `https://heezresearch.com/product/${path}/?ref=peplookup`;

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no certificate was supplied.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 5000, imageUrl: render('BPC-157-5mg.webp'), coaUrl: coa('bpc-157-coa.webp'), productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 7000, imageUrl: render('BPC-157-5mg.webp'), coaUrl: coa('bpc-157-coa.webp'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 9500, imageUrl: render('TB-500-10mg.webp'), coaUrl: null, productUrl: product('tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 5000, imageUrl: render('GHK-Cu-50mg.webp'), coaUrl: coa('Chromate_Job_36488.webp'), productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 7500, imageUrl: render('GHK-Cu-50mg.webp'), coaUrl: coa('Chromate_Job_36488.webp'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 10000, imageUrl: render('GLP-3-RT-10mg.webp'), coaUrl: coa('Chromate_Job_36277.webp'), productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 19500, imageUrl: render('GLP-3-RT-10mg.webp'), coaUrl: coa('retatrutide-20mg-coa.webp'), productUrl: product('retatrutide') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 8500, imageUrl: render('GLP-2-TZ-10mg.webp'), coaUrl: null, productUrl: product('tirzepatide') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 7500, imageUrl: render('GLP-1-SM-10mg.webp'), coaUrl: null, productUrl: product('semaglutide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 5500, imageUrl: render('Ipamorelin-10mg.webp'), coaUrl: null, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 11500, imageUrl: render('Tesamorelin-10mg.webp'), coaUrl: coa('tesamorelin-coa.webp'), productUrl: product('tesamorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 8500, imageUrl: render('NAD-plus-500mg.webp'), coaUrl: null, productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 6500, imageUrl: render('MOTS-c-10mg.webp'), coaUrl: coa('mots-c-coa.webp'), productUrl: product('mots-c') },
  { productSlug: 'semax', mg: 10, priceCents: 5500, imageUrl: render('Semax-10mg.webp'), coaUrl: null, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 5500, imageUrl: render('Selank-10mg.webp'), coaUrl: null, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 5500, imageUrl: render('PT-141-10mg.webp'), coaUrl: coa('pt-141-coa.webp'), productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 6500, imageUrl: render('5-AMINO-1MQ-10mg.webp'), coaUrl: null, productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6599, imageUrl: render('SS-31-10mg.webp'), coaUrl: coa('ss-31-coa.webp'), productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 5, priceCents: 4500, imageUrl: render('DSIP-5mg.webp'), coaUrl: null, productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 6999, imageUrl: render('Glutathione-1500mg.webp'), coaUrl: null, productUrl: product('glutathione') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 5000, imageUrl: render('Melanotan-1-10mg.webp'), coaUrl: null, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5000, imageUrl: render('Melanotan-2-10mg.webp'), coaUrl: coa('Chromate_Job_37509.webp'), productUrl: product('melanotan-2') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 12500, imageUrl: render('GLOW-70mg.webp'), coaUrl: null, productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 14500, imageUrl: render('Klow-80mg.webp'), coaUrl: coa('klow-coa.webp'), productUrl: product('klow') },
  // 10 mL of solution, stored on the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2300, imageUrl: render('Bacteriostatic-Water-3ml.webp'), coaUrl: null, productUrl: product('bacteriostatic-water') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 8000, imageUrl: render('Cjc-1295-no-dac-plus-Ipamorelin-5mg-5mg.webp'), coaUrl: null, productUrl: product('cjc-1295-ipamorelin') },
  { productSlug: 'wolverine', mg: 10, priceCents: 8999, imageUrl: render('Wolverine-10mg.webp'), coaUrl: coa('wolverine-coa.webp'), productUrl: product('wolverine') },
];

runSeed({ supplierSlug: 'heez-research-2', listings });
