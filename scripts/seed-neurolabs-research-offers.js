// Adds NeuroLabs Research's product listings, as supplied from neurolabsresearch.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Every listing links the vendor's general COA page. Bacteriostatic water sizes are in ml,
// stored on the same `mg` field, matching the convention used for other vendors' water.
// Nasal "mist" products are `form: 'spray'`. Listings the vendor marked out of stock are
// stored as such; the rest take the shared default (in stock).
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?ref=PEPLOOKUP';
const COA_PAGE = `https://neurolabsresearch.com/coas/${REF}`;
const upload = (file) => `https://neurolabsresearch.com/wp-content/uploads/2026/07/${file}`;
const product = (slug) => `https://neurolabsresearch.com/product/${slug}/${REF}`;

const BPC_IMAGE = upload('hf_20260714_162113_8866997b-7a23-4493-b2f8-14d13cf55214-765x1024.png');
const TB_IMAGE = upload('hf_20260714_152226_ce844f7e-d5bb-4800-a894-e12555273520-765x1024.png');
const GHK_IMAGE = upload('hf_20260714_154007_a9e6d432-533c-49b2-99c7-2a165bb46fbf-765x1024.png');
const RETA_IMAGE = upload('hf_20260714_153716_c036a5c2-a425-44f4-a182-1e529be6940f-765x1024.png');
const TIRZ_IMAGE = upload('hf_20260714_152818_5442f9c6-1ae6-4e91-b090-4078fc1136bf-765x1024.png');
const IPA_IMAGE = upload('hf_20260714_153224_522f53bf-537e-4a34-9a16-79ec2f8cd0dc-765x1024.png');
const TESA_IMAGE = upload('hf_20260714_153648_01670fdf-911b-422c-962f-e09ef3d17978-765x1024.png');
const NAD_IMAGE = upload('hf_20260714_153620_a60f3d46-27fe-4b51-847b-fbea43a76196-765x1024.png');
const MOTS_IMAGE = upload('hf_20260714_153205_53fd0ef3-c631-4c3a-9ef2-b5e46310f9da-765x1024.png');
const AMINO_1MQ_IMAGE = upload('hf_20260714_150951_ddd39e97-4b01-4a7c-8bea-1493cb420230-765x1024.png');
const GLUTATHIONE_IMAGE = upload('hf_20260714_153124_4fa435a4-af74-447c-a929-7039c90c79fe-765x1024.png');
const IPA_CJC_IMAGE = upload('hf_20260714_154028_6188cc03-e189-4d7e-a10a-cc5925b3f418-765x1024.png');

