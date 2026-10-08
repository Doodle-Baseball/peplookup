// Adds Northline Labs's product listings, as supplied from northlinelabs.org,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general COA page. Bacteriostatic water sizes are in ml,
// stored on the same `mg` field, matching the convention used for other vendors' water.
// No stock status was supplied, so listings take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?ref=241';
const COA_PAGE = `https://northlinelabs.org/coas/${REF}`;
const VIALS = 'https://northlinelabs.org/wp-content/themes/northline-labs/assets/assets/vials/';
const vial = (file) => `${VIALS}${file}`;
const strength = (file) => `${VIALS}strengths/${file}`;
const product = (slug) => `https://northlinelabs.org/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 8799, imageUrl: vial('nl-bpc-157-premium-research-peptide.webp?v=1789225842'), coaUrl: COA_PAGE, productUrl: product('bpc-157-premium-research-peptide') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 10499, imageUrl: strength('nl-bpc-157-premium-research-peptide__20mg.webp?v=1788374814'), coaUrl: COA_PAGE, productUrl: product('bpc-157-premium-research-peptide') },

  { productSlug: 'tb-500', mg: 10, priceCents: 9999, imageUrl: vial('nl-tb-500-premium-research-peptide.webp?v=1789225844'), coaUrl: COA_PAGE, productUrl: product('tb-500-premium-research-peptide') },

  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 10999, imageUrl: vial('nl-bpc-157-tb-500-premium-research-peptide-set.webp?v=1789225841'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-premium-research-peptide-set') },

  { productSlug: 'ghk-cu', mg: 100, priceCents: 9999, imageUrl: vial('nl-ghk-cu-premium-research-peptide.webp?v=1789225845'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-premium-research-peptide') },

  { productSlug: 'retatrutide', mg: 10, priceCents: 7999, imageUrl: strength('nl-reta-glp-3__10mg.webp?v=1788374816'), coaUrl: COA_PAGE, productUrl: product('reta-glp-3') },
  { productSlug: 'retatrutide', mg: 15, priceCents: 9999, imageUrl: strength('nl-reta-glp-3__15mg.webp?v=1788374816'), coaUrl: COA_PAGE, productUrl: product('reta-glp-3') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12999, imageUrl: strength('nl-reta-glp-3__20mg.webp?v=1788374816'), coaUrl: COA_PAGE, productUrl: product('reta-glp-3') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 18999, imageUrl: strength('nl-reta-glp-3__30mg.webp?v=1788374816'), coaUrl: COA_PAGE, productUrl: product('reta-glp-3') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 29999, imageUrl: strength('nl-reta-glp-3__50mg.webp?v=1788374817'), coaUrl: COA_PAGE, productUrl: product('reta-glp-3') },
  { productSlug: 'retatrutide', mg: 100, priceCents: 42999, imageUrl: strength('nl-reta-glp-3__100mg.webp?v=1789388519'), coaUrl: COA_PAGE, productUrl: product('reta-glp-3') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 6999, imageUrl: vial('nl-tirzep-glp-2-gip-glp-1-receptor-agonist.webp?v=1789225852'), coaUrl: COA_PAGE, productUrl: product('tirzep-glp-2-gip-glp-1-receptor-agonist') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 11999, imageUrl: strength('nl-tirzep-glp-2-gip-glp-1-receptor-agonist__20mg.webp?v=1788374818'), coaUrl: COA_PAGE, productUrl: product('tirzep-glp-2-gip-glp-1-receptor-agonist') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 17499, imageUrl: strength('nl-tirzep-glp-2-gip-glp-1-receptor-agonist__30mg.webp?v=1788374818'), coaUrl: COA_PAGE, productUrl: product('tirzep-glp-2-gip-glp-1-receptor-agonist') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 29999, imageUrl: strength('nl-tirzep-glp-2-gip-glp-1-receptor-agonist__60mg.webp?v=1788374818'), coaUrl: COA_PAGE, productUrl: product('tirzep-glp-2-gip-glp-1-receptor-agonist') },
  { productSlug: 'tirzepatide', mg: 100, priceCents: 39999, imageUrl: strength('nl-tirzep-glp-2-gip-glp-1-receptor-agonist__100mg.webp?v=1788374817'), coaUrl: COA_PAGE, productUrl: product('tirzep-glp-2-gip-glp-1-receptor-agonist') },
  { productSlug: 'tirzepatide', mg: 120, priceCents: 43999, imageUrl: strength('nl-tirzep-glp-2-gip-glp-1-receptor-agonist__120mg.webp?v=1788374818'), coaUrl: COA_PAGE, productUrl: product('tirzep-glp-2-gip-glp-1-receptor-agonist') },

  { productSlug: 'semaglutide', mg: 10, priceCents: 4499, imageUrl: vial('nl-glp-1-analog-research-grade-premium-research-peptide.webp?v=1789225822'), coaUrl: COA_PAGE, productUrl: product('glp-1-analog-research-grade-premium-research-peptide') },
  { productSlug: 'semaglutide', mg: 15, priceCents: 5499, imageUrl: strength('nl-glp-1-analog-research-grade-premium-research-peptide__15mg.webp?v=1788374814'), coaUrl: COA_PAGE, productUrl: product('glp-1-analog-research-grade-premium-research-peptide') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 6499, imageUrl: strength('nl-glp-1-analog-research-grade-premium-research-peptide__20mg.webp?v=1788374815'), coaUrl: COA_PAGE, productUrl: product('glp-1-analog-research-grade-premium-research-peptide') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 8499, imageUrl: strength('nl-glp-1-analog-research-grade-premium-research-peptide__30mg.webp?v=1788374815'), coaUrl: COA_PAGE, productUrl: product('glp-1-analog-research-grade-premium-research-peptide') },
  { productSlug: 'semaglutide', mg: 50, priceCents: 11900, imageUrl: strength('nl-glp-1-analog-research-grade-premium-research-peptide__50mg.webp?v=1788374815'), coaUrl: COA_PAGE, productUrl: product('glp-1-analog-research-grade-premium-research-peptide') },

  { productSlug: 'cagrilintide', mg: 10, priceCents: 10999, imageUrl: vial('nl-cagrilintide-premium-research-peptide.webp?v=1789225799'), coaUrl: COA_PAGE, productUrl: product('cagrilintide-premium-research-peptide') },

  { productSlug: 'ipamorelin', mg: 10, priceCents: 7499, imageUrl: vial('nl-ipamorelin-premium-research-peptide.webp?v=1789225840'), coaUrl: COA_PAGE, productUrl: product('ipamorelin-premium-research-peptide') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 7999, imageUrl: vial('nl-tesa-th9507-ghrh-analog.webp?v=1789225855'), coaUrl: COA_PAGE, productUrl: product('tesa-th9507-ghrh-analog') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 12499, imageUrl: strength('nl-tesa-th9507-ghrh-analog__20mg.webp?v=1788374817'), coaUrl: COA_PAGE, productUrl: product('tesa-th9507-ghrh-analog') },

  { productSlug: 'sermorelin', mg: 10, priceCents: 9999, imageUrl: vial('nl-sermorelin.webp?v=1789225819'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },

  { productSlug: 'nad', mg: 500, priceCents: 8999, imageUrl: vial('nl-nad-premium-research-compound.webp?v=1789225836'), coaUrl: COA_PAGE, productUrl: product('nad-premium-research-compound') },
  { productSlug: 'nad', mg: 1000, priceCents: 12999, imageUrl: strength('nl-nad-premium-research-compound__1000mg.webp?v=1788374816'), coaUrl: COA_PAGE, productUrl: product('nad-premium-research-compound') },

  { productSlug: 'mots-c', mg: 10, priceCents: 8499, imageUrl: vial('nl-mots-c-premium-research-peptide.webp?v=1789225832'), coaUrl: COA_PAGE, productUrl: product('mots-c-premium-research-peptide') },
  { productSlug: 'mots-c', mg: 40, priceCents: 12999, imageUrl: strength('nl-mots-c-premium-research-peptide__40mg.webp?v=1788374816'), coaUrl: COA_PAGE, productUrl: product('mots-c-premium-research-peptide') },

  { productSlug: 'epitalon', mg: 100, priceCents: 8799, imageUrl: vial('nl-epitalon-premium-research-peptide.webp?v=1789225850'), coaUrl: COA_PAGE, productUrl: product('epitalon-premium-research-peptide') },

  { productSlug: 'semax', mg: 10, priceCents: 8999, imageUrl: vial('nl-semax-premium-research-peptide.webp?v=1789225830'), coaUrl: COA_PAGE, productUrl: product('semax-premium-research-peptide') },
  { productSlug: 'semax', mg: 30, priceCents: 11999, imageUrl: strength('nl-semax-premium-research-peptide__30mg.webp?v=1788374817'), coaUrl: COA_PAGE, productUrl: product('semax-premium-research-peptide') },

  { productSlug: 'selank', mg: 10, priceCents: 8999, imageUrl: vial('nl-selank-premium-research-peptide.webp?v=1789225831'), coaUrl: COA_PAGE, productUrl: product('selank-premium-research-peptide') },

  { productSlug: 'pt-141', mg: 10, priceCents: 8999, imageUrl: vial('nl-pt-141.webp?v=1789225815'), coaUrl: COA_PAGE, productUrl: product('pt-141') },

  { productSlug: '5-amino-1mq', mg: 10, priceCents: 8999, imageUrl: vial('nl-5-amino-1mq-premium-research-peptide.webp?v=1790708762'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-premium-research-peptide') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 19999, imageUrl: strength('nl-5-amino-1mq-premium-research-peptide__50mg.webp?v=1790982926'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-premium-research-peptide') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5999, imageUrl: vial('nl-ss-31-premium-research-peptide.webp?v=1789225806'), coaUrl: COA_PAGE, productUrl: product('ss-31-premium-research-peptide') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 15999, imageUrl: strength('nl-ss-31-premium-research-peptide__50mg.webp?v=1788374817'), coaUrl: COA_PAGE, productUrl: product('ss-31-premium-research-peptide') },

  { productSlug: 'dihexa', mg: 10, priceCents: 7999, imageUrl: vial('nl-dihexa-premium-research-peptide.webp?v=1789225805'), coaUrl: COA_PAGE, productUrl: product('dihexa-premium-research-peptide') },

  { productSlug: 'dsip', mg: 15, priceCents: 7999, imageUrl: vial('nl-dsip-premium-research-peptide.webp?v=1789225835'), coaUrl: COA_PAGE, productUrl: product('dsip-premium-research-peptide') },

  { productSlug: 'glutathione', mg: 600, priceCents: 7999, imageUrl: vial('nl-glutathione-premium-research-peptide.webp?v=1789225849'), coaUrl: COA_PAGE, productUrl: product('glutathione-premium-research-peptide') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 10999, imageUrl: strength('nl-glutathione-premium-research-peptide__1500mg.webp?v=1788374815'), coaUrl: COA_PAGE, productUrl: product('glutathione-premium-research-peptide') },

  { productSlug: 'hexarelin', mg: 10, priceCents: 8999, imageUrl: vial('nl-hexarelin-premium-research-peptide.webp?v=1789225800'), coaUrl: COA_PAGE, productUrl: product('hexarelin-premium-research-peptide') },

  { productSlug: 'ahk-cu', mg: 100, priceCents: 8999, imageUrl: vial('nl-ahk-cu-premium-research-peptide.webp?v=1789490326'), coaUrl: COA_PAGE, productUrl: product('ahk-cu-premium-research-peptide') },

  { productSlug: 'melanotan-1', mg: 10, priceCents: 6999, imageUrl: vial('nl-melanotan-1-afamelanotide-premium-research-peptide.webp?v=1789225823'), coaUrl: COA_PAGE, productUrl: product('melanotan-1-afamelanotide-premium-research-peptide') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 6999, imageUrl: vial('nl-melanotan-ii-premium-research-peptide.webp?v=1789225813'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii-premium-research-peptide') },

  { productSlug: 'glow', mg: 70, priceCents: 13499, imageUrl: vial('nl-bpc-157-tb-500-ghk-cu-blend-premium-research-peptide-set.webp?v=1789225824'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-ghk-cu-blend-premium-research-peptide-set') },

  { productSlug: 'klow', mg: 80, priceCents: 16999, imageUrl: vial('nl-bpc-157-tb-500-kpv-ghk-cu-blend-premium-research-peptide-set.webp?v=1789225847'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-kpv-ghk-cu-blend-premium-research-peptide-set') },

  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 1999, imageUrl: strength('nl-bacteriostatic-water-usp-grade__3ml.webp?v=1789408584'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-usp-grade') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 3499, imageUrl: strength('nl-bacteriostatic-water-usp-grade__10ml.webp?v=1789408585'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-usp-grade') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 6399, imageUrl: strength('nl-bacteriostatic-water-usp-grade__30ml.webp?v=1789408587'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-usp-grade') },
];

runSeed({ supplierSlug: 'northline-labs', listings });
