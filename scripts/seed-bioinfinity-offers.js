// Adds Bioinfinity's product listings, as supplied from bioinfinity.co, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const product = (path) => `https://www.bioinfinity.co/product/${path}/?ref=adamdaFAKR`;
// The same general COA library page was supplied for every listing.
const COA_PAGE = 'https://www.bioinfinity.co/coa-library/';

// Prices in integer cents, sizes in mg (a blend's total). inStock: false where the listing was
// supplied as out of stock.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 4000, imageUrl: 'https://www.bioinfinity.co/products/variants/BPC157-5MG.webp', coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 8000, imageUrl: 'https://www.bioinfinity.co/products/variants/BPC157-10MG.webp', coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 5, priceCents: 5500, imageUrl: 'https://www.bioinfinity.co/products/variants/TB500-5MG.webp', coaUrl: COA_PAGE, productUrl: product('tb-500') },
  { productSlug: 'tb-500', mg: 10, priceCents: 9500, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1770402808430_IMG_3926.webp', coaUrl: COA_PAGE, productUrl: product('tb-500') },
  // 5 mg + 5 mg and 10 mg + 10 mg.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 9000, imageUrl: 'https://www.bioinfinity.co/products/variants/BPC157-TB500-BLEND-5_5MG.webp', coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 17500, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1770384111193_Wolverine_-_2.webp', coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 5000, imageUrl: 'https://www.bioinfinity.co/products/variants/GHK-CU-50MG.webp', coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 5, priceCents: 8500, imageUrl: 'https://www.bioinfinity.co/products/variants/GLP3R-5MG.webp', coaUrl: COA_PAGE, productUrl: product('glp3-r') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 14500, imageUrl: 'https://www.bioinfinity.co/products/variants/GLP3R-5MG.webp', coaUrl: COA_PAGE, productUrl: product('glp3-r') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 24500, imageUrl: 'https://www.bioinfinity.co/products/variants/GLP3R-5MG.webp', coaUrl: COA_PAGE, productUrl: product('glp3-r') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 37500, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1771507891276_IMG_4433.webp', coaUrl: COA_PAGE, productUrl: product('glp3-r') },
  { productSlug: 'tirzepatide', mg: 5, priceCents: 5000, imageUrl: 'https://www.bioinfinity.co/products/variants/GLP2T-5MG.webp', coaUrl: COA_PAGE, productUrl: product('glp2-t') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 8500, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1770541346737_1770462612154-084ca8bd-d914-4382-ab90-6c784098ac7e.webp', coaUrl: COA_PAGE, productUrl: product('glp2-t') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 4500, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1770541287652_1770485325221-565e2d7c-18ca-4fc1-b803-f78be0b1e02b.webp', coaUrl: COA_PAGE, productUrl: product('glp1-s') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 8000, inStock: false, imageUrl: 'https://www.bioinfinity.co/products/variants/GLP1S-10MG.webp', coaUrl: COA_PAGE, productUrl: product('glp1-s') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 4500, imageUrl: 'https://www.bioinfinity.co/products/variants/IPAMORELIN-5MG.webp', coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 11000, imageUrl: 'https://www.bioinfinity.co/products/variants/NAD-500MG.webp', coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 7000, imageUrl: 'https://www.bioinfinity.co/products/variants/MOTS-C-10MG.webp', coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 20, priceCents: 14000, imageUrl: 'https://www.bioinfinity.co/products/variants/MOTS-C-10MG.webp', coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 5500, imageUrl: 'https://www.bioinfinity.co/products/variants/EPITHALON-10MG.webp', coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 20000, inStock: false, imageUrl: 'https://www.bioinfinity.co/products/variants/EPITHALON-10MG.webp', coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 6000, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1773244853455_Semax_10mg.webp', coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 7000, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1773244830697_Selank_10_mg.webp', coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: '5-amino-1mq', mg: 5, priceCents: 4000, imageUrl: 'https://www.bioinfinity.co/products/variants/5AMINO1MQ-5MG.webp', coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 6500, imageUrl: 'https://www.bioinfinity.co/uploads/1770321832240_5AMINO1MQ-10MG.webp', coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 25000, imageUrl: 'https://www.bioinfinity.co/products/variants/5AMINO1MQ-50MG.webp', coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: 'dsip', mg: 5, priceCents: 7000, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1773244803727_DSIP_5_mg.webp', coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 10, priceCents: 14000, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1773244803727_DSIP_5_mg.webp', coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 4500, imageUrl: 'https://www.bioinfinity.co/products/variants/CJC-1295-NO-DAC-5MG.webp', coaUrl: COA_PAGE, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 9500, imageUrl: 'https://www.bioinfinity.co/products/variants/CJC-1295-NO-DAC-IPAMORELIN-BLEND-5MG.webp', coaUrl: COA_PAGE, productUrl: product('cjc-1295-ipamorelin') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 21000, imageUrl: 'https://www.bioinfinity.co/products/variants/GLOW-BLEND.webp', coaUrl: COA_PAGE, productUrl: product('glow-blend') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 24000, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1782216766898_KLOWBLEND.webp', coaUrl: COA_PAGE, productUrl: product('klow-blend') },
  // Two water products: the vendor's regular bottle and a separately listed "Hospira" bottle.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2200, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1770485711024_BAC-10ML.webp', coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 3800, inStock: false, imageUrl: 'https://cvmdxigyaarsbvqmplsv.supabase.co/storage/v1/object/public/uploads/1770485774750_BAC30ML.webp', coaUrl: COA_PAGE, productUrl: product('hospira-bacteriostatic-water') },
];

runSeed({ supplierSlug: 'bioinfinity-2', listings });
