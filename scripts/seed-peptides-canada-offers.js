// Adds Peptides Canada's product listings, as supplied from peptidescanada.store,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// "10-vial(s) kit" packs are stored as `count: 10` at the same per-vial `mg`, matching the
// convention used for other vendors' multi-vial packs (e.g. seed-royal-peptides-offers.js).
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://www.peptidescanada.store/coa?ref=PEPLOOKUP';
const ASSETS = 'https://www.peptidescanada.store/assets/products/standardized/web/';
const REF = '?ref=PEPLOOKUP';
const product = (slug) => `https://www.peptidescanada.store/products/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 3999, imageUrl: `${ASSETS}bpc-10mg--5-mg.webp?v=049d8504`, coaUrl: COA_PAGE, productUrl: product('bpc-10mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}bpc-10mg--10-mg.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-10mg') },
  { productSlug: 'bpc-157', mg: 5, count: 10, priceCents: 27999, imageUrl: `${ASSETS}bpc-10mg--5-mg.webp?v=049d8504`, coaUrl: COA_PAGE, productUrl: product('bpc-10mg') },
  { productSlug: 'bpc-157', mg: 10, count: 10, priceCents: 34999, imageUrl: `${ASSETS}bpc-10mg--10-mg.webp`, coaUrl: COA_PAGE, productUrl: product('bpc-10mg') },

  { productSlug: 'tb-500', mg: 5, priceCents: 3999, imageUrl: `${ASSETS}tb5-10mg--5-mg.webp?v=bfc2eb07`, coaUrl: COA_PAGE, productUrl: product('tb5-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 6499, imageUrl: `${ASSETS}tb5-10mg--10-mg.webp?v=dfe43ec2`, coaUrl: COA_PAGE, productUrl: product('tb5-10mg') },
  { productSlug: 'tb-500', mg: 5, count: 10, priceCents: 27999, imageUrl: `${ASSETS}tb5-10mg--5-mg.webp?v=bfc2eb07`, coaUrl: COA_PAGE, productUrl: product('tb5-10mg') },
  { productSlug: 'tb-500', mg: 10, count: 10, priceCents: 45499, imageUrl: `${ASSETS}tb5-10mg--10-mg.webp?v=dfe43ec2`, coaUrl: COA_PAGE, productUrl: product('tb5-10mg') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 4499, imageUrl: `${ASSETS}ghk-cu-50mg--50-mg.webp?v=b8118f80`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 6499, imageUrl: `${ASSETS}ghk-cu-50mg--100-mg.webp?v=b92a42ee`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 50, count: 10, priceCents: 31499, imageUrl: `${ASSETS}ghk-cu-50mg--50-mg.webp?v=b8118f80`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, count: 10, priceCents: 45499, imageUrl: `${ASSETS}ghk-cu-50mg--100-mg.webp?v=b92a42ee`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },

  { productSlug: 'retatrutide', mg: 5, priceCents: 4999, imageUrl: `${ASSETS}rta-glp3-10mg--5-mg.webp?v=5e99213f`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7999, imageUrl: `${ASSETS}rta-glp3-10mg--10-mg.webp?v=c01c596f`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 11999, imageUrl: `${ASSETS}rta-glp3-10mg--20-mg.webp?v=feb6ea9b`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 15999, imageUrl: `${ASSETS}rta-glp3-10mg--30-mg.webp?v=8e882374`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 19999, imageUrl: `${ASSETS}rta-glp3-10mg--40-mg.webp?v=b544263f`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 5, count: 10, priceCents: 34999, imageUrl: `${ASSETS}rta-glp3-10mg--5-mg.webp?v=5e99213f`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 10, count: 10, priceCents: 55999, imageUrl: `${ASSETS}rta-glp3-10mg--10-mg.webp?v=c01c596f`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 20, count: 10, priceCents: 83999, imageUrl: `${ASSETS}rta-glp3-10mg--20-mg.webp?v=feb6ea9b`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 30, count: 10, priceCents: 111999, imageUrl: `${ASSETS}rta-glp3-10mg--30-mg.webp?v=8e882374`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },
  { productSlug: 'retatrutide', mg: 40, count: 10, priceCents: 139999, imageUrl: `${ASSETS}rta-glp3-10mg--40-mg.webp?v=b544263f`, coaUrl: COA_PAGE, productUrl: product('rta-glp3-10mg') },

  { productSlug: 'tirzepatide', mg: 5, priceCents: 4499, imageUrl: `${ASSETS}trz-10mg--5-mg.webp?v=81faa963`, coaUrl: COA_PAGE, productUrl: product('trz-10mg') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 5999, imageUrl: `${ASSETS}trz-10mg--10-mg.webp?v=f8f4ba81`, coaUrl: COA_PAGE, productUrl: product('trz-10mg') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 12999, imageUrl: `${ASSETS}trz-10mg--30-mg.webp?v=da75a4f6`, coaUrl: COA_PAGE, productUrl: product('trz-10mg') },
  { productSlug: 'tirzepatide', mg: 5, count: 10, priceCents: 31499, imageUrl: `${ASSETS}trz-10mg--5-mg.webp?v=81faa963`, coaUrl: COA_PAGE, productUrl: product('trz-10mg') },
  { productSlug: 'tirzepatide', mg: 10, count: 10, priceCents: 41999, imageUrl: `${ASSETS}trz-10mg--10-mg.webp?v=f8f4ba81`, coaUrl: COA_PAGE, productUrl: product('trz-10mg') },
  { productSlug: 'tirzepatide', mg: 30, count: 10, priceCents: 90999, imageUrl: `${ASSETS}trz-10mg--30-mg.webp?v=da75a4f6`, coaUrl: COA_PAGE, productUrl: product('trz-10mg') },

  { productSlug: 'semaglutide', mg: 5, priceCents: 6999, imageUrl: `${ASSETS}semaglutide-5mg--5-mg.webp?v=b6843808`, coaUrl: COA_PAGE, productUrl: product('semaglutide-5mg') },
  { productSlug: 'semaglutide', mg: 5, count: 10, priceCents: 48999, imageUrl: `${ASSETS}semaglutide-5mg--5-mg.webp?v=b6843808`, coaUrl: COA_PAGE, productUrl: product('semaglutide-5mg') },

  { productSlug: 'ipamorelin', mg: 5, priceCents: 4999, imageUrl: `${ASSETS}ipm-10mg--5-mg.webp?v=92d4740c`, coaUrl: COA_PAGE, productUrl: product('ipm-10mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6999, imageUrl: `${ASSETS}ipm-10mg--10-mg.webp?v=2939c859`, coaUrl: COA_PAGE, productUrl: product('ipm-10mg') },
  { productSlug: 'ipamorelin', mg: 5, count: 10, priceCents: 34999, imageUrl: `${ASSETS}ipm-10mg--5-mg.webp?v=92d4740c`, coaUrl: COA_PAGE, productUrl: product('ipm-10mg') },
  { productSlug: 'ipamorelin', mg: 10, count: 10, priceCents: 48999, imageUrl: `${ASSETS}ipm-10mg--10-mg.webp?v=2939c859`, coaUrl: COA_PAGE, productUrl: product('ipm-10mg') },

  { productSlug: 'tesamorelin', mg: 5, priceCents: 5999, imageUrl: `${ASSETS}tsm-10mg--5-mg.webp?v=d5ec1a12`, coaUrl: COA_PAGE, productUrl: product('tsm-10mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 8499, imageUrl: `${ASSETS}tsm-10mg--10-mg.webp?v=6d3c14b7`, coaUrl: COA_PAGE, productUrl: product('tsm-10mg') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 13999, imageUrl: `${ASSETS}tsm-10mg--20-mg.webp?v=bbcf0497`, coaUrl: COA_PAGE, productUrl: product('tsm-10mg') },
  { productSlug: 'tesamorelin', mg: 5, count: 10, priceCents: 41999, imageUrl: `${ASSETS}tsm-10mg--5-mg.webp?v=d5ec1a12`, coaUrl: COA_PAGE, productUrl: product('tsm-10mg') },
  { productSlug: 'tesamorelin', mg: 10, count: 10, priceCents: 59499, imageUrl: `${ASSETS}tsm-10mg--10-mg.webp?v=6d3c14b7`, coaUrl: COA_PAGE, productUrl: product('tsm-10mg') },
  { productSlug: 'tesamorelin', mg: 20, count: 10, priceCents: 97999, imageUrl: `${ASSETS}tsm-10mg--20-mg.webp?v=bbcf0497`, coaUrl: COA_PAGE, productUrl: product('tsm-10mg') },

  { productSlug: 'sermorelin', mg: 10, priceCents: 6999, imageUrl: `${ASSETS}srm-10mg--10-mg.webp?v=12f7e816`, coaUrl: COA_PAGE, productUrl: product('srm-10mg') },
  { productSlug: 'sermorelin', mg: 10, count: 10, priceCents: 48999, imageUrl: `${ASSETS}srm-10mg--10-mg.webp?v=12f7e816`, coaUrl: COA_PAGE, productUrl: product('srm-10mg') },

  { productSlug: 'nad', mg: 500, priceCents: 5999, imageUrl: `${ASSETS}nad-plus-500mg--500-mg.webp?v=7f194f66`, coaUrl: COA_PAGE, productUrl: product('nad-plus-500mg') },
  { productSlug: 'nad', mg: 500, count: 10, priceCents: 41999, imageUrl: `${ASSETS}nad-plus-500mg--500-mg.webp?v=7f194f66`, coaUrl: COA_PAGE, productUrl: product('nad-plus-500mg') },

  { productSlug: 'mots-c', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}mtc-10mg--10-mg.webp?v=9403c752`, coaUrl: COA_PAGE, productUrl: product('mtc-10mg') },
  { productSlug: 'mots-c', mg: 20, priceCents: 6999, imageUrl: `${ASSETS}mtc-10mg--20-mg.webp?v=e91a6b4f`, coaUrl: COA_PAGE, productUrl: product('mtc-10mg') },
  { productSlug: 'mots-c', mg: 40, priceCents: 9999, imageUrl: `${ASSETS}mtc-10mg--40-mg.webp?v=a28793b2`, coaUrl: COA_PAGE, productUrl: product('mtc-10mg') },
  { productSlug: 'mots-c', mg: 10, count: 10, priceCents: 34999, imageUrl: `${ASSETS}mtc-10mg--10-mg.webp?v=9403c752`, coaUrl: COA_PAGE, productUrl: product('mtc-10mg') },
  { productSlug: 'mots-c', mg: 20, count: 10, priceCents: 48999, imageUrl: `${ASSETS}mtc-10mg--20-mg.webp?v=e91a6b4f`, coaUrl: COA_PAGE, productUrl: product('mtc-10mg') },
  { productSlug: 'mots-c', mg: 40, count: 10, priceCents: 69999, imageUrl: `${ASSETS}mtc-10mg--40-mg.webp?v=a28793b2`, coaUrl: COA_PAGE, productUrl: product('mtc-10mg') },

  { productSlug: 'epitalon', mg: 10, priceCents: 3499, imageUrl: `${ASSETS}epithalon-10mg--10-mg.webp?v=0901f8dc`, coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },
  { productSlug: 'epitalon', mg: 10, count: 10, priceCents: 24499, imageUrl: `${ASSETS}epithalon-10mg--10-mg.webp?v=0901f8dc`, coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },

  { productSlug: 'semax', mg: 5, priceCents: 3499, imageUrl: `${ASSETS}smx-10mg--5-mg.webp?v=01f21d94`, coaUrl: COA_PAGE, productUrl: product('smx-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}smx-10mg--10-mg.webp?v=165db475`, coaUrl: COA_PAGE, productUrl: product('smx-10mg') },
  { productSlug: 'semax', mg: 5, count: 10, priceCents: 24499, imageUrl: `${ASSETS}smx-10mg--5-mg.webp?v=01f21d94`, coaUrl: COA_PAGE, productUrl: product('smx-10mg') },
  { productSlug: 'semax', mg: 10, count: 10, priceCents: 34999, imageUrl: `${ASSETS}smx-10mg--10-mg.webp?v=165db475`, coaUrl: COA_PAGE, productUrl: product('smx-10mg') },

  { productSlug: 'selank', mg: 5, priceCents: 3499, imageUrl: `${ASSETS}slk-10mg--5-mg.webp?v=30697e99`, coaUrl: COA_PAGE, productUrl: product('slk-10mg') },
  { productSlug: 'selank', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}slk-10mg--10-mg.webp?v=48a1ae0a`, coaUrl: COA_PAGE, productUrl: product('slk-10mg') },
  { productSlug: 'selank', mg: 5, count: 10, priceCents: 24499, imageUrl: `${ASSETS}slk-10mg--5-mg.webp?v=30697e99`, coaUrl: COA_PAGE, productUrl: product('slk-10mg') },
  { productSlug: 'selank', mg: 10, count: 10, priceCents: 34999, imageUrl: `${ASSETS}slk-10mg--10-mg.webp?v=48a1ae0a`, coaUrl: COA_PAGE, productUrl: product('slk-10mg') },

  { productSlug: 'pt-141', mg: 10, priceCents: 4499, imageUrl: `${ASSETS}pt-141-10mg--10-mg.webp?v=c80aec5d`, coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: 'pt-141', mg: 10, count: 10, priceCents: 31499, imageUrl: `${ASSETS}pt-141-10mg--10-mg.webp?v=c80aec5d`, coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },

  { productSlug: '5-amino-1mq', mg: 50, priceCents: 7999, imageUrl: `${ASSETS}5-amino-1mq-50mg--50-mg.webp?v=222a64ca`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50mg') },
  { productSlug: '5-amino-1mq', mg: 50, count: 10, priceCents: 55999, imageUrl: `${ASSETS}5-amino-1mq-50mg--50-mg.webp?v=222a64ca`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-50mg') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6499, imageUrl: `${ASSETS}ss-31-10mg--10-mg.webp?v=553d6397`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 30, priceCents: 10999, imageUrl: `${ASSETS}ss-31-10mg--30-mg.webp?v=088b37a2`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 60, priceCents: 17999, imageUrl: `${ASSETS}ss-31-10mg--60-mg.webp?v=61eaa939`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, count: 10, priceCents: 45499, imageUrl: `${ASSETS}ss-31-10mg--10-mg.webp?v=553d6397`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 30, count: 10, priceCents: 76999, imageUrl: `${ASSETS}ss-31-10mg--30-mg.webp?v=088b37a2`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 60, count: 10, priceCents: 125999, imageUrl: `${ASSETS}ss-31-10mg--60-mg.webp?v=61eaa939`, coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },

  { productSlug: 'dsip', mg: 5, priceCents: 2999, imageUrl: `${ASSETS}dsip-10mg--5-mg.webp?v=a98942f7`, coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 3999, imageUrl: `${ASSETS}dsip-10mg--10-mg.webp?v=8c091285`, coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'dsip', mg: 5, count: 10, priceCents: 20999, imageUrl: `${ASSETS}dsip-10mg--5-mg.webp?v=a98942f7`, coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'dsip', mg: 10, count: 10, priceCents: 27999, imageUrl: `${ASSETS}dsip-10mg--10-mg.webp?v=8c091285`, coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },

  { productSlug: 'glutathione', mg: 1500, priceCents: 7999, imageUrl: `${ASSETS}glutathione-1500mg--1500-mg.webp?v=b45d6d5b`, coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },
  { productSlug: 'glutathione', mg: 1500, count: 10, priceCents: 55999, imageUrl: `${ASSETS}glutathione-1500mg--1500-mg.webp?v=b45d6d5b`, coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },

  { productSlug: 'melanotan-i', mg: 10, priceCents: 5499, imageUrl: `${ASSETS}mt1-10mg--10-mg.webp?v=96432c05`, coaUrl: COA_PAGE, productUrl: product('mt1-10mg') },
  { productSlug: 'melanotan-i', mg: 10, count: 10, priceCents: 38499, imageUrl: `${ASSETS}mt1-10mg--10-mg.webp?v=96432c05`, coaUrl: COA_PAGE, productUrl: product('mt1-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5499, imageUrl: `${ASSETS}mt2-10mg--10-mg.webp?v=cb0f597d`, coaUrl: COA_PAGE, productUrl: product('mt2-10mg') },
  { productSlug: 'melanotan-2', mg: 10, count: 10, priceCents: 38499, imageUrl: `${ASSETS}mt2-10mg--10-mg.webp?v=cb0f597d`, coaUrl: COA_PAGE, productUrl: product('mt2-10mg') },

  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 4499, imageUrl: `${ASSETS}cjc-nd-10mg--5-mg.webp?v=a6842573`, coaUrl: COA_PAGE, productUrl: product('cjc-nd-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 6999, imageUrl: `${ASSETS}cjc-nd-10mg--10-mg.webp?v=7e5bf98e`, coaUrl: COA_PAGE, productUrl: product('cjc-nd-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, count: 10, priceCents: 31499, imageUrl: `${ASSETS}cjc-nd-10mg--5-mg.webp?v=a6842573`, coaUrl: COA_PAGE, productUrl: product('cjc-nd-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, count: 10, priceCents: 48999, imageUrl: `${ASSETS}cjc-nd-10mg--10-mg.webp?v=7e5bf98e`, coaUrl: COA_PAGE, productUrl: product('cjc-nd-10mg') },

  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 9499, imageUrl: `${ASSETS}glw-50mg--70-mg.webp?v=7740477a`, coaUrl: COA_PAGE, productUrl: product('glw-50mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, count: 10, priceCents: 66499, imageUrl: `${ASSETS}glw-50mg--70-mg.webp?v=7740477a`, coaUrl: COA_PAGE, productUrl: product('glw-50mg') },

  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 11999, imageUrl: `${ASSETS}klw-80mg--80-mg.webp?v=0f94fab3`, coaUrl: COA_PAGE, productUrl: product('klw-80mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, count: 10, priceCents: 83999, imageUrl: `${ASSETS}klw-80mg--80-mg.webp?v=0f94fab3`, coaUrl: COA_PAGE, productUrl: product('klw-80mg') },

  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 799, imageUrl: `${ASSETS}bac-10ml--3-ml.webp?v=b8df66b7`, coaUrl: COA_PAGE, productUrl: product('bac-10ml') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1499, imageUrl: `${ASSETS}bac-10ml--10-ml.webp?v=84faf731`, coaUrl: COA_PAGE, productUrl: product('bac-10ml') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6499, imageUrl: `${ASSETS}cjc-ipamorelin-10mg--10-mg-total.webp?v=450794f2`, coaUrl: COA_PAGE, productUrl: product('cjc-ipamorelin-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 9999, imageUrl: `${ASSETS}cjc-ipamorelin-10mg--20-mg-total.webp?v=593d2c35`, coaUrl: COA_PAGE, productUrl: product('cjc-ipamorelin-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, count: 10, priceCents: 45499, imageUrl: `${ASSETS}cjc-ipamorelin-10mg--10-mg-total.webp?v=450794f2`, coaUrl: COA_PAGE, productUrl: product('cjc-ipamorelin-10mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, count: 10, priceCents: 69999, imageUrl: `${ASSETS}cjc-ipamorelin-10mg--20-mg-total.webp?v=593d2c35`, coaUrl: COA_PAGE, productUrl: product('cjc-ipamorelin-10mg') },

  // Compound name is "Wolverine" (not the plain BPC-157/TB-500 blend), matching the `wolverine` product used elsewhere.
  { productSlug: 'wolverine', mg: 10, priceCents: 7999, imageUrl: `${ASSETS}wolverine-blend--10-mg-total.webp?v=84652417`, coaUrl: COA_PAGE, productUrl: product('wolverine-blend') },
  { productSlug: 'wolverine', mg: 20, priceCents: 10999, imageUrl: `${ASSETS}wolverine-blend--20-mg-total.webp?v=4c125acd`, coaUrl: COA_PAGE, productUrl: product('wolverine-blend') },
  { productSlug: 'wolverine', mg: 10, count: 10, priceCents: 55999, imageUrl: `${ASSETS}wolverine-blend--10-mg-total.webp?v=84652417`, coaUrl: COA_PAGE, productUrl: product('wolverine-blend') },
  { productSlug: 'wolverine', mg: 20, count: 10, priceCents: 76999, imageUrl: `${ASSETS}wolverine-blend--20-mg-total.webp?v=4c125acd`, coaUrl: COA_PAGE, productUrl: product('wolverine-blend') },
];

runSeed({ supplierSlug: 'peptides-canada-2', listings });
