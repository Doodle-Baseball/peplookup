// Adds ZestyRat Research's product listings, as supplied from zestyratresearch.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// No COA links were supplied for any listing.
const { runSeed } = require('./lib/seed-vendor-offers');

const UPLOADS = 'https://zestyratresearch.com/wp-content/uploads/';
const product = (slug) => `https://zestyratresearch.com/product/${slug}/aff/570/`;

const listings = [
  { productSlug: '5-amino-1mq', mg: 5, priceCents: 3999, imageUrl: `${UPLOADS}2025/08/5-amino-1mq-768x768.png`, coaUrl: null, productUrl: product('5-amino-1mq-research-compound') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 12999, imageUrl: `${UPLOADS}2025/08/5-amino-1mq-768x768.png`, coaUrl: null, productUrl: product('5-amino-1mq-research-compound') },
  { productSlug: 'bpc-157', mg: 5, priceCents: 3499, imageUrl: `${UPLOADS}2025/08/BPC-157-768x768.png`, coaUrl: null, productUrl: product('bpc-157-pentadecapeptide') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 4999, imageUrl: `${UPLOADS}2025/08/BPC-5mgTB-5mg-768x768.png`, coaUrl: null, productUrl: product('bpc-157-tb-500-blend') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 9999, imageUrl: `${UPLOADS}2026/09/am833-acylated-peptide-v2-768x768.webp`, coaUrl: null, productUrl: product('cagrilintide-amylin-analog') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 5499, imageUrl: `${UPLOADS}2025/08/CJC-1295-768x768.png`, coaUrl: null, productUrl: product('cjc-1295-research-peptide') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 7599, imageUrl: `${UPLOADS}2025/08/CJC-1295-768x768.png`, coaUrl: null, productUrl: 'https://zestyratresearch.com/product/cjc-1295-whitout-dac-5mgipa-5mg-10mg/aff/570/' },
  { productSlug: 'dsip', mg: 10, priceCents: 4599, imageUrl: `${UPLOADS}2025/08/DSIP-768x768.png`, coaUrl: null, productUrl: product('dsip-delta-sleep-inducing-peptide-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3999, imageUrl: `${UPLOADS}2025/08/Epithalon-768x768.png`, coaUrl: null, productUrl: product('epithalon-epitalon-anti-aging-peptide') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3499, imageUrl: `${UPLOADS}2025/11/GHK-CU-768x768.png`, coaUrl: null, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'glutathione', mg: 600, priceCents: 2999, imageUrl: `${UPLOADS}2025/08/Glutathione-768x768.png`, coaUrl: null, productUrl: product('glutathione-antioxidant-600mg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 7999, imageUrl: `${UPLOADS}2026/09/acylated-glp1-analog-v2-768x768.webp`, coaUrl: null, productUrl: product('glp-1-agonist') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 15999, imageUrl: `${UPLOADS}2026/09/acylated-glp1-analog-v2-768x768.webp`, coaUrl: null, productUrl: product('glp-1-agonist') },
  { productSlug: 'semaglutide', mg: 30, priceCents: 21999, imageUrl: `${UPLOADS}2026/09/acylated-glp1-analog-v2-768x768.webp`, coaUrl: null, productUrl: product('glp-1-agonist') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 5999, imageUrl: `${UPLOADS}2026/09/dual-incretin-analog-39aa-v2-768x768.webp`, coaUrl: null, productUrl: product('glp2-dual-gip-glp-1-agonist') },
  { productSlug: 'tirzepatide', mg: 20, priceCents: 9999, imageUrl: `${UPLOADS}2026/09/dual-incretin-analog-39aa-v2-768x768.webp`, coaUrl: null, productUrl: product('glp2-dual-gip-glp-1-agonist') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 13999, imageUrl: `${UPLOADS}2026/09/dual-incretin-analog-39aa-v2-768x768.webp`, coaUrl: null, productUrl: product('glp2-dual-gip-glp-1-agonist') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 8999, imageUrl: `${UPLOADS}2026/09/tri-receptor-agonist-39aa-v2-768x768.webp`, coaUrl: null, productUrl: product('glp3-glp-1-gip-glucagon-triple-agonist') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 17999, imageUrl: `${UPLOADS}2026/09/tri-receptor-agonist-39aa-v2-768x768.webp`, coaUrl: null, productUrl: product('glp3-glp-1-gip-glucagon-triple-agonist') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 24999, imageUrl: `${UPLOADS}2026/09/tri-receptor-agonist-39aa-v2-768x768.webp`, coaUrl: null, productUrl: product('glp3-glp-1-gip-glucagon-triple-agonist') },
  { productSlug: 'mots-c', mg: 10, priceCents: 5999, imageUrl: `${UPLOADS}2025/08/MOTS-C-768x768.png`, coaUrl: null, productUrl: product('mots-c-mitochondrial-peptide') },
  { productSlug: 'mots-c', mg: 20, priceCents: 7999, imageUrl: `${UPLOADS}2025/08/MOTS-C-768x768.png`, coaUrl: null, productUrl: product('mots-c-mitochondrial-peptide') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 3599, imageUrl: `${UPLOADS}2025/08/MT-1-768x768.png`, coaUrl: null, productUrl: product('mt-1-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3999, imageUrl: `${UPLOADS}2026/09/mt-ii-cyclic-heptapeptide-v2-768x768.webp`, coaUrl: null, productUrl: product('mt-ii-10mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 9599, imageUrl: `${UPLOADS}2025/08/NAD.png`, coaUrl: null, productUrl: product('nad-nicotinamide-adenine-dinucleotide-1000mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 5999, imageUrl: `${UPLOADS}2026/09/pt-141-cyclic-heptapeptide-v2-768x768.webp`, coaUrl: null, productUrl: product('pt-141-bremelanotide-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 4999, imageUrl: `${UPLOADS}2026/09/ss-31-tetrapeptide-v2-768x768.webp`, coaUrl: null, productUrl: product('ss-31-mitochondrial-peptide-10mg') },
  { productSlug: 'tb-500', mg: 5, priceCents: 3599, imageUrl: `${UPLOADS}2025/08/TB-500-768x768.png`, coaUrl: null, productUrl: product('tb-500-thymosin-beta-4') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 9999, imageUrl: `${UPLOADS}2025/08/TB-BPC-GHK-768x768.png`, coaUrl: null, productUrl: product('tb-500-bpc-157-ghk-cu-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 11999, imageUrl: `${UPLOADS}2025/08/KLOW80-768x768.png`, coaUrl: null, productUrl: product('klowtbbpcghkvip-blend-80mg') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 4999, imageUrl: `${UPLOADS}2026/09/th9507-ghrh-analog-v2-768x768.webp`, coaUrl: null, productUrl: product('tesamorelin-5mg') },
  { productSlug: 'selank', mg: 10, priceCents: 4599, imageUrl: `${UPLOADS}2026/09/tp-7-heptapeptide-v2-768x768.webp`, coaUrl: null, productUrl: product('selank-nootropic-peptide-10mg') },
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 1299, imageUrl: `${UPLOADS}2025/08/Bac-Water-768x768.webp`, coaUrl: null, productUrl: product('bacteriostatic-water-10ml') },
];

runSeed({ supplierSlug: 'zestyrat-research-2', listings });