const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4759, imageUrl: BPC_IMAGE, coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },

  { productSlug: 'tb-500', mg: 10, priceCents: 4875, imageUrl: TB_IMAGE, coaUrl: COA_PAGE, productUrl: product('tb500-10mg') },

  { productSlug: 'ghk-cu', mg: 50, priceCents: 4063, imageUrl: GHK_IMAGE, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50-100mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4571, imageUrl: GHK_IMAGE, coaUrl: COA_PAGE, productUrl: product('ghk-cu-50-100mg') },

  { productSlug: 'retatrutide', mg: 5, priceCents: 4571, imageUrl: RETA_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-3rt') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7115, imageUrl: RETA_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-3rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 11690, imageUrl: RETA_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-3rt') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 14741, imageUrl: RETA_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-3rt') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 18809, imageUrl: RETA_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-3rt') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 23849, inStock: false, imageUrl: RETA_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-3rt') },

  { productSlug: 'tirzepatide', mg: 10, priceCents: 7114, imageUrl: TIRZ_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-2-tz') },
  { productSlug: 'tirzepatide', mg: 40, priceCents: 17284, imageUrl: TIRZ_IMAGE, coaUrl: COA_PAGE, productUrl: product('nl-2-tz') },

  { productSlug: 'cagrilintide', mg: 5, priceCents: 9851, imageUrl: upload('hf_20260714_152939_55940123-c3c2-4839-ba67-6fc6a8782aaa-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('cagri-5mg') },

  { productSlug: 'ipamorelin', mg: 5, priceCents: 4577, imageUrl: IPA_IMAGE, coaUrl: COA_PAGE, productUrl: product('ipamorelin-10mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6611, imageUrl: IPA_IMAGE, coaUrl: COA_PAGE, productUrl: product('ipamorelin-10mg') },

  { productSlug: 'tesamorelin', mg: 10, priceCents: 9662, imageUrl: TESA_IMAGE, coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg-2') },
  { productSlug: 'tesamorelin', mg: 20, priceCents: 12204, imageUrl: TESA_IMAGE, coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg-2') },

  { productSlug: 'nad', mg: 500, priceCents: 7628, imageUrl: NAD_IMAGE, coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 9656, imageUrl: NAD_IMAGE, coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'nad', form: 'spray', mg: 10, priceCents: 7628, imageUrl: upload('hf_20260714_160234_90bb7ddd-cc92-4497-a071-630c2066f2c7-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('nad-mist') },

  { productSlug: 'mots-c', mg: 10, priceCents: 4571, imageUrl: MOTS_IMAGE, coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 18306, imageUrl: MOTS_IMAGE, coaUrl: COA_PAGE, productUrl: product('mots-c') },

  { productSlug: 'epitalon', mg: 10, priceCents: 5702, imageUrl: upload('hf_20260714_151012_09c05117-869d-4a76-a29f-b13fe57b9416-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('epithalon-10mg') },

  { productSlug: 'semax', mg: 10, priceCents: 3916, imageUrl: upload('hf_20260714_153911_34cb1c73-733f-4ae4-ad5a-f1211c34c02b-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'semax', form: 'spray', mg: 10, priceCents: 6712, imageUrl: upload('hf_20260714_160103_6147ecc1-4206-4425-a51f-6c5f514f739f-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('semax-mist') },

  { productSlug: 'selank', mg: 10, priceCents: 4699, imageUrl: upload('hf_20260714_160831_2eb7d7af-d345-47ac-9df0-3b80e7bd2a95-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('selank-10mg') },
  { productSlug: 'selank', form: 'spray', mg: 10, priceCents: 6712, imageUrl: upload('hf_20260714_160053_318549ec-1b06-4fcc-9cc2-ff9f1f344b34-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('selank-mist') },

  { productSlug: 'pt-141', mg: 10, priceCents: 10004, imageUrl: upload('hf_20260714_152233_4252bd44-0dbc-45ef-8082-d09c400c392f-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },

  { productSlug: '5-amino-1mq', mg: 5, priceCents: 3655, imageUrl: AMINO_1MQ_IMAGE, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-5mg') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 5035, imageUrl: AMINO_1MQ_IMAGE, coaUrl: COA_PAGE, productUrl: product('5-amino-1mq-5mg') },

  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 6041, imageUrl: upload('hf_20260714_151002_c2ae7330-24e7-4e79-ab0e-0aac7f2b5232-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('ss-31-10mg') },

  { productSlug: 'dihexa', mg: 10, priceCents: 7622, inStock: false, imageUrl: upload('hf_20260714_155729_f123f29d-426a-4303-9ab3-738ab9587626-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('dihexa-10mg') },
  { productSlug: 'dihexa', form: 'spray', mg: 10, priceCents: 11187, inStock: false, imageUrl: upload('hf_20260714_160047_d9b0bd2c-cc20-4df2-bf9b-d81f7a0fad60-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('dihexa-mist') },

  { productSlug: 'dsip', mg: 5, priceCents: 4692, imageUrl: upload('hf_20260714_152946_9f9b47af-9fbd-4fb8-84ac-1482830ddf48-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('dsip-5mg') },
  { productSlug: 'dsip', form: 'spray', mg: 10, priceCents: 10068, imageUrl: upload('hf_20260714_160211_5a2b1fbe-16ce-4609-bc34-aba246dd6fb2-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('dsip-mist') },

  { productSlug: 'glutathione', mg: 600, priceCents: 4063, imageUrl: GLUTATHIONE_IMAGE, coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 6707, inStock: false, imageUrl: GLUTATHIONE_IMAGE, coaUrl: COA_PAGE, productUrl: product('glutathione') },

  { productSlug: 'ahk-cu', mg: 100, priceCents: 7831, imageUrl: upload('hf_20260714_155323_31325953-d355-4f10-837b-8a7658cb7e1d-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('ahk-cu-100mg') },

  { productSlug: 'melanotan-1', mg: 10, priceCents: 4692, imageUrl: upload('hf_20260714_161223_1a7c7465-758c-412f-8a13-86fe38492356-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('mt-1-10mg') },
  { productSlug: 'melanotan-1', form: 'spray', mg: 10, priceCents: 6712, imageUrl: upload('hf_20260714_160218_5591cc83-f768-43db-9543-d91f4b080720-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('mt-1-mist') },

  { productSlug: 'melanotan-2', mg: 10, priceCents: 5831, imageUrl: upload('hf_20260714_153946_4d432f0c-db72-4f23-a5f3-5a72cca87245-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('mt-2-10mg') },
  { productSlug: 'melanotan-2', form: 'spray', mg: 10, priceCents: 6712, imageUrl: upload('hf_20260714_160114_2f7058a9-d30c-4da5-80dd-a17d5d6cd454-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('mt-2-mist') },

  { productSlug: 'glow', mg: 70, priceCents: 8087, imageUrl: upload('hf_20260714_154054_39938fa1-37c6-4b8d-b67a-4da1cca8b228-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('glow-70mg') },
  { productSlug: 'klow', mg: 80, priceCents: 9662, imageUrl: upload('hf_20260714_153430_9ec77cc6-ab71-4e7b-8f67-77a044605679-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('klow-80mg') },

  { productSlug: 'bacteriostatic-water', mg: 3, priceCents: 1220, imageUrl: upload('hf_20260714_154500_2a02a036-c535-4590-a814-78d8398300d5-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('reconstitution-solution-3ml') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 2805, imageUrl: upload('hf_20260714_154504_aeab85d1-cac4-4f75-b721-a01b25bbf218-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('bac-water-10ml') },
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 4577, imageUrl: upload('hf_20260714_154906_c9785153-ebab-4c1e-bfc0-40d04f818495-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('bac-water-30ml') },

  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 7114, imageUrl: IPA_CJC_IMAGE, coaUrl: COA_PAGE, productUrl: product('cjc-1295-wo-dac-ipamorelin') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 20, priceCents: 14238, imageUrl: IPA_CJC_IMAGE, coaUrl: COA_PAGE, productUrl: product('cjc-1295-wo-dac-ipamorelin') },

  { productSlug: 'wolverine', mg: 10, priceCents: 8645, inStock: false, imageUrl: upload('hf_20260714_154018_31276dbe-1cd8-4f15-a1dc-c2e26d23ee98-765x1024.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-10mg') },
];

runSeed({ supplierSlug: 'neurolabs-research', listings });
