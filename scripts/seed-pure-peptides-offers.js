// Adds Pure Peptides's product listings, as supplied from purepeptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general compliance (COA) page.
// No stock status was supplied, so listings take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?ref=ADAMDAN9789';
const COA_PAGE = `https://purepeptides.com/compliance${REF}`;
const image = (slug) => `https://purepeptides.com/products/${slug}.webp`;
const product = (slug) => `https://purepeptides.com/product/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 2900, imageUrl: image('bpc-157'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 5100, imageUrl: image('bpc-157'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },

  { productSlug: 'tb-500', mg: 5, priceCents: 3000, imageUrl: image('tb-500'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 6000, imageUrl: image('tb-500'), coaUrl: COA_PAGE, productUrl: product('tb-500') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 5100, imageUrl: image('ghk-cu'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 9800, imageUrl: image('ghk-cu'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },

  { productSlug: 'ipamorelin', mg: 5, priceCents: 2900, imageUrl: image('ipamorelin'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 5700, imageUrl: image('ipamorelin'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 5, priceCents: 4300, imageUrl: image('tesamorelin'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7500, imageUrl: image('tesamorelin'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },

  { productSlug: 'sermorelin', mg: 5, priceCents: 4200, imageUrl: image('sermorelin-grf-1-29'), coaUrl: COA_PAGE, productUrl: product('sermorelin-grf-1-29') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 8300, imageUrl: image('sermorelin-grf-1-29'), coaUrl: COA_PAGE, productUrl: product('sermorelin-grf-1-29') },

  { productSlug: 'nad', mg: 500, priceCents: 4800, imageUrl: image('nad'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 8400, imageUrl: image('nad'), coaUrl: COA_PAGE, productUrl: product('nad') },

  { productSlug: 'mots-c', mg: 10, priceCents: 4300, imageUrl: image('mots-c'), coaUrl: COA_PAGE, productUrl: product('mots-c') },

  { productSlug: 'epitalon', mg: 10, priceCents: 4000, imageUrl: image('epitalon'), coaUrl: COA_PAGE, productUrl: product('epitalon') },

  { productSlug: 'semax', mg: 5, priceCents: 3500, imageUrl: image('semax'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', mg: 10, priceCents: 5000, imageUrl: image('semax'), coaUrl: COA_PAGE, productUrl: product('semax') },

  { productSlug: 'selank', mg: 5, priceCents: 2600, imageUrl: image('selank'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', mg: 10, priceCents: 4900, imageUrl: image('selank'), coaUrl: COA_PAGE, productUrl: product('selank') },

  { productSlug: 'pt-141', mg: 10, priceCents: 3900, imageUrl: image('pt-141'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: 'pt-141', mg: 20, priceCents: 7400, imageUrl: image('pt-141'), coaUrl: COA_PAGE, productUrl: product('pt-141') },

  { productSlug: 'ss-31-elamipretide', mg: 5, priceCents: 3300, imageUrl: image('ss-31'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5800, imageUrl: image('ss-31'), coaUrl: COA_PAGE, productUrl: product('ss-31') },

  { productSlug: 'dihexa', mg: 10, priceCents: 4200, imageUrl: image('dihexa'), coaUrl: COA_PAGE, productUrl: product('dihexa') },

  { productSlug: 'dsip', mg: 5, priceCents: 3500, imageUrl: image('dsip'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 10, priceCents: 6300, imageUrl: image('dsip'), coaUrl: COA_PAGE, productUrl: product('dsip') },

  { productSlug: 'ghrp-2', mg: 5, priceCents: 2100, imageUrl: image('ghrp-2'), coaUrl: COA_PAGE, productUrl: product('ghrp-2') },

  { productSlug: 'hexarelin', mg: 5, priceCents: 5000, imageUrl: image('hexarelin'), coaUrl: COA_PAGE, productUrl: product('hexarelin') },
  { productSlug: 'hexarelin', mg: 10, priceCents: 9600, imageUrl: image('hexarelin'), coaUrl: COA_PAGE, productUrl: product('hexarelin') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 4600, imageUrl: image('melanotan-2'), coaUrl: COA_PAGE, productUrl: product('melanotan-2') },

  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3900, imageUrl: image('cjc-1295'), coaUrl: COA_PAGE, productUrl: product('cjc-1295') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 6400, imageUrl: image('cjc-1295'), coaUrl: COA_PAGE, productUrl: product('cjc-1295') },
];

runSeed({ supplierSlug: 'pure-peptides', listings });
