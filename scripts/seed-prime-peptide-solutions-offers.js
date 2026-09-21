// Adds Prime Peptide Solutions' product listings, as supplied from primepepsolutions.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const photo = (file) => `https://primepepsolutions.com/static/uploads/products/${file}`;
const coa = (file) => `https://primepepsolutions.com/static/uploads/coas/${file}`;
const product = (path) => `https://primepepsolutions.com/product/${path}?ref=PEPLOOKUP`;

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no COA was supplied.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4999, imageUrl: photo('32a2e4fc14f2a1fc.webp'), coaUrl: null, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 6999, imageUrl: photo('cf91b3f27a979a5b.webp'), coaUrl: null, productUrl: product('tb-500') },
  // The same Wolverine listing, supplied under both the BPC-157 + TB-500 and Wolverine compounds.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 8999, imageUrl: photo('0e7136997006168f.webp'), coaUrl: coa('9823a55c1748084d.pdf'), productUrl: product('wolverine') },
  { productSlug: 'wolverine', mg: 20, priceCents: 8999, imageUrl: photo('0e7136997006168f.webp'), coaUrl: coa('9823a55c1748084d.pdf'), productUrl: product('wolverine') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 4499, imageUrl: photo('1e358fb04c70be38.webp'), coaUrl: coa('a3d03aae010a55f1.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 6999, imageUrl: photo('1e358fb04c70be38.webp'), coaUrl: coa('a3d03aae010a55f1.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7999, imageUrl: photo('cffee6b8ac493a48.webp'), coaUrl: coa('27fcf7dbcfa0815e.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12999, imageUrl: photo('cffee6b8ac493a48.webp'), coaUrl: coa('27fcf7dbcfa0815e.pdf'), productUrl: product('glp-3-rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 4999, imageUrl: photo('4bbadb7a4e493810.webp'), coaUrl: null, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 7999, imageUrl: photo('4bbadb7a4e493810.webp'), coaUrl: null, productUrl: product('glp-2-tz') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 6999, imageUrl: photo('18a2448359941703.webp'), coaUrl: null, productUrl: product('glp-1-sm') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4999, imageUrl: photo('085e32c60946ce7e.webp'), coaUrl: null, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7999, imageUrl: photo('1d6f8b17784128f8.webp'), coaUrl: coa('819602f49a7ade0e.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 11999, imageUrl: photo('1d6f8b17784128f8.webp'), coaUrl: coa('819602f49a7ade0e.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'nad', mg: 1000, priceCents: 7499, imageUrl: photo('3ebc5ee6c29b3379.webp'), coaUrl: null, productUrl: product('nad-plus') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3999, imageUrl: photo('e84f2f994e58a678.webp'), coaUrl: coa('18431061806aee71.pdf'), productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 20, priceCents: 4999, imageUrl: photo('e84f2f994e58a678.webp'), coaUrl: coa('18431061806aee71.pdf'), productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 8999, imageUrl: photo('e84f2f994e58a678.webp'), coaUrl: coa('18431061806aee71.pdf'), productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 4499, imageUrl: photo('f75259d3a34178e4.webp'), coaUrl: null, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 3999, imageUrl: photo('d353c23b462ac0a2.webp'), coaUrl: null, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 4499, imageUrl: photo('9c9a8633609aeb1b.webp'), coaUrl: null, productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 4499, imageUrl: photo('85a2d31c9e36351c.webp'), coaUrl: null, productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 4999, imageUrl: photo('83912ce018720287.webp'), coaUrl: null, productUrl: product('5-amino-1mq') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5999, imageUrl: photo('44b598cd5ff13d59.webp'), coaUrl: null, productUrl: product('ss-31') },
  { productSlug: 'dsip', mg: 10, priceCents: 3499, imageUrl: photo('2951abddc8ef45da.webp'), coaUrl: null, productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 5999, imageUrl: photo('3c8d0d6fc46aa00f.webp'), coaUrl: null, productUrl: product('glutathione') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3999, imageUrl: photo('4cea73134e64bbbb.webp'), coaUrl: null, productUrl: product('melanotan-ii') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3999, imageUrl: photo('58ae650383a6d99a.webp'), coaUrl: null, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 7499, imageUrl: photo('58ae650383a6d99a.webp'), coaUrl: null, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6999, imageUrl: photo('79be3ee590e376f8.webp'), coaUrl: coa('08cfb01fb663ebe1.pdf'), productUrl: product('cjc-1295-ipamorelin') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 10999, imageUrl: photo('79be3ee590e376f8.webp'), coaUrl: coa('08cfb01fb663ebe1.pdf'), productUrl: product('cjc-1295-ipamorelin') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 11000, imageUrl: photo('7a77b10fd747baf4.webp'), coaUrl: coa('423996e09f0e7a56.pdf'), productUrl: product('klow-stack') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, sizes in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 999, imageUrl: photo('001cb086f4c20855.webp'), coaUrl: null, productUrl: product('bacteriostatic-water') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1799, imageUrl: photo('001cb086f4c20855.webp'), coaUrl: null, productUrl: product('bacteriostatic-water') },
];

runSeed({ supplierSlug: 'prime-peptide-solutions-2', listings });
