// Adds Aero Peptides's product listings, as supplied from aeropeptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// GLOW and KLOW were supplied with no size; the user confirmed the standard 70mg/80mg
// totals used for these blends elsewhere in this catalog.
const { runSeed } = require('./lib/seed-vendor-offers');

const LAB_RESULTS = 'https://aeropeptides.com/lab-results?ref=peplookup';
const IMG = (name, q) => `https://aeropeptides.com/_next/image?url=https%3A%2F%2Fwp.aeropeptides.com%2Fwp-content%2Fuploads%2F${name}&w=640&q=${q ?? 75}`;
const REF = '?ref=peplookup';
const product = (slug) => `https://aeropeptides.com/product/${slug}${REF}`;

const listings = [
  { productSlug: 'sermorelin', mg: 10, priceCents: 6499, imageUrl: IMG('2026%2F01%2FSERMORELIN-10MG.png'), coaUrl: LAB_RESULTS, productUrl: product('sermorelin-5-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6499, imageUrl: IMG('2026%2F07%2Fss-31-10mg.jpg'), coaUrl: LAB_RESULTS, productUrl: product('ss-31') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 799, imageUrl: IMG('2025%2F12%2FBAC-WATER.png'), coaUrl: LAB_RESULTS, productUrl: product('bacteriostatic-water-10mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 13999, imageUrl: IMG('2025%2F12%2FGLOW.png'), coaUrl: LAB_RESULTS, productUrl: product('glow-bpc-157-ghk-cu-tb500') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 14999, imageUrl: IMG('2025%2F12%2FKLOW.png'), coaUrl: LAB_RESULTS, productUrl: product('klow-bpc-157-ghk-cu-tb500-kpv') },
  { productSlug: 'semax', mg: 10, priceCents: 4499, imageUrl: IMG('2025%2F12%2FSEMAX.png'), coaUrl: LAB_RESULTS, productUrl: product('semax-10mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3999, imageUrl: IMG('2025%2F12%2FMOTS-C.png'), coaUrl: LAB_RESULTS, productUrl: product('mots-c-10mg') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 7499, imageUrl: IMG('2025%2F12%2FGLUTATHIONE.png'), coaUrl: LAB_RESULTS, productUrl: product('glutathione-1500mg') },
  { productSlug: 'nad', mg: 100, priceCents: 5999, imageUrl: IMG('2025%2F12%2FNAD.png'), coaUrl: LAB_RESULTS, productUrl: product('nad-100mg') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 2499, imageUrl: IMG('2025%2F12%2FMELANOTAN-I.png'), coaUrl: LAB_RESULTS, productUrl: product('melanotan-i') },
  { productSlug: 'melanotan-2', mg: 5, priceCents: 2999, imageUrl: IMG('2025%2F12%2FMELANOTAN-II.png'), coaUrl: LAB_RESULTS, productUrl: product('melanotan-ii-10mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4499, imageUrl: IMG('2025%2F12%2Fghk-full.png'), coaUrl: LAB_RESULTS, productUrl: product('ghk-cu-100mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 6499, imageUrl: IMG('2025%2F12%2FTESAMORELIN.png'), coaUrl: LAB_RESULTS, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6999, imageUrl: IMG('2025%2F12%2FCJC-1295-IPA-NODAC.png'), coaUrl: LAB_RESULTS, productUrl: product('cjc-1295-no-dac-5mg-ipa-5mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 6999, imageUrl: IMG('2025%2F12%2FCJC-1295-NODAC.png'), coaUrl: LAB_RESULTS, productUrl: product('cjc-1295-no-dac-10mg') },
  { productSlug: 'tb-500', mg: 5, priceCents: 3999, imageUrl: IMG('2025%2F12%2FTB500.png'), coaUrl: LAB_RESULTS, productUrl: product('tb500-5mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4999, imageUrl: IMG('2025%2F12%2FTB500.png', 76), coaUrl: LAB_RESULTS, productUrl: product('tb500-5mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 4499, imageUrl: IMG('2025%2F12%2FBCP-157.png'), coaUrl: LAB_RESULTS, productUrl: product('bpc-157-10mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7999, imageUrl: IMG('2025%2F12%2FRETATRUTIDE.png'), coaUrl: LAB_RESULTS, productUrl: product('retatrutide-10mg') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 7499, imageUrl: IMG('2025%2F12%2FTIRZEPATIDE.png'), coaUrl: LAB_RESULTS, productUrl: product('tirzepatide-10mg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 6999, imageUrl: IMG('2025%2F12%2FSEMAGLUTIDE.png'), coaUrl: LAB_RESULTS, productUrl: product('semaglutide-10mg') },
  { productSlug: 'wolverine', mg: 10, priceCents: 8999, imageUrl: IMG('2025%2F12%2FWOLVERINE-BLEND-55.png'), coaUrl: LAB_RESULTS, productUrl: product('bpc-5mg-tb-5mg') },
];

runSeed({ supplierSlug: 'aero-peptides-2', listings });
