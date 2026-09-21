// Adds Kalyx Labs' product listings, as supplied from hlxlabs.shop, to the Supabase `offers`
// table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos are served through WordPress's image CDN at the fit/width supplied.
const photo = (path, query) => `https://i0.wp.com/hlxlabs.shop/wp-content/uploads/${path}?${query}&ssl=1`;
const product = (path) => `https://hlxlabs.shop/product/${path}/?ref=peplookup`;
// The same general COA page was supplied for every listing.
const COA_PAGE = 'https://hlxlabs.shop/coas/';

/**
 * Prices in integer cents, sizes in mg (a blend's total; a spray's peptide content). `count` is
 * vials in the pack (10 for the vendor's GLP 3-RT kit, where the price covers all of them).
 * inStock: false where the listing was supplied as out of stock ("Listed" is treated as in
 * stock, like every other listing here).
 */
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 2999, imageUrl: photo('2026/03/1b2b1133-950d-41d8-aebe-7e4ede8a6bf9-1.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('bpc-157-5mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 4999, imageUrl: photo('2026/06/e7d3521e-7a7d-4089-b86e-76d8ae9754a5.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('bpc-157-5mg') },
  { productSlug: 'tb-500', mg: 5, priceCents: 2999, imageUrl: photo('2026/03/8e03c670-1b2e-4ab2-a719-aac80ed0d526-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4499, imageUrl: photo('2026/06/c64b553a-0ad6-4215-8b3f-386e3eae083c.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  // 5 mg + 5 mg and 10 mg + 10 mg, supplied under the Wolverine compound only.
  { productSlug: 'wolverine', mg: 10, priceCents: 5999, imageUrl: photo('2026/07/hlx-69-wolverine-blend-tb500-bpc-157-4.webp', 'fit=1024%2C1024'), coaUrl: COA_PAGE, productUrl: product('wolverine-blend-tb500-bpc-157') },
  { productSlug: 'wolverine', mg: 20, priceCents: 8999, imageUrl: photo('2026/07/hlx-69-wolverine-blend-tb500-bpc-157-4.webp', 'fit=1024%2C1024'), coaUrl: COA_PAGE, productUrl: product('wolverine-blend-tb500-bpc-157') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 2499, imageUrl: photo('2026/03/dd032bc6-68b2-492c-ab3d-5856ba3ffc86-4.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4499, imageUrl: photo('2026/06/22c286a8-ec3a-4d19-96d8-56487dd20062.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 3999, imageUrl: photo('2026/03/a6aa51ea-f23b-4f07-908d-28cce5dd5a5d-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('triple-agonist-peptide-research-use-only') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 7999, imageUrl: photo('2026/05/29aad6e8-b199-4208-84a6-1089e4880741.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('triple-agonist-peptide-research-use-only') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 11999, imageUrl: photo('2026/03/22e0b2f6-d975-4622-b266-84c9d7589a0d.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('triple-agonist-peptide-research-use-only') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 21999, imageUrl: photo('2026/06/fe9c7356-1df3-40c1-a5f5-c8d93df5d9a6.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('triple-agonist-peptide-research-use-only') },
  { productSlug: 'retatrutide', mg: 10, count: 10, priceCents: 19900, imageUrl: photo('2026/08/feb013a0-493c-4c43-b81b-acf7f31ca59e.png', 'fit=1086%2C1448'), coaUrl: COA_PAGE, productUrl: product('triple-agonist-peptide-research-use-only') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 3299, imageUrl: photo('2026/06/d97f3007-7e99-4072-83d2-a402e73a5325.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('tirzepatide') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 7999, imageUrl: photo('2026/04/edd5ec8f-83a9-425d-9f20-2a94e061b678.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('tirzepatide') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 3499, imageUrl: photo('2026/03/a5a5c838-210e-4d16-9ef0-406ac4a391a5-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('hlx-ipa') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4999, inStock: false, imageUrl: photo('2026/06/aad820e0-4939-4b74-b1a3-310dd9d73326.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('hlx-ipa') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 4499, imageUrl: photo('2026/03/f1a87b10-38c9-41da-a085-b0902244fd54-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('grf-analog-peptide-study-compound') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 6499, imageUrl: photo('2026/04/bcc17adc-0131-4d51-ba5e-a22ad7fe501d.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('grf-analog-peptide-study-compound') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 2999, imageUrl: photo('2026/04/da21b61a-2ef9-46f8-b606-c33c5a6bea31-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 3999, imageUrl: photo('2026/03/c18f855f-627f-4886-a941-7c5f5b88d1d1-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 5999, inStock: false, imageUrl: photo('2026/08/427fceb5-98c2-41ae-ab77-542bf9b60ccd.png', 'fit=1024%2C1536'), coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3999, imageUrl: photo('2026/03/b0ff6294-b72c-4c3c-bf05-80c1eb685e18-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('hlx-mots-c') },
  { productSlug: 'mots-c', mg: 20, priceCents: 5999, imageUrl: photo('2026/06/e74b9e51-d8a2-4bd2-94f0-ab7bb49ba656.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('hlx-mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 2999, imageUrl: photo('2026/04/28deb8dc-8f23-49ab-b88e-0e5afaa6b811-1.png', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('epitahlon-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 3499, inStock: false, imageUrl: photo('2026/03/c6f02105-b050-4796-a153-008b5bb74502-1.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'semax', form: 'spray', mg: 10, priceCents: 6499, imageUrl: photo('2026/04/image-56.jpeg', 'w=1254'), coaUrl: COA_PAGE, productUrl: product('semax-10mg-nasal-kit') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 5499, imageUrl: photo('2026/07/hlx-922-selank-10mg-nasal-kit-4.webp', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('selank-10mg-nasal-kit') },
  { productSlug: 'pt-141', mg: 10, priceCents: 3499, imageUrl: photo('2026/04/19a91903-2193-4dc6-9308-beb16cd45bc0-1.png', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 5, priceCents: 1999, inStock: false, imageUrl: photo('2026/03/e24c9b1e-36ae-413c-8ca1-e53714756c2c-1.png', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('5-amino-1-mq-5mg') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 3499, imageUrl: photo('2026/04/882fc160-944b-4750-9117-20c55349e62f.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('5-amino-1-mq-5mg') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 13499, inStock: false, imageUrl: photo('2026/04/e2523c0e-174e-4a84-b3cb-d4a227ee77ba.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('5-amino-1-mq-5mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 3999, imageUrl: photo('2026/04/4f2bd2e9-a80c-4632-9bde-ad2e426477bb.png', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', form: 'spray', mg: 10, priceCents: 4999, imageUrl: photo('2026/05/image-54.jpeg', 'w=1254'), coaUrl: COA_PAGE, productUrl: product('dsip-nasal-spray') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3999, imageUrl: photo('2026/03/18391e1b-fbb0-473f-bd5e-f4b288fa7f95-1.png', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('melanotan-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3999, imageUrl: photo('2026/03/fd080946-4ce6-4da3-886b-20deb3c06b97-1.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('hlx-cjc1295') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6499, imageUrl: photo('2026/07/hlx-1239-cjc-1295-no-dac-ipamorelin-blend-5mg-5mg-4.webp', 'w=1024'), coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac-ipamorelin-blend-5mg-5mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 8499, inStock: false, imageUrl: photo('2026/03/df5f807e-2801-43cc-bb08-148972fded97-1.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('glow-blend') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 9999, imageUrl: photo('2026/03/14b7f601-137d-4e37-8ca8-ff6ca421fdc7-1.png', 'fit=1023%2C1537'), coaUrl: COA_PAGE, productUrl: product('hlxklow-80') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, size in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1099, imageUrl: photo('2026/04/f10b70c8-d89b-4623-a9a1-1c616aee145c.png', 'fit=1024%2C1535'), coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water-research-grade-reconstitution-solution-10mg') },
];

runSeed({ supplierSlug: 'kalyx-labs-2', listings });
