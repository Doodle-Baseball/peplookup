// Adds Aminexa's product listings, as supplied from aminexa.net,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://www.aminexa.net/portal/coa?ref=PRODUCTS';
const IMAGES = 'https://fcpnwblwttnkpycovcwv.supabase.co/storage/v1/object/public/product-images/';
const REF = '?ref=PRODUCTS';
const product = (slug) => `https://www.aminexa.net/portal/product/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 14900, imageUrl: `${IMAGES}1787870314535-cbwryo.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 7900, imageUrl: `${IMAGES}1787870608604-qdrabo.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-10mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 14900, imageUrl: `${IMAGES}1787870297965-uslav2.png`, coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1499, imageUrl: `${IMAGES}1786756357454-9bj69f.png`, coaUrl: COA_PAGE, productUrl: product('bac-water-10ml') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 8900, imageUrl: `${IMAGES}1787870325827-uf2ddh.png`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 17900, imageUrl: `${IMAGES}1787870336466-scg3ve.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157-ghk-cu-tb-500-kpv-80mg') },
  { productSlug: '5-amino-1mq', mg: 5, priceCents: 2900, imageUrl: `${IMAGES}1787869472694-oo069c.png`, coaUrl: COA_PAGE, productUrl: product('5-amino-1-mq-5mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 8900, imageUrl: `${IMAGES}1787870548569-jeiir9.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 15900, imageUrl: `${IMAGES}1787870637710-p1ga4p.png`, coaUrl: COA_PAGE, productUrl: product('bpc-157-ghk-cu-tb-500') },
  { productSlug: 'dsip', mg: 5, priceCents: 5000, imageUrl: `${IMAGES}1787865675366-18el8s.png`, coaUrl: COA_PAGE, productUrl: product('dsip-5mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3900, imageUrl: `${IMAGES}1787870692330-kk1vs2.png`, coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 8900, imageUrl: `${IMAGES}1782423131232-wib4z6.png`, coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 5500, inStock: false, imageUrl: `${IMAGES}1787870737908-e6u1wm.png`, coaUrl: COA_PAGE, productUrl: product('ipamorelin-5mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 7500, inStock: false, imageUrl: `${IMAGES}1787870750569-hcatps.png`, coaUrl: COA_PAGE, productUrl: product('ipamorelin-5mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 8900, imageUrl: `${IMAGES}1787870763448-o53lxg.png`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 4900, imageUrl: `${IMAGES}1787870786772-saplh9.png`, coaUrl: COA_PAGE, productUrl: product('mt1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4900, imageUrl: `${IMAGES}1787875276784-z5glaa.png`, coaUrl: COA_PAGE, productUrl: product('mt2') },
  { productSlug: 'nad', mg: 500, priceCents: 12900, imageUrl: `${IMAGES}1782423192652-l3lnla.png`, coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'selank', mg: 10, priceCents: 4900, imageUrl: `${IMAGES}1787870977260-vplmi2.png`, coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 15900, imageUrl: `${IMAGES}1787871006075-m9hslj.png`, coaUrl: COA_PAGE, productUrl: product('semaglutide-20mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 7500, imageUrl: `${IMAGES}1787870892989-vb1xdj.png`, coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 4900, imageUrl: `${IMAGES}1787865855873-48p1so.png`, coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 3500, imageUrl: `${IMAGES}1787871033844-ma4rio.png`, coaUrl: COA_PAGE, productUrl: product('sermorelin-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 7900, imageUrl: `${IMAGES}1787871049834-8a0xbg.png`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 8900, imageUrl: `${IMAGES}1787871072357-62tccw.png`, coaUrl: COA_PAGE, productUrl: product('tb-500-10mg') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 4900, imageUrl: `${IMAGES}1787871108210-hjc2el.png`, coaUrl: COA_PAGE, productUrl: product('tesamorelin-5mg') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 14900, imageUrl: `${IMAGES}1787871154458-qngglm.png`, coaUrl: COA_PAGE, productUrl: product('tirzepatide-10mg') },
];

runSeed({ supplierSlug: 'aminexa-2', listings });
