// Adds Nuvion Health's product listings, as supplied from nuvion.health,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor's general COA page rather than a certificate per listing; it is the link supplied for every product.
const COA_PAGE = 'https://nuvion.health/certificates-of-analysis/ref/peplookup/';
const WEBP = 'https://nuvion.health/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/';
const UPLOADS = 'https://nuvion.health/wp-content/uploads/';
const product = (slug) => `https://nuvion.health/peptides/${slug}/ref/peplookup/`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 6900, imageUrl: `${WEBP}2026/09/bpc-157-10mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 11900, imageUrl: `${UPLOADS}2026/09/bpc-157-20mg.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 9900, imageUrl: `${UPLOADS}2026/09/tb-500-10mg.png`, coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 8900, imageUrl: `${WEBP}2026/09/ghk-cu-100mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 12900, imageUrl: `${UPLOADS}2026/09/retatrutide-10mg.png`, coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 21900, imageUrl: `${UPLOADS}2026/09/retatrutide-20mg.png`, coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 29900, imageUrl: `${UPLOADS}2026/09/retatrutide-30mg.png`, coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 35900, imageUrl: `${UPLOADS}2026/09/retatrutide-40mg-e1789468667951.png`, coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 41900, imageUrl: `${UPLOADS}2026/09/retatrutide-50mg.png`, coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 44900, imageUrl: `${UPLOADS}2026/09/retatrutide-50mg.png`, coaUrl: COA_PAGE, productUrl: product('retatrutide') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 8900, inStock: false, imageUrl: `${UPLOADS}2026/09/tirzepatide-10mg.png`, coaUrl: COA_PAGE, productUrl: product('tirzepatide') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 24900, imageUrl: `${UPLOADS}2026/09/tirzepatide-60mg.png`, coaUrl: COA_PAGE, productUrl: product('tirzepatide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 14900, imageUrl: `${UPLOADS}2026/09/cagrilintide-10mg.png`, coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 7900, imageUrl: `${UPLOADS}2026/09/ipamorelin-10mg.png`, coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 11900, imageUrl: `${UPLOADS}2026/09/tesamorelin-10mg.png`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 6900, imageUrl: `${WEBP}2026/09/sermorelin-5mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 8900, imageUrl: `${WEBP}2026/09/nadplus-500mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 6900, imageUrl: `${UPLOADS}2026/09/mots-c-10mg.png`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3900, imageUrl: `${UPLOADS}2026/09/epithalon-10mg.png`, coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 4500, imageUrl: `${UPLOADS}2026/09/semax-10mg.png`, coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 3900, imageUrl: `${WEBP}2026/09/selank-10mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 7900, imageUrl: `${UPLOADS}2026/09/pt-141-10mg.png`, coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 5900, imageUrl: `${UPLOADS}2026/09/5-amino-1mq-10mg.png`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 7900, imageUrl: `${WEBP}2026/09/ss-31-10mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 10, priceCents: 8900, imageUrl: `${WEBP}2026/09/dsip-10mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('dsip-delta-sleep-inducing-peptide') },
  { productSlug: 'ghrp-2', mg: 10, priceCents: 5900, imageUrl: `${UPLOADS}2026/09/ghrp-2-10mg.png`, coaUrl: COA_PAGE, productUrl: product('ghrp-2') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 4900, imageUrl: `${UPLOADS}2026/09/melanotan-1-10mg.png`, coaUrl: COA_PAGE, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4900, imageUrl: `${UPLOADS}2026/09/melanotan-2-10mg.png`, coaUrl: COA_PAGE, productUrl: product('melanotan-2') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 9900, imageUrl: `${UPLOADS}2026/09/cjc-1295-no-dac-10mg.png`, coaUrl: COA_PAGE, productUrl: product('cjc1295-no-dac') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 14900, imageUrl: `${UPLOADS}2026/09/nuvion-glow-70mg.png`, coaUrl: COA_PAGE, productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 17900, imageUrl: `${WEBP}2026/09/klow-80mg.png.webp`, coaUrl: COA_PAGE, productUrl: product('klow') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1900, imageUrl: `${UPLOADS}2026/09/nuvion-bac-water-10ml.png`, coaUrl: COA_PAGE, productUrl: product('bac-water') },
];

runSeed({ supplierSlug: 'nuvion-health-2', listings });
