// Adds GenX's product listings, as supplied from genx.bio,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// No COA links were supplied for any listing.
const { runSeed } = require('./lib/seed-vendor-offers');

const UPLOADS = 'https://genx.bio/wp-content/uploads/';
const product = (slug) => `https://genx.bio/product/${slug}/ref/31/`;

const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 3000, imageUrl: `${UPLOADS}2021/03/BPC-157_5MG.webp`, coaUrl: null, productUrl: product('bpc-157-5mg') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5900, imageUrl: `${UPLOADS}2021/03/Blend-CJC-1295-NO-DAC-Ipamorelin-10mg.webp`, coaUrl: null, productUrl: product('blend-cjc-1295-no-dac-ipamorelin') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 6500, imageUrl: `${UPLOADS}2022/05/Blend-TB-500-BPC-157-10mg-Pro-Pic-scaled-1024x1024.jpg.avif`, coaUrl: null, productUrl: product('bpc-157-tb-500-blend-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3500, imageUrl: `${UPLOADS}2021/03/Epithalon-Epitalon-1536x1536.webp`, coaUrl: null, productUrl: product('epithalon') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 5000, imageUrl: `${UPLOADS}2021/03/GHK-Cu-50mg.webp`, coaUrl: null, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghrp-2', mg: 5, priceCents: 2000, imageUrl: `${UPLOADS}2020/06/GHRP-2-5mg-1024x1024.webp`, coaUrl: null, productUrl: product('ghrp-2-peptide') },
  { productSlug: 'ipamorelin', mg: 2, priceCents: 2200, imageUrl: `${UPLOADS}2021/03/Ipamorelin-2mg.webp`, coaUrl: null, productUrl: product('ipamorelin-2mg') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 5900, imageUrl: `${UPLOADS}2022/09/Semaglutide-5mg-vial-scaled.jpg`, coaUrl: null, productUrl: product('semaglutide-5mg') },
  { productSlug: 'tb-500', mg: 2, priceCents: 3300, imageUrl: `${UPLOADS}2021/05/TB-500-beta-4-scaled-1536x1536.webp`, coaUrl: null, productUrl: product('tb-500-2mg') },
  { productSlug: 'selank', mg: 10, priceCents: 3300, imageUrl: `${UPLOADS}2021/03/Selank-10mg-1536x1536.webp`, coaUrl: null, productUrl: product('selank-10mg') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 4300, imageUrl: `${UPLOADS}2021/03/Sermorelin-5mg.webp`, coaUrl: null, productUrl: product('sermorelin-5mg') },
];

runSeed({ supplierSlug: 'genx-2', listings });
