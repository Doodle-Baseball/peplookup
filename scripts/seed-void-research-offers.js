// Adds Void Research's product listings, as supplied from voidresearch.shop,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor's general COA page rather than a certificate per listing; it is the link supplied for every product.
const COA_PAGE = 'https://voidresearch.shop/coa?ref=PEPLOOKUP';
const ASSETS = 'https://voidresearch.shop/__l5e/assets-v1/';
const REF = '?ref=PEPLOOKUP';
const product = (slug) => `https://voidresearch.shop/product/${slug}${REF}`;

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 3999, imageUrl: `${ASSETS}d506d371-b4f1-4dd7-b1ec-4afe566ad950/bpc-157-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 3999, imageUrl: `${ASSETS}43d9e0d5-0fee-4337-9714-3a72dfd35ca6/tb500.png?w=400`, coaUrl: COA_PAGE, productUrl: product('tb500') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}1def5fbd-99e2-4fee-8aa2-8cd87e41725f/bpc-157-tb-500.png?w=400`, coaUrl: COA_PAGE, productUrl: product('bpc-157-tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3999, imageUrl: `${ASSETS}63c8214c-29db-4bb4-8e2b-a7f7f3881f67/ghk-cu-50mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3499, imageUrl: `${ASSETS}37ad23fe-04a6-4677-b30f-ef0b46f15516/ghk-cu.png?w=400`, coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 5, priceCents: 3999, imageUrl: `${ASSETS}9c610b0b-6f52-4639-a8ea-1db916eadcea/glp-3-rt-5mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 5999, imageUrl: `${ASSETS}62ffc1ec-fce3-4a1f-9c73-c75df3e04b6a/glp-3-rt-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 10999, imageUrl: `${ASSETS}5dda53a1-577b-48c2-abb0-e012e5263ac9/glp-3-rt-20mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('glp-3-rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}974ad9fc-7ecd-40c9-b581-83f7446afa79/glp-2-tz.png?w=400`, coaUrl: COA_PAGE, productUrl: product('glp-2-tz') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 6499, imageUrl: `${ASSETS}4a92d10e-a157-42bc-8fb9-c785f22451e3/cagri-5mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('cagri') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 5499, imageUrl: `${ASSETS}69ce443a-2240-48a4-a224-635f99b47ba0/ipamorelin-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 6999, imageUrl: `${ASSETS}7e5b16ea-3877-4940-8dad-06c65c67e61b/tesamorelin-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 12499, imageUrl: `${ASSETS}184a55a2-6269-4a9c-b126-3b19b8cf0edd/tesamorelin-20mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('tesamorelin') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 5999, imageUrl: `${ASSETS}3c6c2188-3437-4781-89d8-0cc02c7184e1/cjc-no-dac-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('cjc-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6999, imageUrl: `${ASSETS}9e5e7b22-4915-4f23-ab92-f8d58ac533ea/cjcipa-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('cjc-ipa') },
  { productSlug: 'nad', mg: 500, priceCents: 5499, imageUrl: `${ASSETS}512f689f-83b8-4c1b-bf13-9f5931070fbc/nad-500mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('nad') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 5999, imageUrl: `${ASSETS}b146322c-32d3-40c1-9bb2-ab863e547637/gluta.png?w=400`, coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'mots-c', mg: 10, priceCents: 3999, imageUrl: `${ASSETS}01f8051c-14d2-47ea-b89c-859c4ea8c48f/mots-c.png?w=400`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 17999, imageUrl: `${ASSETS}343a23fa-44f7-4655-9414-c74eef637f60/mots-c-40mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 4999, inStock: false, imageUrl: `${ASSETS}2bd9b8e3-b689-4884-a84a-750230fed6d4/epitalon.webp?w=1024`, coaUrl: COA_PAGE, productUrl: product('epitalon') },
  { productSlug: 'semax', mg: 10, priceCents: 2999, imageUrl: `${ASSETS}eb3fe271-df73-4e99-8697-90911e796da8/semax-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 2999, imageUrl: `${ASSETS}b76e3d4a-c86e-4b37-b8fa-37d11724346a/selank-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('selank') },
  { productSlug: 'dsip', mg: 5, priceCents: 2999, imageUrl: `${ASSETS}1a6acd55-d558-4de3-a190-4d4912eb3eb4/dsip-5mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('dsip') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 4999, inStock: false, imageUrl: `${ASSETS}c622cc22-7620-4a8e-a1f5-3e17e2afbe73/5-amino-1mq.webp?w=1024`, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: 'ahk-cu', mg: 50, priceCents: 4999, inStock: false, imageUrl: `${ASSETS}e37a1c2d-962b-4884-9131-e41a29b43540/ahk-cu.webp?w=1024`, coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  { productSlug: 'ahk-cu', mg: 100, priceCents: 9999, inStock: false, imageUrl: `${ASSETS}e37a1c2d-962b-4884-9131-e41a29b43540/ahk-cu.webp?w=1024`, coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  { productSlug: 'pt-141', mg: 10, priceCents: 2999, imageUrl: `${ASSETS}a3678c21-ad59-4d72-a83e-8aaa23425382/pt-14110mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('pt-141') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 2999, imageUrl: `${ASSETS}5052002d-89a1-47e9-9f11-6933eb50a2c4/mt-1.png?w=400`, coaUrl: COA_PAGE, productUrl: product('mt-1') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 2999, imageUrl: `${ASSETS}96eb4abb-f664-42c4-857e-9dac69d68947/mt-2.png?w=400`, coaUrl: COA_PAGE, productUrl: product('mt-2') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 6999, imageUrl: `${ASSETS}e8b29466-b9ae-42db-8f03-019034f58fd6/glow-70mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 8999, imageUrl: `${ASSETS}af53c5f1-dca7-43b6-8619-6ac4a7d9446b/klow-80mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('klow') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 4499, inStock: false, imageUrl: `${ASSETS}04395f03-05b9-472f-a23b-99d26fa89379/ss-31-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('ss-31') },
  { productSlug: 'dihexa', mg: 10, priceCents: 8499, inStock: false, imageUrl: `${ASSETS}5fa29e99-4688-48a9-9ee8-22ccee025942/dihexa-10mg.png?w=400`, coaUrl: COA_PAGE, productUrl: product('dihexa') },
  { productSlug: 'semax', form: 'spray', mg: 10, priceCents: 5999, imageUrl: `${ASSETS}4b810368-5219-4e41-a2cf-3a6461b6b420/void-semax.png?w=400`, coaUrl: COA_PAGE, productUrl: product('semax-spray') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 5499, imageUrl: `${ASSETS}746ffea6-792b-4124-8f29-e76861e99cef/void-selank.png?w=400`, coaUrl: COA_PAGE, productUrl: product('selank-spray') },
  { productSlug: 'dsip', form: 'spray', mg: 10, priceCents: 5499, imageUrl: `${ASSETS}eebe9498-7780-4b52-8f85-2d0499326155/void-dsip.png?w=400`, coaUrl: COA_PAGE, productUrl: product('dsip-spray') },
  { productSlug: 'melanotan-i', form: 'spray', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}192107e9-58e9-4193-9b61-3807432e3b34/void-mt1.png?w=400`, coaUrl: COA_PAGE, productUrl: product('mt-1-spray') },
  { productSlug: 'melanotan-2', form: 'spray', mg: 10, priceCents: 4999, imageUrl: `${ASSETS}63638e28-8e6e-48fb-ab91-42ebdffc3641/void-mt2.png?w=400`, coaUrl: COA_PAGE, productUrl: product('mt-2-spray') },
  { productSlug: 'pt-141', form: 'spray', mg: 10, priceCents: 5499, imageUrl: `${ASSETS}0baa9914-065c-447a-8c87-f7e7512a247d/pt-141-spray-void-new.png?w=400`, coaUrl: COA_PAGE, productUrl: product('pt-141-spray') },
  { productSlug: 'ghk-cu', form: 'spray', mg: 10, priceCents: 6499, imageUrl: `${ASSETS}76482ae9-e3c8-4a0b-9641-69880b09bbc9/void-ghkcu-spray.png?w=400`, coaUrl: COA_PAGE, productUrl: product('ghk-cu-spray') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', form: 'spray', mg: 10, priceCents: 10999, imageUrl: `${ASSETS}098bd0a8-9b7c-4329-bdd5-78f844ff0074/void-cjcipa.png?w=400`, coaUrl: COA_PAGE, productUrl: product('cjc-ipa-spray') },
  { productSlug: 'epitalon', form: 'spray', mg: 10, priceCents: 6999, inStock: false, imageUrl: `${ASSETS}8a6c1336-4c4a-41b9-84c1-594db5b04df4/void-epitalon-spray.png?w=400`, coaUrl: COA_PAGE, productUrl: product('epitalon-spray') },
  { productSlug: 'nad', form: 'spray', mg: 500, priceCents: 6999, inStock: false, imageUrl: `${ASSETS}f19a59da-34c2-4233-a3c7-0beb8d01ffce/void-nad.png?w=400`, coaUrl: COA_PAGE, productUrl: product('nad-spray') },
  { productSlug: 'dihexa', form: 'spray', mg: 10, priceCents: 5499, inStock: false, imageUrl: `${ASSETS}20ec3549-82d4-4443-8152-edf790822c59/void-dihexa.png?w=400`, coaUrl: COA_PAGE, productUrl: product('dihexa-spray') },
];

runSeed({ supplierSlug: 'void-research-2', listings });
