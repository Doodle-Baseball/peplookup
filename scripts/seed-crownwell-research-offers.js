// Adds Crownwell Research's product listings, as supplied from crownwellresearch.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general COA page. Bacteriostatic water sizes are in ml,
// stored on the same `mg` field, matching the convention used for other vendors' water.
// A "10mg 10-vials kit" is `count: 10` at the per-vial `mg`, the convention used for other vendors' kits.
// No stock status was supplied, so listings take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?afref=ax9';
const COA_PAGE = `https://crownwellresearch.com/certificates-of-analysis/${REF}`;
const upload = (file) => `https://crownwellresearch.com/wp-content/uploads/${file}`;
const product = (slug) => `https://crownwellresearch.com/product/${slug}/${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3800, imageUrl: upload('2026/03/BPC-157.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4700, imageUrl: upload('2026/03/TB-500.png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 5800, imageUrl: upload('2026/06/BPC-TB-2-1.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-wolverine') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 2900, imageUrl: upload('2026/03/GHK-cu-50-3.png'), coaUrl: COA_PAGE, productUrl: product('ghkcu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3500, imageUrl: upload('2026/06/GHK-cu-100.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu_100') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 6500, imageUrl: upload('2026/08/Peptide-C-10-Purple-corner.png'), coaUrl: COA_PAGE, productUrl: product('glp3-reta-10mg') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 10900, imageUrl: upload('2026/08/Peptide-C-20-Purple-Corner-1.png'), coaUrl: COA_PAGE, productUrl: product('glp3-reta-3') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 12900, imageUrl: upload('2026/08/Peptide-C-30-Purple-Corner-1.png'), coaUrl: COA_PAGE, productUrl: product('glp3-reta-2') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 14900, imageUrl: upload('2026/08/Peptide-3-R-40.png'), coaUrl: COA_PAGE, productUrl: product('glp3-reta-40mg') },
  { productSlug: 'retatrutide', mg: 10, count: 10, priceCents: 39900, imageUrl: upload('2026/04/GLP3-R-10-Full-Kit.png'), coaUrl: COA_PAGE, productUrl: product('glp3-reta-10-vial-bundle') },
  { productSlug: 'retatrutide', mg: 20, count: 10, priceCents: 79500, imageUrl: upload('2026/05/GLP3-R-20mg-kit.png'), coaUrl: COA_PAGE, productUrl: product('glp3-r-20mg-full-kit') },
  { productSlug: 'retatrutide', mg: 30, count: 10, priceCents: 97500, imageUrl: upload('2026/05/GLP3-R-30-Full-Kit-1024x1024.png'), coaUrl: COA_PAGE, productUrl: product('glp3-r-30mg-kit') },
  { productSlug: 'retatrutide', mg: 20, count: 2, priceCents: 13000, imageUrl: upload('2026/05/GLP-R-20-Double.png'), coaUrl: COA_PAGE, productUrl: product('glp3-reta-40mg-2-vials') },
  { productSlug: 'retatrutide', mg: 30, count: 2, priceCents: 22900, imageUrl: upload('2026/05/GLP3-R-30-Duo-7.png'), coaUrl: COA_PAGE, productUrl: product('glp3-r-60-2-x-30mg') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 9000, imageUrl: upload('2026/03/GLP2-T-Alt.png'), coaUrl: COA_PAGE, productUrl: product('glp2-tirz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 10700, imageUrl: upload('2026/03/GLP2-T-30-2.png'), coaUrl: COA_PAGE, productUrl: product('cr2-t') },
  { productSlug: 'tirzepatide', mg: 40, priceCents: 12700, imageUrl: upload('2026/05/GLP2-T-40-Alt.png'), coaUrl: COA_PAGE, productUrl: product('glp2-t-40mg') },
  { productSlug: 'tirzepatide', mg: 10, count: 5, priceCents: 37500, imageUrl: upload('2026/06/GLP2-T-10x5-1.png'), coaUrl: COA_PAGE, productUrl: product('glp2-tirz-50mg-5-vials') },
  { productSlug: 'tirzepatide', mg: 30, count: 2, priceCents: 14000, imageUrl: upload('2026/04/GLP2-T-30-DUO-Green.png'), coaUrl: COA_PAGE, productUrl: product('glp2-t-research-peptide') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 4000, imageUrl: upload('2026/03/GLP1-S-5-Alt-1.png'), coaUrl: COA_PAGE, productUrl: product('cr1-s') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 3600, imageUrl: upload('2026/03/GLP1-S-Alt.png'), coaUrl: COA_PAGE, productUrl: product('glp1-sema') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 8000, imageUrl: upload('2026/05/Cagrilintide-10mg.png'), coaUrl: COA_PAGE, productUrl: product('cagrilinitide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6200, imageUrl: upload('2026/03/Ipamorelin-10.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 5500, imageUrl: upload('2026/05/NAD-500.png'), coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4700, imageUrl: upload('2026/03/MOTS-c-10.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, count: 10, priceCents: 42900, imageUrl: upload('2026/08/MOTS-C-full-kit.png'), coaUrl: COA_PAGE, productUrl: product('mots-c-pre-sale') },
  { productSlug: 'epitalon', mg: 50, priceCents: 8000, imageUrl: upload('2026/03/Epithalon-50.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 4800, imageUrl: upload('2026/04/Semax-10.png'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', form: 'spray', mg: 10, priceCents: 6000, imageUrl: upload('2026/07/Semax-Intranasal-Solution.png'), coaUrl: COA_PAGE, productUrl: product('intranasal-solution-semax') },
  { productSlug: 'selank', mg: 10, priceCents: 4500, imageUrl: upload('2026/04/Selank-10mg.png'), coaUrl: COA_PAGE, productUrl: product('seian-k') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 6000, imageUrl: upload('2026/04/Selank-Intranasal-Solution.png'), coaUrl: COA_PAGE, productUrl: product('intranasal-solution-selank-10mg-1mg-ml') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 4200, imageUrl: upload('2026/08/SS-31.png'), coaUrl: COA_PAGE, productUrl: product('ss') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 16900, imageUrl: upload('2026/10/SS-EL.png'), coaUrl: COA_PAGE, productUrl: product('ss-31-50mg') },
  { productSlug: 'glutathione', mg: 1200, priceCents: 5600, imageUrl: upload('2026/03/Glutathione-1200.png'), coaUrl: COA_PAGE, productUrl: product('glutathione-1200-mg') },
  { productSlug: 'klow', mg: 80, priceCents: 6999, imageUrl: upload('2026/05/KLOW-80mg.png'), coaUrl: COA_PAGE, productUrl: product('blend') },
  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 795, imageUrl: upload('2026/03/Bac-Water-3.png'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-3ml-vial') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1100, imageUrl: upload('2026/03/Bac-Water-10-1.png'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-10ml-vial') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 1800, imageUrl: upload('2026/08/Bac-Water-30-1.png'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-30ml') },
];

runSeed({ supplierSlug: 'crownwell-research', listings });
