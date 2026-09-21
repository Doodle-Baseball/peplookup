// Adds Peptixa Labs's product listings, as supplied from peptixalabs.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor's general COA page rather than a certificate per listing; it is the link supplied for every product.
const COA_LIBRARY = 'https://peptixalabs.com/coas-and-research/?ic=ADAMD';

const listings = [
  {
    productSlug: 'retatrutide',
    mg: 10,
    priceCents: 7224,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/0101-768x769.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/reta-10mg/?ic=ADAMD',
  },
  {
    productSlug: 'retatrutide',
    mg: 30,
    priceCents: 11049,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/0101-768x769.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/reta-10mg/?ic=ADAMD',
  },
  {
    // 10mg total (5mg BPC-157 + 5mg TB-500), stored on the combined-product scale.
    productSlug: 'wolverine',
    mg: 10,
    priceCents: 12749,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/0601-768x769.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/wolverine-stack/?ic=ADAMD',
  },
  {
    productSlug: 'glow-ghk-cu-bpc-157-tb-500',
    mg: 70,
    priceCents: 14449,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/01201-600x600.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/glow-10-10-50/?ic=ADAMD',
  },
  {
    productSlug: 'tirzepatide',
    mg: 30,
    priceCents: 10199,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/0201-768x769.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/tirzepatide-30mg-dual-glp-1-gip-receptor-agonist-research-compound/?ic=ADAMD',
  },
  {
    productSlug: 'mots-c',
    mg: 40,
    priceCents: 7649,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/02101-600x600.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/mots-c-40mg/?ic=ADAMD',
  },
  {
    productSlug: 'tesamorelin',
    mg: 10,
    priceCents: 10624,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/02901.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/tesamorelin-10mg/?ic=ADAMD',
  },
  {
    productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu',
    mg: 80,
    priceCents: 12749,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/01701-768x768.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/klow-peptide-blend/?ic=ADAMD',
  },
  {
    productSlug: 'nad',
    mg: 1000,
    priceCents: 11899,
    imageUrl: 'https://peptixalabs.com/wp-content/uploads/2026/04/02301-600x600.png',
    coaUrl: COA_LIBRARY,
    productUrl: 'https://peptixalabs.com/product/nad-1000mg/?ic=ADAMD',
  },
];

runSeed({ supplierSlug: 'peptixa-labs-2', listings });
