// Adds Vantage Aminos' product listings, as supplied from vantageaminos.co, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://vantageaminos.co/wp-content/uploads/${path}`;
const product = (path) => `https://vantageaminos.co/product/${path}/?ref=peplookup`;

// Prices in integer cents, sizes in mg (a blend's total; a spray's or pen's peptide content).
// coaUrl is null where no COA was supplied.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 6000, imageUrl: upload('2026/06/va_img_80-3-300x300.webp'), coaUrl: upload('2026/08/bpc-157-coa-VA-2512-8344.pdf'), productUrl: product('bpc-157-body-protection-compound-157') },
  // The vendor lists its BPC-157 vial certificate for the nasal spray as well.
  { productSlug: 'bpc-157', form: 'spray', mg: 5, priceCents: 6300, imageUrl: upload('2026/06/va_img_104-5-600x600.webp'), coaUrl: upload('2026/08/bpc-157-coa-VA-2512-8344.pdf'), productUrl: product('bpc-157-nasal-spray') },
  { productSlug: 'tb-500', mg: 5, priceCents: 6000, imageUrl: upload('2026/06/va_img_81-5-600x600.webp'), coaUrl: null, productUrl: product('tb-500-thymosin-beta-4-fragment') },
  { productSlug: 'tb-500', form: 'spray', mg: 5, priceCents: 6300, imageUrl: upload('2026/06/va_img_105-5-600x600.webp'), coaUrl: null, productUrl: product('tb-500-nasal-spray') },
  // 10 mg + 10 mg.
  { productSlug: 'bpc-157-tb-500', form: 'pen', mg: 20, priceCents: 17000, imageUrl: upload('2026/08/va_pen_img_750-1-600x600.webp'), coaUrl: null, productUrl: product('bpc-157-tb-500-pen') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 8000, imageUrl: upload('2026/06/va_img_82-3-300x300.webp'), coaUrl: upload('2026/08/ghk-cu-coa-VA-2512-0552.pdf'), productUrl: product('ghk-cu-copper-peptide') },
  { productSlug: 'ghk-cu', form: 'pen', mg: 100, priceCents: 13500, imageUrl: upload('2026/08/va_pen_img_751-1-600x600.webp'), coaUrl: null, productUrl: product('ghk-cu-pen') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 12500, imageUrl: upload('2026/06/va_img_103-5-600x600.webp'), coaUrl: upload('2026/07/glp-3-reta-coa-VA-2512-4676.pdf'), productUrl: product('va-3r') },
  { productSlug: 'retatrutide', form: 'pen', mg: 30, priceCents: 36000, imageUrl: upload('2026/08/va_pen_img_748-1-600x600.webp'), coaUrl: null, productUrl: product('va-3r-pen') },
  { productSlug: 'tirzepatide', mg: 5, priceCents: 6200, imageUrl: upload('2026/06/va_img_102-5-600x600.webp'), coaUrl: upload('2026/07/glp-2-tirz-coa-VA-2512-0836.pdf'), productUrl: product('va-2t') },
  { productSlug: 'tirzepatide', form: 'pen', mg: 30, priceCents: 29000, imageUrl: upload('2026/08/va_pen_img_749-1-600x600.webp'), coaUrl: null, productUrl: product('va-2t-pen') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 6800, imageUrl: upload('2026/06/va_img_101-5-600x600.webp'), coaUrl: upload('2026/07/glp-1-sema-coa-VA-2512-4447-1.pdf'), productUrl: product('va-1s') },
  { productSlug: 'semaglutide', form: 'pen', mg: 20, priceCents: 22500, imageUrl: upload('2026/08/va_pen_img_748-1-600x600.webp'), coaUrl: null, productUrl: product('va-1s-pen') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 6500, imageUrl: upload('2026/06/va_img_93-5-600x600.webp'), coaUrl: null, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', form: 'spray', mg: 5, priceCents: 6300, imageUrl: upload('2026/06/va_img_108-5-600x600.webp'), coaUrl: null, productUrl: product('ipamorelin-nasal-spray') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 7500, imageUrl: upload('2026/06/va_img_87-5-600x600.webp'), coaUrl: null, productUrl: product('tesamorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 9200, imageUrl: upload('2026/06/va_img_85-5-600x600.webp'), coaUrl: null, productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 7800, imageUrl: upload('2026/06/va_img_86-5-600x600.webp'), coaUrl: null, productUrl: product('mots-c') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 9500, imageUrl: upload('2026/06/va_img_101-5-600x600.webp'), coaUrl: null, productUrl: product('5-amino-1mq') },
  { productSlug: 'pt-141', mg: 10, priceCents: 6600, imageUrl: upload('2026/06/va_img_97-5-600x600.webp'), coaUrl: null, productUrl: product('pt-141-bremelanotide') },
  { productSlug: 'pt-141', form: 'spray', mg: 10, priceCents: 6300, imageUrl: upload('2026/06/va_img_110-5-600x600.webp'), coaUrl: null, productUrl: product('pt-141-nasal-spray-bremelanotide') },
  { productSlug: 'selank', mg: 5, priceCents: 4600, imageUrl: upload('2026/06/va_img_98-5-600x600.webp'), coaUrl: null, productUrl: product('selank') },
  { productSlug: 'selank', form: 'spray', mg: 5, priceCents: 6300, imageUrl: upload('2026/06/va_img_111-5-600x600.webp'), coaUrl: null, productUrl: product('selank-nasal-spray') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 7000, imageUrl: upload('2026/06/va_img_95-5-600x600.webp'), coaUrl: null, productUrl: product('mt-2') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 8000, imageUrl: upload('2026/06/va_img_92-3-300x300.webp'), coaUrl: upload('2026/08/cjc-1295-no-dac-coa-VA-2512-9601.pdf'), productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'cjc-1295-no-dac', form: 'spray', mg: 5, priceCents: 6300, imageUrl: upload('2026/06/va_img_107-5-600x600.webp'), coaUrl: null, productUrl: product('cjc-1295-nasal-spray-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', form: 'pen', mg: 20, priceCents: 17000, imageUrl: upload('2026/08/va_pen_img_749-1-600x600.webp'), coaUrl: null, productUrl: product('cjc-1295-ipamorelin-pen') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 17500, imageUrl: upload('2026/06/va_img_83-5-600x600.webp'), coaUrl: upload('2026/07/glow-coa-VA-2602-7527.pdf'), productUrl: product('glow-70-blend') },
];

runSeed({ supplierSlug: 'vantage-aminos-2', listings });
