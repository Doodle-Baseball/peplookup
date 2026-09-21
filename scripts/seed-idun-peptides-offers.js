// Adds IDUN Peptides's product listings, as supplied from idunpeptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor's general COA page rather than a certificate per listing; it is the link supplied for every product.
const COA_LIBRARY = 'https://idunpeptides.com/coas/?ref=PEPLOOKUP';
const UPLOADS = 'https://idunpeptides.com/wp-content/uploads/';
const REF = '?ref=PEPLOOKUP';

const listings = [
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 2799,
    imageUrl: `${UPLOADS}2026/07/bpc-157-10mg-vial-card.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/bpc-157-10mg-vial/${REF}`,
  },
  {
    productSlug: 'tb-500',
    mg: 10,
    priceCents: 4499,
    imageUrl: `${UPLOADS}2026/07/tb-500.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/tb-500/${REF}`,
  },
  {
    // Size not listed by the vendor; confirmed with the user as 10mg + 10mg = 20mg total.
    productSlug: 'bpc-157-tb-500',
    mg: 20,
    priceCents: 5999,
    imageUrl: `${UPLOADS}2026/07/bpc-157-tb-500-wolverine-blend.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/bpc-157-tb-500-wolverine-blend/${REF}`,
  },
  {
    productSlug: 'ghk-cu',
    mg: 50,
    priceCents: 1999,
    imageUrl: `${UPLOADS}2026/07/ghk-cu.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/ghk-cu/${REF}`,
  },
  {
    productSlug: 'selank',
    mg: 10,
    priceCents: 2999,
    imageUrl: `${UPLOADS}2026/07/selank.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/selank/${REF}`,
  },
  {
    productSlug: 'epitalon',
    mg: 10,
    priceCents: 1999,
    imageUrl: `${UPLOADS}2026/07/epitalon.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/epitalon/${REF}`,
  },
  {
    productSlug: 'melanotan-2',
    mg: 10,
    priceCents: 1999,
    imageUrl: `${UPLOADS}2026/07/melanotan-ii.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/melanotan-ii/${REF}`,
  },
  {
    productSlug: 'ss-31-elamipretide',
    mg: 10,
    priceCents: 3499,
    imageUrl: `${UPLOADS}2026/07/ss-31.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/ss-31/${REF}`,
  },
  {
    productSlug: 'pt-141',
    mg: 10,
    priceCents: 2499,
    imageUrl: `${UPLOADS}2026/07/pt-141.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/pt-141/${REF}`,
  },
  {
    productSlug: 'cjc-1295-no-dac',
    mg: 10,
    priceCents: 3999,
    imageUrl: `${UPLOADS}2026/07/cjc-1295-no-dac.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/cjc-1295-no-dac/${REF}`,
  },
  {
    productSlug: 'ipamorelin',
    mg: 10,
    priceCents: 2999,
    imageUrl: `${UPLOADS}2026/07/ipamorelin.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/ipamorelin/${REF}`,
  },
  {
    productSlug: 'dsip',
    mg: 10,
    priceCents: 2999,
    imageUrl: `${UPLOADS}2026/07/dsip.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/dsip/${REF}`,
  },
  {
    productSlug: 'glutathione',
    mg: 10,
    priceCents: 4499,
    imageUrl: `${UPLOADS}2026/08/glutathione.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/glutathione/${REF}`,
  },
  {
    productSlug: 'semax',
    mg: 10,
    priceCents: 2499,
    imageUrl: `${UPLOADS}2026/07/semax.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/semax/${REF}`,
  },
  {
    productSlug: 'tesamorelin',
    mg: 10,
    priceCents: 4999,
    imageUrl: `${UPLOADS}2026/07/tesamorelin-ghrh-analog.webp`,
    coaUrl: COA_LIBRARY,
    productUrl: `https://idunpeptides.com/research-peptides/tesamorelin-ghrh-analog/${REF}`,
  },
];

runSeed({ supplierSlug: 'idun-peptides-2', listings });
