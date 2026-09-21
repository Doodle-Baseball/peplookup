// Adds Cielo Crew's product listings, as supplied from cielocrew.com, to the Supabase `offers`
// table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://cielocrew.com/wp-content/uploads/${path}`;
const product = (path) => `https://cielocrew.com/product/${path}/?utm_source=affiliate_marketing&code=PEPTOOKUP`;

// Prices in integer cents, sizes in mg (a blend's total). Every listing was supplied as in stock.
// coaUrl is null where no certificate was supplied (this vendor has no general COA page to fall
// back to).
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4000, imageUrl: upload('2026/04/2._Cielo-Vial-Labels_BPC-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-005-1.jpg'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 5000, imageUrl: upload('2026/04/17._Cielo-Vial-Labels_TB500-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-006.jpg'), productUrl: product('tb-500') },
  // 5 mg + 5 mg, supplied under both the BPC-157 + TB-500 and Wolverine compounds.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 6500, imageUrl: upload('2026/04/3._Cielo-Vial-Labels_BPC_TB-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-003-1.jpg'), productUrl: product('bpc-157-5mg-tb-500-5mg') },
  { productSlug: 'wolverine', mg: 10, priceCents: 6500, imageUrl: upload('2026/04/3._Cielo-Vial-Labels_BPC_TB-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-003-1.jpg'), productUrl: product('bpc-157-5mg-tb-500-5mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4500, imageUrl: upload('2026/04/5_Cielo-Vial-Labels_GHK-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-020-1.jpg'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 5500, imageUrl: upload('2026/04/13._Cielo-Vial-Labels_GLP-3RT_30MG-1024x1024.jpg'), coaUrl: null, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 14500, imageUrl: upload('2026/04/13._Cielo-Vial-Labels_GLP-3RT_30MG-1024x1024.jpg'), coaUrl: null, productUrl: product('glp-3-rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 6000, imageUrl: upload('2026/04/19._Cielo-Vial-Labels_Tirzepatide-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-008-1.jpg'), productUrl: product('glp-2-tz') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 6000, imageUrl: upload('2026/04/14._Cielo-Vial-Labels_GLP-1SG-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-013-1.jpg'), productUrl: product('glp-1-sm') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 4000, imageUrl: upload('2026/04/8._Cielo-Vial-Labels_IPA-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-010-1.jpg'), productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 5500, imageUrl: upload('2026/04/18._Cielo-Vial-Labels_Tesamorelin_.002-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-014-1.jpg'), productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 4000, imageUrl: upload('2026/04/16._Cielo-Vial-Labels_Semorelin-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-007.jpg'), productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 6000, imageUrl: upload('2026/04/Big-NAD-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-001-1.jpg'), productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3000, imageUrl: upload('2026/04/10._Cielo-Vial-Labels_MOTS-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-012-1.jpg'), productUrl: product('mots-c') },
  { productSlug: 'semax', mg: 10, priceCents: 3000, imageUrl: upload('2026/04/15._Cielo-Vial-Labels_Semax-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-016.jpg'), productUrl: product('semax') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 5000, imageUrl: upload('2026/04/7._Cielo-Vial-Labels_Glutathione-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-002-1.jpg'), productUrl: product('glutathione') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2500, imageUrl: upload('2026/04/11._Cielo-Vial-Labels_MT2-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-018-1.jpg'), productUrl: product('mt-2') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 10500, imageUrl: upload('2026/04/6._Cielo-Vial-Labels_Glow-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-009-1.jpg'), productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 11000, imageUrl: upload('2026/04/9._Cielo-Vial-Labels_KLOW-1024x1024.jpg'), coaUrl: null, productUrl: product('klow') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, size in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1000, imageUrl: upload('2026/04/Big-BAC-WATER-1024x1024.jpg'), coaUrl: null, productUrl: product('bac-water-10ml') },
  // 5 mg CJC-1295 (No DAC) + 5 mg Ipamorelin.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6000, imageUrl: upload('2026/04/4._Cielo-Vial-Labels_CJC-1024x1024.jpg'), coaUrl: upload('2026/04/V260318-4-Wholesale-Peptide-Supply-Report-017.jpg'), productUrl: product('cjc-1295-no-dac-5mg-ipa-5mg') },
];

runSeed({ supplierSlug: 'cielo-crew-2', listings });
