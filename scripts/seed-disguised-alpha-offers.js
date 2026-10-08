// Adds Disguised Alpha's product listings, as supplied from disguisedalpha.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general COA page. Bacteriostatic water sizes are in ml,
// stored on the same `mg` field, matching the convention used for other vendors' water.
// Capsules store mg per capsule with `count` capsules per bottle, so a 10-bottle pack of
// 60-capsule bottles is `count: 600`; 10-vial kits and 10-bottle spray packs are `count: 10`.
// No stock status was supplied, so listings take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?coupon=peplookup';
const COA_PAGE = `https://disguisedalpha.com/coa/${REF}`;
const upload = (file) => `https://disguisedalpha.com/wp-content/uploads/${file}`;
const product = (slug) => `https://disguisedalpha.com/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 3499, imageUrl: upload('2026/09/bpc-157-5mg-hires-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157-2') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 5499, imageUrl: upload('2026/07/BPC-157-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('bpc-157-2') },

  { productSlug: 'tb-500', mg: 10, priceCents: 6499, imageUrl: upload('2026/08/tb-4-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('tb-4') },
  { productSlug: 'tb-500', mg: 10, count: 10, priceCents: 55240, imageUrl: upload('2026/08/tb-4-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('tb-4') },

  { productSlug: 'ghk-cu', mg: 100, priceCents: 4499, imageUrl: upload('2026/07/GHK-CU-100MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', form: 'capsule', mg: 2, count: 60, priceCents: 7999, imageUrl: upload('2026/07/Capsulated-GHK-Cu-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ghkcucapsulated') },
  { productSlug: 'ghk-cu', form: 'capsule', mg: 2, count: 600, priceCents: 67990, imageUrl: upload('2026/07/Capsulated-GHK-Cu-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ghkcucapsulated') },

  { productSlug: 'retatrutide', mg: 5, priceCents: 4999, imageUrl: upload('2026/09/glp-3-5mg-lyophilized-powder-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 5, count: 10, priceCents: 44990, imageUrl: upload('2026/09/glp-3-5mg-lyophilized-powder-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7499, imageUrl: upload('2026/09/glp-3-10mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 10, count: 10, priceCents: 67490, imageUrl: upload('2026/09/glp-3-10mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 11499, imageUrl: upload('2026/09/glp-3-20mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, count: 10, priceCents: 103490, imageUrl: upload('2026/09/glp-3-20mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 13999, imageUrl: upload('2026/09/glp-3-30mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 30, count: 10, priceCents: 125990, imageUrl: upload('2026/09/glp-3-30mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 24999, imageUrl: upload('2026/09/glp-3-60mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 60, count: 10, priceCents: 224990, imageUrl: upload('2026/09/glp-3-60mg-lyophilized-powder.webp'), coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 6999, imageUrl: upload('2026/09/glp-2-10mg-lyophilized-powder-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 10, count: 10, priceCents: 59490, imageUrl: upload('2026/09/glp-2-10mg-lyophilized-powder-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 11999, imageUrl: upload('2026/09/glp-2-30mg-lyophilized-powder-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 30, count: 10, priceCents: 101990, imageUrl: upload('2026/09/glp-2-30mg-lyophilized-powder-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 18999, imageUrl: upload('2026/09/glp-2-60mg-lyophilized-powder-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'tirzepatide', mg: 60, count: 10, priceCents: 161490, imageUrl: upload('2026/09/glp-2-60mg-lyophilized-powder-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },

  { productSlug: 'semaglutide', mg: 10, priceCents: 5999, imageUrl: upload('2026/09/glp-1-10mg-lyophilized-powder-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semaglutide') },
  { productSlug: 'semaglutide', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2026/09/glp-1-10mg-lyophilized-powder-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semaglutide') },

  { productSlug: 'cagrilintide', mg: 5, priceCents: 5499, imageUrl: upload('2026/08/cagrilintide-opt.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 5, count: 10, priceCents: 46740, imageUrl: upload('2026/08/cagrilintide-opt.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 8999, imageUrl: upload('2026/07/Cagrilintide-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'cagrilintide', mg: 10, count: 10, priceCents: 76490, imageUrl: upload('2026/07/Cagrilintide-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },

  { productSlug: 'ipamorelin', mg: 10, priceCents: 5999, imageUrl: upload('2026/08/ipamorelin-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2026/08/ipamorelin-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 7999, imageUrl: upload('2026/06/Tesamorelin-10MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 10, count: 10, priceCents: 67990, imageUrl: upload('2026/06/Tesamorelin-10MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('tesamorelin') },

  { productSlug: 'sermorelin', mg: 5, priceCents: 4999, imageUrl: upload('2026/08/sermorelin-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'sermorelin', mg: 5, count: 10, priceCents: 42490, imageUrl: upload('2026/08/sermorelin-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },

  { productSlug: 'nad', mg: 500, priceCents: 3999, imageUrl: upload('2025/09/03a_NAD_50d-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 500, count: 10, priceCents: 33990, imageUrl: upload('2025/09/03a_NAD_50d-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 6999, imageUrl: upload('2025/09/03b_NAD_100d-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, count: 10, priceCents: 59490, imageUrl: upload('2025/09/03b_NAD_100d-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'nad', form: 'spray', mg: 10, priceCents: 8999, imageUrl: upload('2026/08/NAD-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('nad-aerosol-spray') },
  { productSlug: 'nad', form: 'spray', mg: 10, count: 10, priceCents: 76490, imageUrl: upload('2026/08/NAD-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('nad-aerosol-spray') },

  { productSlug: 'mots-c', mg: 10, priceCents: 4499, imageUrl: upload('2025/08/MOTS-C-10MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 10, count: 10, priceCents: 38240, imageUrl: upload('2025/08/MOTS-C-10MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 12499, imageUrl: upload('2026/07/MOTS-C-40MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, count: 10, priceCents: 106240, imageUrl: upload('2026/07/MOTS-C-40MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mots-c') },

  { productSlug: 'epitalon', mg: 10, priceCents: 3999, imageUrl: upload('2026/07/Epitalon-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'epitalon', mg: 10, count: 10, priceCents: 33990, imageUrl: upload('2026/07/Epitalon-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 8999, imageUrl: upload('2026/03/1-19-scaled-1-1536x1536.png'), coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'epitalon', mg: 50, count: 10, priceCents: 76490, imageUrl: upload('2026/03/1-19-scaled-1-1536x1536.png'), coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'epitalon', form: 'capsule', mg: 3, count: 60, priceCents: 7999, imageUrl: upload('2026/07/Epitalon-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('epitaloncaps') },
  { productSlug: 'epitalon', form: 'capsule', mg: 3, count: 600, priceCents: 67990, imageUrl: upload('2026/07/Epitalon-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('epitaloncaps') },

  { productSlug: 'semax', mg: 10, priceCents: 4499, imageUrl: upload('2026/08/semax-10mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'semax', mg: 10, count: 10, priceCents: 38240, imageUrl: upload('2026/08/semax-10mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'semax', form: 'spray', mg: 10, priceCents: 5999, imageUrl: upload('2025/11/Semax-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semax-aerosol-kit') },
  { productSlug: 'semax', form: 'spray', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2025/11/Semax-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('semax-aerosol-kit') },

  { productSlug: 'selank', mg: 10, priceCents: 4499, imageUrl: upload('2026/08/selank-10mg-corrected-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  { productSlug: 'selank', mg: 10, count: 10, priceCents: 38240, imageUrl: upload('2026/08/selank-10mg-corrected-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 5999, imageUrl: upload('2026/07/Selank-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('selank-aerosol-kit') },
  { productSlug: 'selank', form: 'spray', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2026/07/Selank-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('selank-aerosol-kit') },

  { productSlug: 'pt-141', mg: 10, priceCents: 4999, imageUrl: upload('2026/08/pt-141-10mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: 'pt-141', mg: 10, count: 10, priceCents: 42490, imageUrl: upload('2026/08/pt-141-10mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: 'pt-141', form: 'spray', mg: 10, priceCents: 5999, imageUrl: upload('2026/04/PT-141-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-aerosol-kit') },
  { productSlug: 'pt-141', form: 'spray', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2026/04/PT-141-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('pt-141-aerosol-kit') },

  { productSlug: '5-amino-1mq', mg: 10, priceCents: 3999, imageUrl: upload('2025/09/5-Amino-1MQrgghg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('5amino1mq') },
  { productSlug: '5-amino-1mq', mg: 10, count: 10, priceCents: 33990, imageUrl: upload('2025/09/5-Amino-1MQrgghg-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('5amino1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 6999, imageUrl: upload('2026/05/Untitled-8-1536x1536.png'), coaUrl: COA_PAGE, productUrl: product('5amino1mq') },
  { productSlug: '5-amino-1mq', mg: 50, count: 10, priceCents: 59490, imageUrl: upload('2026/05/Untitled-8-1536x1536.png'), coaUrl: COA_PAGE, productUrl: product('5amino1mq') },
  { productSlug: '5-amino-1mq', form: 'capsule', mg: 50, count: 60, priceCents: 9999, imageUrl: upload('2026/07/5-Amino-1MQ-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mqcaps') },
  { productSlug: '5-amino-1mq', form: 'capsule', mg: 50, count: 600, priceCents: 84990, imageUrl: upload('2026/07/5-Amino-1MQ-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mqcaps') },

  { productSlug: 'mazdutide', mg: 5, priceCents: 7999, imageUrl: upload('2026/08/Untitled-August-08-2026-at-22.02.21-3-1024x1024.png'), coaUrl: COA_PAGE, productUrl: product('mazdutide') },
  { productSlug: 'mazdutide', mg: 5, count: 10, priceCents: 67990, imageUrl: upload('2026/08/Untitled-August-08-2026-at-22.02.21-3-1024x1024.png'), coaUrl: COA_PAGE, productUrl: product('mazdutide') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6999, imageUrl: upload('2025/08/SS-31-10MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 10, count: 10, priceCents: 59490, imageUrl: upload('2025/08/SS-31-10MG-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 17499, imageUrl: upload('2025/08/SS-31-50MG-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, count: 10, priceCents: 148740, imageUrl: upload('2025/08/SS-31-50MG-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', form: 'spray', mg: 0.5, priceCents: 8999, imageUrl: upload('2026/07/SS-31-2-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31-aerosol-spray') },
  { productSlug: 'ss-31-elamipretide', form: 'spray', mg: 0.5, count: 10, priceCents: 76490, imageUrl: upload('2026/07/SS-31-2-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ss-31-aerosol-spray') },

  { productSlug: 'dihexa', form: 'capsule', mg: 5, count: 60, priceCents: 9999, imageUrl: upload('2026/07/Dihexa-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dihexa') },
  { productSlug: 'dihexa', form: 'capsule', mg: 5, count: 600, priceCents: 84990, imageUrl: upload('2026/07/Dihexa-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dihexa') },
  { productSlug: 'dihexa', form: 'spray', mg: 10, priceCents: 7999, imageUrl: upload('2026/07/Dihexa-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dihexaaerosol') },
  { productSlug: 'dihexa', form: 'spray', mg: 10, count: 10, priceCents: 67990, imageUrl: upload('2026/07/Dihexa-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dihexaaerosol') },

  { productSlug: 'dsip', mg: 10, priceCents: 4999, imageUrl: upload('2026/08/dsip-10mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'dsip', mg: 10, count: 10, priceCents: 42490, imageUrl: upload('2026/08/dsip-10mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dsip-10mg') },
  { productSlug: 'dsip', form: 'spray', mg: 10, priceCents: 5999, imageUrl: upload('2025/12/DSIP-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dsip-aerosol-kit') },
  { productSlug: 'dsip', form: 'spray', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2025/12/DSIP-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('dsip-aerosol-kit') },

  { productSlug: 'glutathione', mg: 1500, priceCents: 4999, imageUrl: upload('2025/10/Reduced-L-Glutathione5185415-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'glutathione', mg: 1500, count: 10, priceCents: 42490, imageUrl: upload('2025/10/Reduced-L-Glutathione5185415-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glutathione') },

  { productSlug: 'ahk-cu', mg: 100, priceCents: 4499, imageUrl: upload('2026/08/ahk-cu-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  { productSlug: 'ahk-cu', mg: 100, count: 10, priceCents: 38240, imageUrl: upload('2026/08/ahk-cu-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('ahk-cu') },

  { productSlug: 'melanotan-1', mg: 10, priceCents: 3999, imageUrl: upload('2026/08/melanotan-1-corrected-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-1', mg: 10, count: 10, priceCents: 33990, imageUrl: upload('2026/08/melanotan-1-corrected-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-1', form: 'spray', mg: 10, priceCents: 5499, imageUrl: upload('2026/09/mt-1-aerosol-kit-hires-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mt-1-aerosol-kit') },
  { productSlug: 'melanotan-1', form: 'spray', mg: 10, count: 10, priceCents: 46740, imageUrl: upload('2026/09/mt-1-aerosol-kit-hires-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mt-1-aerosol-kit') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 3999, imageUrl: upload('2026/08/melanotan-2-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-2') },
  { productSlug: 'melanotan-2', mg: 10, count: 10, priceCents: 33990, imageUrl: upload('2026/08/melanotan-2-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('melanotan-2') },
  { productSlug: 'melanotan-2', form: 'spray', mg: 10, priceCents: 5499, imageUrl: upload('2025/11/MT-2-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mt-2-aerosol-kit') },
  { productSlug: 'melanotan-2', form: 'spray', mg: 10, count: 10, priceCents: 46740, imageUrl: upload('2025/11/MT-2-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('mt-2-aerosol-kit') },

  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 7999, imageUrl: upload('2026/08/cjc-1295-no-dac-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, count: 10, priceCents: 67990, imageUrl: upload('2026/08/cjc-1295-no-dac-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },

  { productSlug: 'glow', mg: 70, priceCents: 9999, imageUrl: upload('2026/08/glow-blend-corrected-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glow-blend') },
  { productSlug: 'glow', mg: 70, count: 10, priceCents: 84990, imageUrl: upload('2026/08/glow-blend-corrected-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('glow-blend') },

  { productSlug: 'klow', mg: 80, priceCents: 12999, imageUrl: upload('2026/08/klow-blend-80mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('klow-blend-80mg') },
  { productSlug: 'klow', mg: 80, count: 10, priceCents: 110490, imageUrl: upload('2026/08/klow-blend-80mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('klow-blend-80mg') },
  { productSlug: 'klow', form: 'capsule', mg: 3.5, count: 60, priceCents: 14999, imageUrl: upload('2026/07/Capsulated-KLOW-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('klowcaps') },
  { productSlug: 'klow', form: 'capsule', mg: 3.5, count: 600, priceCents: 127490, imageUrl: upload('2026/07/Capsulated-KLOW-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('klowcaps') },

  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 899, imageUrl: upload('2025/08/02a_BacWater_3mld-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('bacwater') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1299, imageUrl: upload('2025/08/02b_BacWater_10mld-1536x1536.webp'), coaUrl: COA_PAGE, productUrl: product('bacwater') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 3499, imageUrl: upload('2026/09/hp-bacteriostatic-water-hires-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('hp-bacteriostatic-water') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5999, imageUrl: upload('2026/08/cjc-1295-ipamorelin-5-5mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-ipamorelin-5-5mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, count: 10, priceCents: 50990, imageUrl: upload('2026/08/cjc-1295-ipamorelin-5-5mg-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-ipamorelin-5-5mg') },

  { productSlug: 'wolverine', mg: 20, priceCents: 7999, imageUrl: upload('2026/08/bpctbblend-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('bpctbblend') },
  { productSlug: 'wolverine', mg: 20, count: 10, priceCents: 67990, imageUrl: upload('2026/08/bpctbblend-fixed-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('bpctbblend') },
  { productSlug: 'wolverine', form: 'capsule', mg: 1, count: 60, priceCents: 12499, imageUrl: upload('2026/03/WOLVERINE-TB-500BPC-157-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('capsulated-tb-500-bpc-157') },
  { productSlug: 'wolverine', form: 'capsule', mg: 1, count: 600, priceCents: 106240, imageUrl: upload('2026/03/WOLVERINE-TB-500BPC-157-1-1024x1024.webp'), coaUrl: COA_PAGE, productUrl: product('capsulated-tb-500-bpc-157') },
];

runSeed({ supplierSlug: 'disguised-alpha', listings });
