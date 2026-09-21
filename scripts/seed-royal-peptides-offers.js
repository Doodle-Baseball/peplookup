// Adds Royal Peptides's product listings, as supplied from royal-peptides.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// "(10-vials)" packs are stored as `count: 10` at the same per-vial `mg`, matching the
// convention used for other vendors' multi-vial packs (e.g. seed-peak-lab-peptides-offers.js),
// even where the vendor's own form label says "Kit" rather than "Vial".
const { runSeed } = require('./lib/seed-vendor-offers');

const COA_PAGE = 'https://royal-peptides.com/coas/?ref=peplookup';
const UPLOADS = 'https://royal-peptides.com/wp-content/uploads/';
const REF = '?ref=peplookup';
const shop = (slug) => `https://royal-peptides.com/shop/${slug}/${REF}`;

const listings = [
  { productSlug: 'tb-500', mg: 10, priceCents: 7000, imageUrl: `${UPLOADS}2025/02/IMG_5873.png`, coaUrl: COA_PAGE, productUrl: shop('tb-500-10mg-kit') },
  { productSlug: 'tb-500', mg: 10, count: 10, priceCents: 48500, imageUrl: `${UPLOADS}2025/02/IMG_5873.png`, coaUrl: COA_PAGE, productUrl: shop('tb-500-10mg-kit') },

  { productSlug: 'ghk-cu', mg: 100, priceCents: 7000, imageUrl: `${UPLOADS}2025/02/f0631042-9c18-4228-a5b1-7736a45db5df.png`, coaUrl: COA_PAGE, productUrl: shop('ghk-cu-peptide') },
  { productSlug: 'ghk-cu', mg: 100, count: 10, priceCents: 58000, imageUrl: `${UPLOADS}2025/02/f0631042-9c18-4228-a5b1-7736a45db5df.png`, coaUrl: COA_PAGE, productUrl: shop('ghk-cu-peptide') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 4500, imageUrl: `${UPLOADS}2025/02/9c69bf76-a93f-409b-818a-50bcb27c999d-3.png`, coaUrl: COA_PAGE, productUrl: shop('ghk-cu-peptide') },
  { productSlug: 'ghk-cu', mg: 50, count: 10, priceCents: 40000, imageUrl: `${UPLOADS}2025/02/9c69bf76-a93f-409b-818a-50bcb27c999d-3.png`, coaUrl: COA_PAGE, productUrl: shop('ghk-cu-peptide') },

  { productSlug: 'retatrutide', mg: 5, priceCents: 4500, imageUrl: `${UPLOADS}2025/02/img_5473.png`, coaUrl: COA_PAGE, productUrl: shop('retatrutide-vial') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7000, imageUrl: `${UPLOADS}2025/02/img_5473.png`, coaUrl: COA_PAGE, productUrl: shop('retatrutide-vial') },
  { productSlug: 'retatrutide', mg: 15, priceCents: 9500, imageUrl: `${UPLOADS}2025/02/img_5473.png`, coaUrl: COA_PAGE, productUrl: shop('retatrutide-vial') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12500, imageUrl: `${UPLOADS}2025/02/img_5473.png`, coaUrl: COA_PAGE, productUrl: shop('retatrutide-vial') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 18000, imageUrl: `${UPLOADS}2025/02/img_5473.png`, coaUrl: COA_PAGE, productUrl: shop('retatrutide-vial') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 28500, imageUrl: `${UPLOADS}2025/02/img_5473.png`, coaUrl: COA_PAGE, productUrl: shop('retatrutide-vial') },

  { productSlug: 'tirzepatide', mg: 50, priceCents: 3600, imageUrl: `${UPLOADS}2025/02/img_5474.png`, coaUrl: COA_PAGE, productUrl: shop('tirzepatide-vials') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 5000, imageUrl: `${UPLOADS}2025/02/img_5474.png`, coaUrl: COA_PAGE, productUrl: shop('tirzepatide-vials') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 9000, imageUrl: `${UPLOADS}2025/02/img_5474.png`, coaUrl: COA_PAGE, productUrl: shop('tirzepatide-vials') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 13000, imageUrl: `${UPLOADS}2025/02/img_5474.png`, coaUrl: COA_PAGE, productUrl: shop('tirzepatide-vials') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 24500, imageUrl: `${UPLOADS}2025/02/img_5474.png`, coaUrl: COA_PAGE, productUrl: shop('tirzepatide-vials') },

  { productSlug: 'semaglutide', mg: 5, priceCents: 4500, imageUrl: `${UPLOADS}2025/05/IMG_6525.png`, coaUrl: COA_PAGE, productUrl: shop('semaglutide-vial') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 7500, imageUrl: `${UPLOADS}2025/05/IMG_6525.png`, coaUrl: COA_PAGE, productUrl: shop('semaglutide-vial') },
  { productSlug: 'semaglutide', mg: 15, priceCents: 11000, imageUrl: `${UPLOADS}2025/05/IMG_6525.png`, coaUrl: COA_PAGE, productUrl: shop('semaglutide-vial') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 15500, imageUrl: `${UPLOADS}2025/05/IMG_6525.png`, coaUrl: COA_PAGE, productUrl: shop('semaglutide-vial') },

  { productSlug: 'ipamorelin', mg: 5, priceCents: 4500, imageUrl: `${UPLOADS}2025/02/img_5754.png`, coaUrl: COA_PAGE, productUrl: shop('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6500, imageUrl: `${UPLOADS}2025/02/img_5754.png`, coaUrl: COA_PAGE, productUrl: shop('ipamorelin') },
  { productSlug: 'ipamorelin', mg: 10, count: 10, priceCents: 45000, imageUrl: `${UPLOADS}2025/02/img_2578.jpeg`, coaUrl: COA_PAGE, productUrl: shop('ipamorelin') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 7500, imageUrl: `${UPLOADS}2025/02/img_5260.jpeg`, coaUrl: COA_PAGE, productUrl: shop('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 10, count: 10, priceCents: 70000, imageUrl: `${UPLOADS}2025/02/img_5260.jpeg`, coaUrl: COA_PAGE, productUrl: shop('tesamorelin') },

  { productSlug: 'nad', mg: 1000, priceCents: 8500, imageUrl: `${UPLOADS}2025/02/811e3f1a-8959-4e0f-843a-c816f8571fb5.png`, coaUrl: COA_PAGE, productUrl: shop('nad-500mg-vial-kit-buffered') },
  { productSlug: 'nad', mg: 1000, count: 10, priceCents: 61000, imageUrl: `${UPLOADS}2025/02/811e3f1a-8959-4e0f-843a-c816f8571fb5.png`, coaUrl: COA_PAGE, productUrl: shop('nad-500mg-vial-kit-buffered') },
  { productSlug: 'nad', mg: 500, priceCents: 6000, imageUrl: `${UPLOADS}2025/02/811e3f1a-8959-4e0f-843a-c816f8571fb5.png`, coaUrl: COA_PAGE, productUrl: shop('nad-500mg-vial-kit-buffered') },
  { productSlug: 'nad', mg: 500, count: 10, priceCents: 45000, imageUrl: `${UPLOADS}2025/02/811e3f1a-8959-4e0f-843a-c816f8571fb5.png`, coaUrl: COA_PAGE, productUrl: shop('nad-500mg-vial-kit-buffered') },

  { productSlug: 'mots-c', mg: 10, priceCents: 6000, imageUrl: `${UPLOADS}2025/02/IMG_5882.png`, coaUrl: COA_PAGE, productUrl: shop('mots-c-peptide') },
  { productSlug: 'mots-c', mg: 10, count: 10, priceCents: 36000, imageUrl: `${UPLOADS}2025/02/IMG_5882.png`, coaUrl: COA_PAGE, productUrl: shop('mots-c-peptide') },
  { productSlug: 'mots-c', mg: 40, priceCents: 13000, imageUrl: `${UPLOADS}2025/02/IMG_5882.png`, coaUrl: COA_PAGE, productUrl: shop('mots-c-peptide') },
  { productSlug: 'mots-c', mg: 40, count: 10, priceCents: 67500, imageUrl: `${UPLOADS}2025/02/IMG_5882.png`, coaUrl: COA_PAGE, productUrl: shop('mots-c-peptide') },

  { productSlug: 'epitalon', mg: 10, priceCents: 5500, imageUrl: `${UPLOADS}2025/05/img_8277.png`, coaUrl: COA_PAGE, productUrl: shop('epitalon-kit') },
  { productSlug: 'epitalon', mg: 10, count: 10, priceCents: 35000, imageUrl: `${UPLOADS}2025/05/img_8277.png`, coaUrl: COA_PAGE, productUrl: shop('epitalon-kit') },
  { productSlug: 'epitalon', mg: 50, count: 10, priceCents: 58000, imageUrl: `${UPLOADS}2025/05/img_8277.png`, coaUrl: COA_PAGE, productUrl: shop('epitalon-kit') },

  { productSlug: 'semax', mg: 10, priceCents: 6500, imageUrl: `${UPLOADS}2025/03/IMG_5865.png`, coaUrl: COA_PAGE, productUrl: shop('semax-10mg') },
  { productSlug: 'semax', mg: 10, count: 10, priceCents: 43000, imageUrl: `${UPLOADS}2025/03/IMG_5865.png`, coaUrl: COA_PAGE, productUrl: shop('semax-10mg') },

  { productSlug: 'selank', mg: 10, priceCents: 6500, imageUrl: `${UPLOADS}2025/03/IMG_5866.png`, coaUrl: COA_PAGE, productUrl: shop('selank-10mg') },
  { productSlug: 'selank', mg: 10, count: 10, priceCents: 43000, imageUrl: `${UPLOADS}2025/03/IMG_5866.png`, coaUrl: COA_PAGE, productUrl: shop('selank-10mg') },

  { productSlug: 'pt-141', mg: 10, priceCents: 5000, imageUrl: `${UPLOADS}2025/02/IMG_5881.png`, coaUrl: COA_PAGE, productUrl: shop('pt-141-10mg') },
  { productSlug: 'pt-141', mg: 10, count: 10, priceCents: 39000, imageUrl: `${UPLOADS}2025/02/IMG_5881.png`, coaUrl: COA_PAGE, productUrl: shop('pt-141-10mg') },

  { productSlug: '5-amino-1mq', mg: 10, count: 10, priceCents: 42000, imageUrl: `${UPLOADS}2025/07/img_9728.jpeg`, coaUrl: COA_PAGE, productUrl: shop('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 8000, imageUrl: `${UPLOADS}2025/07/img_9728.jpeg`, coaUrl: COA_PAGE, productUrl: shop('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, count: 10, priceCents: 62000, imageUrl: `${UPLOADS}2025/07/img_9728.jpeg`, coaUrl: COA_PAGE, productUrl: shop('5-amino-1mq') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6500, imageUrl: `${UPLOADS}2025/05/photoroom_20250513_021840.jpeg`, coaUrl: COA_PAGE, productUrl: shop('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 10, count: 10, priceCents: 45000, imageUrl: `${UPLOADS}2025/05/photoroom_20250513_021840.jpeg`, coaUrl: COA_PAGE, productUrl: shop('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 12000, imageUrl: `${UPLOADS}2025/05/photoroom_20250513_021840.jpeg`, coaUrl: COA_PAGE, productUrl: shop('ss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, count: 10, priceCents: 71000, imageUrl: `${UPLOADS}2025/05/photoroom_20250513_021840.jpeg`, coaUrl: COA_PAGE, productUrl: shop('ss-31') },

  { productSlug: 'dsip', mg: 5, priceCents: 4500, imageUrl: `${UPLOADS}2025/03/IMG_5868.png`, coaUrl: COA_PAGE, productUrl: shop('dsip-5mg') },

  { productSlug: 'melanotan-i', mg: 10, priceCents: 5500, imageUrl: `${UPLOADS}2025/04/IMG_5861.png`, coaUrl: COA_PAGE, productUrl: shop('melanotan-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 5500, imageUrl: `${UPLOADS}2025/04/IMG_5861.png`, coaUrl: COA_PAGE, productUrl: shop('melanotan-10mg') },

  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 7000, imageUrl: `${UPLOADS}2025/02/b2f58166-a71c-47f3-9805-e216ca0b7e90.png`, coaUrl: COA_PAGE, productUrl: shop('glow-blend-vial-kit') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, count: 10, priceCents: 53000, imageUrl: `${UPLOADS}2025/02/fc60145e-4fe7-4c07-9584-892d8d7f5084.png`, coaUrl: COA_PAGE, productUrl: shop('glow-blend-vial-kit') },

  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 9000, imageUrl: `${UPLOADS}2025/05/6e933948-d988-42e1-886a-faba5b080d63.png`, coaUrl: COA_PAGE, productUrl: shop('buy-klow-peptide-blend-online-usa') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, count: 10, priceCents: 65000, imageUrl: `${UPLOADS}2025/05/36b9f878-7a6b-4fa2-988d-7df0d46809d8.png`, coaUrl: COA_PAGE, productUrl: shop('buy-klow-peptide-blend-online-usa') },

  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 700, imageUrl: `${UPLOADS}2025/02/e6b82011-9c72-4387-a757-9621b7e8d467.png`, coaUrl: COA_PAGE, productUrl: shop('reconstitution-solution') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1500, imageUrl: `${UPLOADS}2025/02/e6b82011-9c72-4387-a757-9621b7e8d467.png`, coaUrl: COA_PAGE, productUrl: shop('reconstitution-solution') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 3000, imageUrl: `${UPLOADS}2025/02/e6b82011-9c72-4387-a757-9621b7e8d467.png`, coaUrl: COA_PAGE, productUrl: shop('reconstitution-solution') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 7000, imageUrl: `${UPLOADS}2025/10/img_6479-3.png`, coaUrl: COA_PAGE, productUrl: shop('cjcno-dac-ipamorelin-10mg-kit') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, count: 10, priceCents: 45000, imageUrl: `${UPLOADS}2025/10/img_6479-3.png`, coaUrl: COA_PAGE, productUrl: shop('cjcno-dac-ipamorelin-10mg-kit') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 9500, imageUrl: `${UPLOADS}2025/10/img_6479-3.png`, coaUrl: COA_PAGE, productUrl: shop('cjcno-dac-ipamorelin-10mg-kit') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, count: 10, priceCents: 68500, imageUrl: `${UPLOADS}2025/10/img_6479-3.png`, coaUrl: COA_PAGE, productUrl: shop('cjcno-dac-ipamorelin-10mg-kit') },

  // Compound name is "Wolverine" (not the plain BPC-157/TB-500 blend), matching the `wolverine` product used elsewhere.
  { productSlug: 'wolverine', mg: 10, priceCents: 7500, imageUrl: `${UPLOADS}2025/02/IMG_5864.png`, coaUrl: COA_PAGE, productUrl: shop('wolverine-bpc-157-tb-500-blend') },
  { productSlug: 'wolverine', mg: 10, count: 10, priceCents: 45000, imageUrl: `${UPLOADS}2025/02/IMG_5864.png`, coaUrl: COA_PAGE, productUrl: shop('wolverine-bpc-157-tb-500-blend') },
  { productSlug: 'wolverine', mg: 20, priceCents: 11500, imageUrl: `${UPLOADS}2025/02/img_1687-1-600x600.png`, coaUrl: COA_PAGE, productUrl: shop('wolverine-bpc-157-tb-500-blend') },
  { productSlug: 'wolverine', mg: 20, count: 10, priceCents: 69500, imageUrl: `${UPLOADS}2025/02/img_1687-1-600x600.png`, coaUrl: COA_PAGE, productUrl: shop('wolverine-bpc-157-tb-500-blend') },

  { productSlug: 'bpc-157', mg: 10, priceCents: 5500, imageUrl: `${UPLOADS}2025/02/IMG_5874.png`, coaUrl: COA_PAGE, productUrl: shop('bpc-157-10mg-vial-kit') },
  { productSlug: 'bpc-157', mg: 10, count: 10, priceCents: 40000, imageUrl: `${UPLOADS}2025/02/IMG_5874.png`, coaUrl: COA_PAGE, productUrl: shop('bpc-157-10mg-vial-kit') },
  { productSlug: 'bpc-157', mg: 20, priceCents: 8000, inStock: false, imageUrl: `${UPLOADS}2025/02/IMG_5874.png`, coaUrl: COA_PAGE, productUrl: shop('bpc-157-10mg-vial-kit') },
  { productSlug: 'bpc-157', mg: 20, count: 10, priceCents: 58000, imageUrl: `${UPLOADS}2025/02/IMG_5874.png`, coaUrl: COA_PAGE, productUrl: shop('bpc-157-10mg-vial-kit') },
];

runSeed({ supplierSlug: 'royal-peptides-2', listings });
