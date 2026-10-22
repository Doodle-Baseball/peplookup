// Adds Eon Peptides' product listings, as supplied from eonpeptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's COA library. 10-vial kits store the single-vial size
// with `count: 10` and the kit price. Listings with no stock status take the shared
// default (in stock); NAD+ 1000mg and L-Glutathione were supplied as out of stock.
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?utm_source=affiliate_marketing&code=PEPLOOKUP';
const COA_PAGE = `https://eonpeptides.com/coa-library${REF}`;
const image = (file) => `https://eonpeptides.com/assets/img/products/${file}`;
const product = (slug) => `https://eonpeptides.com/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3000, imageUrl: image('bpc-157.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },

  { productSlug: 'tb-500', mg: 10, priceCents: 4250, imageUrl: image('tb-500.webp'), coaUrl: COA_PAGE, productUrl: product('tb-500') },

  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 5000, imageUrl: image('bpc-157-tb500.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb500') },
  { productSlug: 'bpc-157-tb-500', mg: 20, count: 10, priceCents: 45000, imageUrl: image('packs/bpc-157-tb500-10-pack-20mg.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb500-10-pack') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 2000, imageUrl: image('ghk-cu.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 2750, imageUrl: image('variants/ghk-cu-100mg.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },

  { productSlug: 'retatrutide', mg: 5, priceCents: 2250, imageUrl: image('variants/rt-glp-3x-2-5mg.webp'), coaUrl: COA_PAGE, productUrl: product('rt-glp-3x-2') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 4000, imageUrl: image('variants/rt-glp-3x-2-10mg.webp'), coaUrl: COA_PAGE, productUrl: product('rt-glp-3x-2') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 5750, imageUrl: image('variants/rt-glp-3x-2-20mg.webp'), coaUrl: COA_PAGE, productUrl: product('rt-glp-3x-2') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 7250, imageUrl: image('variants/rt-glp-3x-2-30mg.webp'), coaUrl: COA_PAGE, productUrl: product('rt-glp-3x-2') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 11250, imageUrl: image('variants/rt-glp-3x-2-60mg.webp'), coaUrl: COA_PAGE, productUrl: product('rt-glp-3x-2') },
  { productSlug: 'retatrutide', mg: 5, count: 10, priceCents: 20000, imageUrl: image('packs/glp-3-rt-10-pack-5mg.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt-10-pack') },
  { productSlug: 'retatrutide', mg: 10, count: 10, priceCents: 36000, imageUrl: image('packs/glp-3-rt-10-pack-10mg.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt-10-pack') },
  { productSlug: 'retatrutide', mg: 30, count: 10, priceCents: 65000, imageUrl: image('packs/glp-3-rt-10-pack-30mg.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt-10-pack') },
  { productSlug: 'retatrutide', mg: 60, count: 10, priceCents: 101000, imageUrl: image('packs/glp-3-rt-10-pack-60mg.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt-10-pack') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 3750, imageUrl: image('variants/tz-glp-2x-10mg.webp'), coaUrl: COA_PAGE, productUrl: product('tz-glp-2x') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 5000, imageUrl: image('variants/tz-glp-2x-30mg.webp'), coaUrl: COA_PAGE, productUrl: product('tz-glp-2x') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 8250, imageUrl: image('variants/tz-glp-2x-60mg.webp'), coaUrl: COA_PAGE, productUrl: product('tz-glp-2x') },
  { productSlug: 'tirzepatide', mg: 100, priceCents: 12250, imageUrl: image('variants/tz-glp-2x-100mg.webp'), coaUrl: COA_PAGE, productUrl: product('tz-glp-2x') },
  { productSlug: 'tirzepatide', mg: 10, count: 10, priceCents: 33500, imageUrl: image('packs/glp-2-tz-10-pack-10mg.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz-10-pack') },
  { productSlug: 'tirzepatide', mg: 30, count: 10, priceCents: 45000, imageUrl: image('packs/glp-2-tz-10-pack-30mg.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz-10-pack') },

  { productSlug: 'semaglutide', mg: 20, priceCents: 4250, imageUrl: image('glp-1-s.webp'), coaUrl: COA_PAGE, productUrl: product('glp-1-s') },

  { productSlug: 'cagrilintide', mg: 10, priceCents: 4750, imageUrl: image('cagri.webp'), coaUrl: COA_PAGE, productUrl: product('cagri') },

  { productSlug: 'ipamorelin', mg: 10, priceCents: 3500, imageUrl: image('ipamorelin.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 4500, imageUrl: image('tesamorelin.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 10, count: 10, priceCents: 40500, imageUrl: image('packs/tesamorelin-10-pack-10mg.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin-10-pack') },

  { productSlug: 'sermorelin', mg: 10, priceCents: 4250, imageUrl: image('sermorelin.webp'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },

  { productSlug: 'nad', mg: 100, priceCents: 2000, imageUrl: image('variants/nad-100mg.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 500, priceCents: 3500, imageUrl: image('nad.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 4250, inStock: false, imageUrl: image('variants/nad-1000mg.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },

  { productSlug: 'mots-c', mg: 10, priceCents: 3000, imageUrl: image('mots-c.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 30, priceCents: 6000, imageUrl: image('variants/mots-c-30mg.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 50, priceCents: 8000, imageUrl: image('variants/mots-c-50mg.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },

  { productSlug: 'epitalon', mg: 50, priceCents: 4250, imageUrl: image('epithalon.webp'), coaUrl: COA_PAGE, productUrl: product('epithalon') },

  { productSlug: 'semax', mg: 10, priceCents: 3000, imageUrl: image('semax.webp'), coaUrl: COA_PAGE, productUrl: product('semax') },

  { productSlug: 'selank', mg: 10, priceCents: 3000, imageUrl: image('selank.webp'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'selank', mg: 60, priceCents: 7000, imageUrl: image('variants/selank-60mg.webp'), coaUrl: COA_PAGE, productUrl: product('selank') },

  { productSlug: 'pt-141', mg: 10, priceCents: 2250, imageUrl: image('pt-141.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141') },

  { productSlug: '5-amino-1mq', mg: 50, priceCents: 4250, imageUrl: image('5-amino-1mq.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 100, priceCents: 7000, imageUrl: image('variants/5-amino-1mq-100mg.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 3000, imageUrl: image('ss-31.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 30, priceCents: 6000, imageUrl: image('variants/ss-31-30mg.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 8000, imageUrl: image('variants/ss-31-50mg.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },

  { productSlug: 'dsip', mg: 5, priceCents: 2250, imageUrl: image('variants/dsip-5mg.webp'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 10, priceCents: 3250, imageUrl: image('variants/dsip-10mg.webp'), coaUrl: COA_PAGE, productUrl: product('dsip') },

  { productSlug: 'glutathione', mg: 1500, priceCents: 8500, inStock: false, imageUrl: image('l-glutathione.webp'), coaUrl: COA_PAGE, productUrl: product('l-glutathione') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 2250, imageUrl: image('melanotan-ii.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii') },

  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 2250, imageUrl: image('cjc-1295.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295') },

  { productSlug: 'glow', mg: 70, priceCents: 5250, imageUrl: image('glow.webp'), coaUrl: COA_PAGE, productUrl: product('glow') },

  { productSlug: 'klow', mg: 80, priceCents: 6250, imageUrl: image('klow-blend.webp'), coaUrl: COA_PAGE, productUrl: product('klow-blend') },
  { productSlug: 'klow', mg: 80, count: 10, priceCents: 56000, imageUrl: image('packs/klow-10-pack-80mg.webp'), coaUrl: COA_PAGE, productUrl: product('klow-10-pack') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 4250, imageUrl: image('cjc-ipa-blend.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-ipa-blend') },
];

runSeed({ supplierSlug: 'eon-peptides', listings });
