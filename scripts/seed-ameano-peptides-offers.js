// Adds Ameano Peptides' product listings, as supplied from ameanopeptides.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos and test reports are both WordPress uploads.
const upload = (path) => `https://ameanopeptides.com/wp-content/uploads/${path}`;
const product = (path) => `https://ameanopeptides.com/product/${path}/?ref=PEPLOOKUP`;

// Prices in integer cents, sizes in mg (a blend's total). coaUrl is null where no test report was supplied.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4400, imageUrl: upload('2025/04/BPC-157-10mg.webp'), coaUrl: upload('2025/04/Test-Report-163728.png'), productUrl: product('bpc-157-10mg') },
  // 5 mg + 5 mg and 10 mg + 10 mg; the vendor lists one test report for both.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 5300, imageUrl: upload('2025/06/BPC-157-5mg-TB4-blend.webp'), coaUrl: upload('2025/06/Test-Report-163740.png'), productUrl: product('bpc-157-tb4-blend-5mg-5mg') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 8800, imageUrl: upload('2026/02/BPCTB4-10mg10mg.png'), coaUrl: upload('2025/06/Test-Report-163740.png'), productUrl: product('bpc-157-tb4-blend-10mg-10mg') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3500, imageUrl: upload('2025/05/GHK-Cu-50mg.webp'), coaUrl: upload('2025/05/Test-Report-167749-1.png'), productUrl: product('ghk-cu-50mg') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 5300, imageUrl: upload('2025/08/GHK-Cu-100mg.webp'), coaUrl: upload('2025/08/Test-Report-168796.png'), productUrl: product('ghk-cu-100mg') },
  { productSlug: 'retatrutide', mg: 6, priceCents: 9500, imageUrl: upload('2025/04/AMP-3P-6mg.webp'), coaUrl: upload('2025/04/Test-Report-163746.png'), productUrl: product('retatrutide-6mg') },
  { productSlug: 'retatrutide', mg: 24, priceCents: 16000, imageUrl: upload('2025/04/AMP-3P-24mg.webp'), coaUrl: upload('2025/04/Test-Report-163746.png'), productUrl: product('retatrutide-24mg') },
  { productSlug: 'semaglutide', mg: 5, priceCents: 6400, imageUrl: upload('2025/04/AMP-1P-5mg.webp'), coaUrl: upload('2025/04/Test-Report-110979.png'), productUrl: product('amp-1p-5mg') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 4900, imageUrl: upload('2025/04/Cagrilintide-5mg-new.webp'), coaUrl: upload('2025/04/Test-Report-166062.png'), productUrl: product('cagrilintide-5mg') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 8800, imageUrl: upload('2026/02/Cagrilintide-10mg-AMP.png'), coaUrl: upload('2025/04/Test-Report-166062.png'), productUrl: product('cagrilintide-10mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4400, imageUrl: upload('2025/04/Ipamorelin-10mg-new.webp'), coaUrl: upload('2025/04/Test-Report-183198.png'), productUrl: product('ipamorelin-10mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 6800, imageUrl: upload('2025/04/Tesamorelin-10mg-new.webp'), coaUrl: upload('2025/04/Test-Report-134377.png'), productUrl: product('tesamorelin-10mg-research-peptide') },
  { productSlug: 'sermorelin', mg: 5, priceCents: 4400, imageUrl: upload('2025/05/Sermorelin-5mg-new.webp'), coaUrl: upload('2025/05/Test-Report-164163.png'), productUrl: product('sermorelin-5mg') },
  { productSlug: 'nad', mg: 500, priceCents: 6800, imageUrl: upload('2025/05/NAD-Buffered-New.webp'), coaUrl: upload('2025/05/Test-Report-198991.png'), productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 5400, imageUrl: upload('2025/04/MOTS-c-10mg-new.webp'), coaUrl: upload('2025/04/Test-Report-136295.png'), productUrl: product('mots-c-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3800, imageUrl: upload('2025/05/Epitalon-10mg-New.webp'), coaUrl: upload('2025/05/Test-Report-171643.png'), productUrl: product('epitalon-10mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 4400, imageUrl: upload('2025/04/PT-141-10mg-new.webp'), coaUrl: upload('2025/04/Test-Report-166068.png'), productUrl: product('pt-141-10mg-research-peptide') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 6800, imageUrl: upload('2025/09/5amino-50mg.webp'), coaUrl: upload('2025/09/Test-Report-149292.png'), productUrl: product('5-amino-1mq-50mg') },
  { productSlug: 'dsip', mg: 10, priceCents: 5800, imageUrl: upload('2025/05/DSIP-10MG.webp'), coaUrl: null, productUrl: product('dsip-10mg') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 4400, imageUrl: upload('2025/05/Melanotan-I-10mg-new.webp'), coaUrl: upload('2025/05/Test-Report-164161.png'), productUrl: product('melanotan-i-10mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 4400, imageUrl: upload('2025/05/Melanotan-II-10mg-new.webp'), coaUrl: upload('2025/05/Test-Report-194688.png'), productUrl: product('melanotan-ii-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3800, imageUrl: upload('2025/05/CJC-1295-No-DAC-5mg-new.webp'), coaUrl: upload('2025/05/Test-Report-168784.png'), productUrl: product('cjc-1295-no-dac-5mg') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 5300, imageUrl: upload('2025/06/pf-sCJC-no-DAC-Ipamorelin-Blend.webp'), coaUrl: null, productUrl: product('cjc-no-dac-ipamorelin-blend-5mg-5mg') },
  // 10 mg BPC-157 + 10 mg TB-500 + 50 mg GHK-Cu.
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 8800, imageUrl: upload('2025/04/Glow-Blend-50mg.webp'), coaUrl: upload('2025/04/Test-Report-163743.png'), productUrl: product('glow-blend-10mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 9800, imageUrl: upload('2025/06/Klow-Blend-80mg.webp'), coaUrl: upload('2025/06/Test-Report-163737.png'), productUrl: product('klow-blend-80mg-research-peptide') },
];

runSeed({ supplierSlug: 'ameano-peptides-2', listings });
