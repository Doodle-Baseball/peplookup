// Adds American Peptides' product listings, as supplied from
// americanpeptides.us, to the Supabase `offers` table.
// See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const media = (id) => `https://www.americanpeptides.us/media/${id}.png`;
const doc = (file) => `https://www.americanpeptides.us/docs/${file}`;
const product = (path) => `https://www.americanpeptides.us/products/${path}?ref=peplookup`;

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no certificate was
// supplied; inStock: false where the listing was supplied as out of stock.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 6000, imageUrl: media('0ab8cf5de006c980'), coaUrl: doc('COA7609.pdf'), productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 8000, imageUrl: media('0ab8cf5de006c980'), coaUrl: doc('COA7603.pdf'), productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 15, priceCents: 10000, inStock: false, imageUrl: media('0ab8cf5de006c980'), coaUrl: doc('COA7581.pdf'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 10000, imageUrl: media('4edc562f960b3e8a'), coaUrl: doc('COA7595.pdf'), productUrl: product('tb-500') },
  // The same 10 mg + 10 mg vendor listing, supplied under both the BPC-157 + TB-500 and Wolverine compounds.
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 19500, imageUrl: media('1096e1a6d52a034b'), coaUrl: doc('COA7621.pdf'), productUrl: product('bpc-157-tb-500') },
  { productSlug: 'wolverine', mg: 20, priceCents: 19500, imageUrl: media('1096e1a6d52a034b'), coaUrl: doc('COA7621.pdf'), productUrl: product('bpc-157-tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 5000, imageUrl: media('7315b2eabf39c159'), coaUrl: doc('COA7628.pdf'), productUrl: product('copper-binding-peptide-ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 7500, imageUrl: media('7315b2eabf39c159'), coaUrl: doc('COA7578.pdf'), productUrl: product('copper-binding-peptide-ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7875, imageUrl: media('3904599c472d3587'), coaUrl: doc('COA7580.pdf'), productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 15000, imageUrl: media('3904599c472d3587'), coaUrl: doc('COA7599.pdf'), productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 18000, imageUrl: media('3904599c472d3587'), coaUrl: doc('COA7619.pdf'), productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 48, priceCents: 22500, imageUrl: media('3904599c472d3587'), coaUrl: doc('COA5633.pdf?v=1783356157'), productUrl: product('retatrutide') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 30000, imageUrl: media('3904599c472d3587'), coaUrl: doc('COA7629.pdf'), productUrl: product('retatrutide') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 10000, imageUrl: media('8b774a98d8061e30'), coaUrl: doc('COA7606.pdf'), productUrl: product('tirzepatide') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 17000, imageUrl: media('8b774a98d8061e30'), coaUrl: doc('COA7623.pdf'), productUrl: product('tirzepatide') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 24000, imageUrl: media('8b774a98d8061e30'), coaUrl: doc('COA7617.pdf'), productUrl: product('tirzepatide') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 39000, imageUrl: media('8b774a98d8061e30'), coaUrl: doc('COA7613.pdf'), productUrl: product('tirzepatide') },
  { productSlug: 'tirzepatide', mg: 100, priceCents: 42800, imageUrl: media('8b774a98d8061e30'), coaUrl: doc('COA7593.pdf'), productUrl: product('tirzepatide') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 6000, imageUrl: media('70a894dab1455d25'), coaUrl: doc('COA7591.pdf'), productUrl: product('semaglutide') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 9000, inStock: false, imageUrl: media('70a894dab1455d25'), coaUrl: doc('COA5632.pdf?v=1783356154'), productUrl: product('semaglutide') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 16000, imageUrl: media('70a894dab1455d25'), coaUrl: doc('COA4845_f5bc67a9-b26b-443c-b2ee-eab7ed8ef6a0.pdf?v=1780951580'), productUrl: product('semaglutide') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 21000, inStock: false, imageUrl: media('70a894dab1455d25'), coaUrl: doc('COA7612.pdf'), productUrl: product('semaglutide') },
  { productSlug: 'semaglutide', mg: 50, priceCents: 30000, imageUrl: media('70a894dab1455d25'), coaUrl: null, productUrl: product('semaglutide') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 17000, imageUrl: media('a533cceecd5914c3'), coaUrl: null, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 4000, imageUrl: media('178ae3722db04f4a'), coaUrl: doc('COA7600.pdf'), productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6000, imageUrl: media('178ae3722db04f4a'), coaUrl: doc('COA7624.pdf'), productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 12000, imageUrl: media('1564f3454f56e9dc'), coaUrl: doc('COA7630.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 19000, imageUrl: media('1564f3454f56e9dc'), coaUrl: doc('COA7605.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 6000, imageUrl: media('3ad2c9227b599638'), coaUrl: doc('COA3372.pdf?v=2745209496895048776'), productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 10000, imageUrl: media('09af79a89ab21a78'), coaUrl: doc('COA7592.pdf'), productUrl: product('nad') },
  { productSlug: 'nad', mg: 1000, priceCents: 21000, imageUrl: media('09af79a89ab21a78'), coaUrl: doc('COA7611.pdf'), productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 10000, imageUrl: media('4669f70b202e89d5'), coaUrl: doc('COA7589.pdf'), productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 16000, imageUrl: media('4669f70b202e89d5'), coaUrl: doc('COA7618.pdf'), productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 6000, imageUrl: media('aae6adc5b9c407e9'), coaUrl: doc('COA7622.pdf'), productUrl: product('epi') },
  { productSlug: 'semax', mg: 10, priceCents: 6500, imageUrl: media('46c9fd6cd9c4897f'), coaUrl: doc('COA7586.pdf'), productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 6500, imageUrl: media('ee424162decfac4a'), coaUrl: doc('COA7627.pdf'), productUrl: product('selank') },
  // 5 mg in 10 mL of nasal spray.
  { productSlug: 'selank', form: 'spray', mg: 5, priceCents: 9000, imageUrl: media('3ad2c9227b599638'), coaUrl: doc('COA7627.pdf'), productUrl: product('selank-nasal-spray') },
  { productSlug: 'pt-141', mg: 10, priceCents: 6000, imageUrl: media('ea5fd9ca91ac3dc6'), coaUrl: doc('COA7625.pdf'), productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 8000, imageUrl: media('32038ddbd945847f'), coaUrl: doc('COA7587.pdf'), productUrl: product('5-amino-1mq') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 5500, imageUrl: media('440e420d390a9095'), coaUrl: doc('COA3394.pdf?v=2'), productUrl: product('melanotan-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5500, imageUrl: media('0c2c9b76d6a3fad9'), coaUrl: null, productUrl: product('melanotan-2') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 11000, imageUrl: media('80e907e79507a406'), coaUrl: doc('COA7601.pdf'), productUrl: product('cjc-1295-no-dac') },
  // 5 mg + 5 mg and 10 mg + 10 mg blends.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 9000, imageUrl: media('4097ee345549359e'), coaUrl: doc('COA7607.pdf'), productUrl: product('cjc-1295-no-dac-ipamorelin') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 15000, imageUrl: media('4097ee345549359e'), coaUrl: doc('COA7631.pdf'), productUrl: product('cjc-1295-no-dac-ipamorelin') },
  // 60 capsules of 5 mg each (300 mg total), so price per mg divides across all 60.
  { productSlug: 'dihexa', form: 'capsule', mg: 5, count: 60, priceCents: 14000, imageUrl: media('80e907e79507a406'), coaUrl: null, productUrl: product('dihexa') },
  { productSlug: 'dsip', mg: 5, priceCents: 5500, imageUrl: media('fc1967d6342a7a27'), coaUrl: doc('COA7602.pdf'), productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 600, priceCents: 7500, inStock: false, imageUrl: media('227af190147256c8'), coaUrl: doc('COA4841_94653df7-283c-4032-bf2e-876da658963c.pdf?v=1780951568'), productUrl: product('l-glutathione') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 17000, imageUrl: media('227af190147256c8'), coaUrl: doc('COA7597.pdf'), productUrl: product('l-glutathione') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 7000, inStock: false, imageUrl: media('a5a6b74b51b92ec9'), coaUrl: doc('COA7584.pdf'), productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 30, priceCents: 16000, imageUrl: media('a5a6b74b51b92ec9'), coaUrl: doc('COA7579.pdf'), productUrl: product('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 21500, imageUrl: media('a5a6b74b51b92ec9'), coaUrl: doc('COA7590.pdf'), productUrl: product('ss-31') },
  // 50 mg GHK-Cu + 10 mg BPC-157 + 10 mg TB-500.
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 15000, imageUrl: media('59f5ba7a17996e18'), coaUrl: doc('COA7598.pdf'), productUrl: product('glow-mix') },
  // 50 mg GHK-Cu + 10 mg BPC-157 + 10 mg TB-500 + 10 mg KPV.
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 20000, imageUrl: media('65a2407bbb5d2e56'), coaUrl: doc('COA7577.pdf'), productUrl: product('klow-blend') },
];

runSeed({ supplierSlug: 'american-peptides-2', listings });
