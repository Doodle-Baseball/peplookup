// Adds Ech3lon Labs's product listings, as supplied from ech3lonlabs.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://ech3lonlabs.com/coa?ref=PRODUCTS';
const CDN = 'https://cdn.wegic.ai/assets/onepage/uploads/2046656757313896450/image/';
const REF = '?ref=PRODUCTS';
const product = (slug) => `https://ech3lonlabs.com/products/${slug}${REF}`;

const listings = [
  { productSlug: 'retatrutide', mg: 10, priceCents: 5000, imageUrl: `${CDN}2026/08/22/01M0K14MM8712M6S3WEA30PV50.png`, coaUrl: COA_PAGE, productUrl: product('glp3-rt-10mg') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 8500, imageUrl: `${CDN}2026/08/22/01M0K16TMMA0NQN8V4VBTAJ7BH.png`, coaUrl: COA_PAGE, productUrl: product('glp3-rt-30mg') },
  { productSlug: 'wolverine', mg: 20, priceCents: 7500, imageUrl: `${CDN}2026/04/22/01KPRPZS5Z8G9Z7D89X2TKE1F7.png`, coaUrl: COA_PAGE, productUrl: product('wolverine-20mg') },
  { productSlug: 'wolverine', mg: 10, priceCents: 5000, imageUrl: `${CDN}2026/04/22/01KPRXG78MVZ9TQFR1XMRB036R.png`, coaUrl: COA_PAGE, productUrl: product('wolverine-10mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5500, imageUrl: `${CDN}2026/04/22/01KPRXG78MYR72MBJ0J2P2FPQN.png`, coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'mots-c', mg: 20, priceCents: 5000, imageUrl: `${CDN}2026/04/22/01KPRXG78MY1T8Z57EN1EDF3HH.png`, coaUrl: COA_PAGE, productUrl: product('mots-c-20mg') },
  { productSlug: 'selank', mg: 10, priceCents: 3000, imageUrl: `${CDN}2026/04/22/01KPRXG78MNVS8B5Q9D5PRTKGD.png`, coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 3000, imageUrl: `${CDN}2026/04/22/01KPRXG78M3322SNWWYF5KA9NY.png`, coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 2500, imageUrl: `${CDN}2026/07/16/01KXKS3PT2BEYQ21PNJEC1XC7X.png`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4000, imageUrl: `${CDN}2026/04/22/01KPRXG78MGGVS9BEVX9DABQGJ.png`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-100mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 6000, imageUrl: `${CDN}2026/04/22/01KPRXG78MH0E1M6GVMF8AE7R3.png`, coaUrl: COA_PAGE, productUrl: product('glow-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 7000, imageUrl: `${CDN}2026/04/22/01KPRXG78MGCA74HY6F3Z2974B.png`, coaUrl: COA_PAGE, productUrl: product('klow-80mg') },
  { productSlug: 'nad', mg: 500, priceCents: 3500, imageUrl: `${CDN}2026/07/16/01KXKS816ZT604M6BXEQGZJ2NZ.png`, coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 6000, inStock: false, imageUrl: `${CDN}2026/05/11/01KRA0W6SW9CPFA0SD22H941RG.png`, coaUrl: COA_PAGE, productUrl: product('nad-plus-1000mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 4000, imageUrl: `${CDN}2026/05/01/01KQG1VKHBCF3NHRKMVP6FK9AR.png`, coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2500, imageUrl: `${CDN}2026/05/01/01KQG1VKHBM7Z301J8DZW2G6T5.png`, coaUrl: COA_PAGE, productUrl: product('mt2-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5500, imageUrl: `${CDN}2026/05/11/01KRA0D4DRWCXZNV204XFNM1PG.png`, coaUrl: COA_PAGE, productUrl: product('cjc1295-nodac-ipamorelin-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 5, priceCents: 3500, imageUrl: `${CDN}2026/07/15/01KXH79XZ78QRC5SJQXEBX8BJC.png`, coaUrl: COA_PAGE, productUrl: product('cjc1295-ipamorelin-5mg') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 2500, imageUrl: `${CDN}2026/07/02/01KWFDXA7T9DJH1G8AHQJ2CEGS.png`, coaUrl: COA_PAGE, productUrl: product('hospira-bac-water-30ml') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 5000, imageUrl: `${CDN}2026/07/02/01KWG5SX3R4AH629Y6AN5G4Z2F.png`, coaUrl: COA_PAGE, productUrl: product('glp2-trz-20mg') },
];

runSeed({ supplierSlug: 'ech3lon-labs-2', listings });
