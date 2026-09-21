// Adds Elytra Labs's product listings, as supplied from elytralabs.shop,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const COA = 'https://elytralabs.shop/coa?aff=PRODUCTS';
const COA_HTML = 'https://elytralabs.shop/coa.html?aff=PRODUCTS';
const REF = 'aff=PRODUCTS';

const listings = [
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 3500,
    imageUrl: 'https://elytralabs.shop/images/bpc-157-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-bc10?${REF}`,
  },
  {
    productSlug: 'tb-500',
    mg: 10,
    priceCents: 4000,
    imageUrl: 'https://elytralabs.shop/images/tb-500-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-bt10?${REF}`,
  },
  {
    productSlug: 'ghk-cu',
    mg: 100,
    priceCents: 7500,
    inStock: false,
    imageUrl: 'https://elytralabs.shop/images/ghk-cu-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-cu100?${REF}`,
  },
  {
    productSlug: 'ipamorelin-cjc-1295-no-dac',
    mg: 10,
    priceCents: 4500,
    imageUrl: 'https://elytralabs.shop/images/cjc-1295-ipamorelin-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-cjc5?${REF}`,
  },
  {
    productSlug: 'mots-c',
    mg: 40,
    priceCents: 6500,
    imageUrl: 'https://elytralabs.shop/images/mots-c-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-ms40?${REF}`,
  },
  {
    productSlug: 'semax',
    mg: 10,
    priceCents: 3000,
    imageUrl: 'https://elytralabs.shop/images/semax-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-xa10?${REF}`,
  },
  {
    productSlug: 'nad',
    mg: 1000,
    priceCents: 5500,
    inStock: false,
    imageUrl: 'https://elytralabs.shop/images/nad-detail.webp?v=95',
    coaUrl: COA,
    productUrl: `https://elytralabs.shop/product-nad1k?${REF}`,
  },
  {
    productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu',
    mg: 80,
    priceCents: 7500,
    imageUrl: 'https://elytralabs.shop/images/klow-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-klow.html?${REF}`,
  },
  {
    productSlug: 'melanotan-2',
    mg: 10,
    priceCents: 2500,
    imageUrl: 'https://elytralabs.shop/images/mt-2-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-ml10.html?${REF}`,
  },
  {
    productSlug: 'dsip',
    mg: 10,
    priceCents: 3000,
    imageUrl: 'https://elytralabs.shop/images/dsip-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-ds10.html?${REF}`,
  },
  {
    productSlug: 'wolverine',
    mg: 20,
    priceCents: 5000,
    imageUrl: 'https://elytralabs.shop/images/wolverine-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-wolv.html?${REF}`,
  },
  {
    productSlug: 'glow-ghk-cu-bpc-157-tb-500',
    mg: 70,
    priceCents: 6500,
    imageUrl: 'https://elytralabs.shop/images/glow-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-glow70.html?${REF}`,
  },
  {
    productSlug: 'selank',
    mg: 10,
    priceCents: 3000,
    imageUrl: 'https://elytralabs.shop/images/selank-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-sk10?id=SK10&${REF}`,
  },
  {
    productSlug: 'ahk-cu',
    mg: 100,
    priceCents: 3500,
    imageUrl: 'https://elytralabs.shop/images/ahk-cu-detail.webp?v=95',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-ahk100.html?${REF}`,
  },
  {
    productSlug: 'bacteriostatic-water',
    mg: 30,
    priceCents: 1750,
    imageUrl: 'https://elytralabs.shop/images/bac-water-30ml.webp?v=7',
    coaUrl: COA_HTML,
    productUrl: `https://elytralabs.shop/product-ba30?id=BA30&${REF}`,
  },
];

runSeed({ supplierSlug: 'elytra-labs-2', listings });
