// Adds Renova Peptides' product listings, as supplied from renovapeptides.net, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://renovapeptides.net/wp-content/uploads/${path}`;
const product = (path) => `https://renovapeptides.net/product/${path}/?ref=peplookup`;
// The same general certificates page was supplied for every listing.
const COA_PAGE = 'https://renovapeptides.net/certificates/';

/**
 * The vendor sells several sizes on one product page with one photo, so each size is
 * [mg, priceCents] on a shared entry. `count` is vials in the pack (10 for the vendor's
 * kits, where `mg` is each vial's size and the price covers all of them).
 */
const sizes = (productSlug, { image, path, count = 1, inStock = true }, sizeList) =>
  sizeList.map(([mg, priceCents]) => ({
    productSlug,
    mg,
    count,
    inStock,
    priceCents,
    imageUrl: upload(image),
    coaUrl: COA_PAGE,
    productUrl: product(path),
  }));

// Sizes in mg (a blend's total per vial).
const listings = [
  // Single vials.
  ...sizes('bpc-157-tb-500', { image: '2025/07/BPC-TB.png', path: 'bpc-157-tb-500-10mg' }, [[10, 3000]]),
  ...sizes('bpc-157-tb-500', { image: '2025/07/BPC-TB.png', path: 'bpc-157-tb-500-20mg' }, [[20, 4500]]),
  // Both sizes were supplied with the 10 mg product page.
  ...sizes('ipamorelin-cjc-1295-no-dac', { image: '2026/08/CJC-and-IPA.png', path: 'cjc-ipamorelin-no-dac-10mg' }, [
    [10, 2600], [20, 4400],
  ]),
  ...sizes('ghk-cu', { image: '2026/05/GHKCU.png', path: 'ghk-cu-2' }, [[100, 1800]]),
  ...sizes('glow-ghk-cu-bpc-157-tb-500', { image: '2025/07/GLOW.png', path: 'glow-2' }, [[70, 4900]]),
  ...sizes('glutathione', { image: '2026/08/Glutathione-768x1024.png', path: 'glutathione' }, [[1500, 2800]]),
  ...sizes('klow-bpc-157-tb-500-kpv-ghk-cu', { image: '2026/05/KLOW.png', path: 'klow' }, [[80, 5625]]),
  ...sizes('mots-c', { image: '2025/07/Mots-C-768x1024.png', path: 'mots-c-2', inStock: false }, [[10, 2800]]),
  ...sizes('nad', { image: '2025/07/NAD-768x1024.png', path: 'nad-2' }, [[500, 3900]]),
  ...sizes('retatrutide', { image: '2026/04/RT3.png', path: 'rt-3' }, [
    [10, 3300], [12, 3800], [15, 4200], [20, 4900], [30, 7000], [40, 9900], [50, 11000], [60, 12400], [70, 17250],
  ]),
  ...sizes('tirzepatide', { image: '2026/04/6CC1AD54-CF1F-4656-8EBA-0A3EBC6B5621-768x1024.png', path: 'trz-2' }, [
    [30, 4800], [40, 6300], [60, 8600],
  ]),
  ...sizes('tesamorelin', { image: '2026/05/Tesamorelin.png', path: 'tesamorelin-2' }, [[10, 4900], [20, 6900]]),
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, sizes in mL on
  // the same scale the admin form uses for mL sizes.
  ...sizes('bacteriostatic-water', { image: '2025/07/BAC-Water.png', path: 'bac-water-10ml' }, [[10, 1400]]),
  ...sizes('bacteriostatic-water', { image: '2025/07/BAC-Water.png', path: 'bacteriostatic-water-30ml' }, [[30, 2500]]),

  // 10-vial kits.
  // 5 mg + 5 mg per vial.
  ...sizes('bpc-157-tb-500', { image: '2025/07/BPC-TB-Kit.png', path: 'bpc-5mg-tb-5mg', count: 10 }, [[10, 39000]]),
  ...sizes('bpc-157-tb-500', { image: '2025/07/BPC-TB-Kit.png', path: 'bpc-157-tb-500-20mg-2', count: 10 }, [[20, 42900]]),
  ...sizes('tesamorelin', { image: '2026/05/Tesamorelin.png', path: 'tesamorelin', count: 10 }, [[10, 40000], [20, 59900]]),
  ...sizes('tirzepatide', { image: '2025/06/TZ-kit.png', path: 'tirzepatide', count: 10 }, [
    [10, 24000], [30, 45000], [40, 62500], [60, 65000],
  ]),
  ...sizes('glow-ghk-cu-bpc-157-tb-500', { image: '2025/07/GLOW-kit.png', path: 'glow', count: 10 }, [[70, 60000]]),
  ...sizes('ghk-cu', { image: '2025/07/GHKCU-kit.png', path: 'ghk', count: 10 }, [[100, 13750]]),
  ...sizes('klow-bpc-157-tb-500-kpv-ghk-cu', { image: '2025/07/Klow-kit.png', path: 'klow-80mg', count: 10 }, [[80, 65000]]),
  ...sizes('mots-c', { image: '2025/07/Mots-c-kit.png', path: 'mots-c', count: 10 }, [[10, 31200]]),
  ...sizes('nad', { image: '2025/07/NAD-kit-768x615.png', path: 'nad', count: 10 }, [[500, 34900]]),
  ...sizes('ipamorelin-cjc-1295-no-dac', { image: '2026/08/CJC-and-IPA.png', path: 'cjc-ipa-no-dac-10-vial-kit', count: 10 }, [
    [10, 24900], [20, 39900],
  ]),
  ...sizes('ss-31-elamipretide', { image: '2025/07/SS31-KIT-768x615.png', path: 'ss-31', count: 10 }, [[10, 22900]]),
  ...sizes('retatrutide', { image: '2025/07/90788775-8C57-44A7-9DCF-777FD1AB1351.png', path: 'retatrutide', count: 10 }, [
    [10, 31900], [12, 32500], [15, 40000], [20, 44900], [30, 75000], [40, 80000], [50, 85000], [60, 100000],
  ]),
];

runSeed({ supplierSlug: 'renova-peptides-2', listings });
