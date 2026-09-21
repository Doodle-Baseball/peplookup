// Adds Arizen BioLabs's product listings, as supplied from arizenbiolabs.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://arizenbiolabs.com/coas?ref=PEPLOOKUP';
const IMG = (id, ext) => `https://arizenbiolabs.com/_next/image?url=https%3A%2F%2Fpub-3a0589bf061640feb8c08e362ab57a98.r2.dev%2Fproducts%2F${id}.${ext}&w=1080&q=80`;
const REF = '?ref=PEPLOOKUP';
const product = (slug) => `https://arizenbiolabs.com/product/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3499, imageUrl: IMG('5665f947-5a8a-42a2-a4d8-223ce0758eaf', 'png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 5599, imageUrl: IMG('6c0b6005-9b05-4acc-b236-e6d8d71deb6b', 'png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 2799, imageUrl: IMG('ba85e513-c889-4cd4-bd3b-85ad4c891452', 'png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'mots-c', mg: 40, priceCents: 8399, imageUrl: IMG('d0ad2131-9a82-4295-9e66-e7ca5bd7cd0a', 'png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'selank', mg: 10, priceCents: 2799, imageUrl: IMG('50327acf-2a05-4d0b-951b-99ab7cc5edf1', 'png'), coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'semax', mg: 10, priceCents: 2799, imageUrl: IMG('a1bd0e22-78de-4ab0-a957-8234c2c1211b', 'png'), coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'dsip', mg: 10, priceCents: 3499, imageUrl: IMG('6e4a5379-83d6-41f8-ac25-e18235a167b4', 'png'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 3149, imageUrl: IMG('bd7f2316-0fee-47f5-8425-93f079449e48', 'png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4549, imageUrl: IMG('2c82727e-b499-42b7-8ecc-9712d98bd3b0', 'png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 6299, imageUrl: IMG('6c2d6273-d48b-4c7d-8955-423dd69cde82', 'png'), coaUrl: COA_PAGE, productUrl: product('tesa') },
  { productSlug: 'glutathione', mg: 1640, priceCents: 5599, imageUrl: IMG('f27519ae-fcf6-40bb-8abd-eeaee9ade1b0', 'jpg'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 6999, imageUrl: IMG('d5db6c24-fe65-415d-a500-bb78403d296e', 'png'), coaUrl: COA_PAGE, productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 7699, imageUrl: IMG('4f9a5d6a-1f1a-4b2e-b2d5-c970625841eb', 'png'), coaUrl: COA_PAGE, productUrl: product('klow') },
  { productSlug: 'wolverine', mg: 20, priceCents: 8399, imageUrl: IMG('f911e00a-0895-42b4-a25b-ac6851b42e19', 'png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500-5mg5mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3149, imageUrl: IMG('e70b9858-06c6-4925-9a69-b98eb12dfc29', 'png'), coaUrl: COA_PAGE, productUrl: product('mt-2') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 3499, imageUrl: IMG('e6ceda0c-b2f5-4ddd-8a4d-1306e5da1b41', 'png'), coaUrl: COA_PAGE, productUrl: product('mt-1') },
  { productSlug: 'semax', form: 'spray', mg: 100, priceCents: 5599, imageUrl: IMG('d3f60a6a-7349-46f5-98a1-b74c5275c78e', 'png'), coaUrl: COA_PAGE, productUrl: product('semax-spray') },
  { productSlug: 'ghk-cu', form: 'spray', mg: 100, priceCents: 5599, imageUrl: IMG('bb8558ca-269b-4085-a119-61e67aeaa7dc', 'png'), coaUrl: COA_PAGE, productUrl: product('selank-spray') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 5249, imageUrl: IMG('0d0385ec-2f37-4240-add8-d255c963b5d4', 'png'), coaUrl: COA_PAGE, productUrl: product('selank-spray') },
  { productSlug: 'pt-141', form: 'spray', mg: 10, priceCents: 4899, imageUrl: IMG('a32ceb19-8ade-4921-bfbe-6e613fe07a0c', 'png'), coaUrl: COA_PAGE, productUrl: product('pt-141-') },
  { productSlug: 'melanotan-i', form: 'spray', mg: 10, priceCents: 5599, imageUrl: IMG('04f013b9-1343-4ec0-a9d2-2523c3009eb2', 'png'), coaUrl: COA_PAGE, productUrl: product('mt-1-spray') },
  { productSlug: 'nad', form: 'spray', mg: 500, priceCents: 5599, imageUrl: IMG('39a3028b-ee91-44ec-baaf-ebb2a03b44a9', 'png'), coaUrl: COA_PAGE, productUrl: product('nad-spray') },
  { productSlug: 'wolverine', form: 'spray', mg: 10, priceCents: 5599, imageUrl: IMG('15c536d5-96a6-4a01-81fd-401038caac97', 'png'), coaUrl: COA_PAGE, productUrl: product('bpctb-spray') },
  { productSlug: 'dsip', form: 'spray', mg: 10, priceCents: 4899, imageUrl: IMG('c7d757ae-2d29-4e89-8f55-cc35a100aa7f', 'png'), coaUrl: COA_PAGE, productUrl: product('dsip-spray') },
];

runSeed({ supplierSlug: 'arizen-biolabs-2', listings });
