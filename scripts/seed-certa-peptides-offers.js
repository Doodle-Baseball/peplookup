// Adds Certa Peptides' product listings, as supplied from certapeptides.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor serves product photos through its Next.js image route.
const photo = (file) =>
  `https://certapeptides.com/_next/image?q=75&url=https%3A%2F%2Fadmin.certapeptides.com%2Fwp-content%2Fuploads%2F2026%2F07%2F${file}&w=640`;
// Every listing links a Janoshik test report.
const janoshik = (test) => `https://verify.janoshik.com/tests/${test}`;
const product = (path) => `https://certapeptides.com/shop/${path}?ref=AFF-ADAM`;

/**
 * The vendor sells most compounds in several sizes on one product page with one
 * photo and one test report, so each size is [mg, priceCents] on a shared entry.
 */
const sizes = (productSlug, { image, test, path }, sizeList) =>
  sizeList.map(([mg, priceCents]) => ({
    productSlug,
    mg,
    priceCents,
    imageUrl: photo(image),
    coaUrl: janoshik(test),
    productUrl: product(path),
  }));

// Sizes in mg (a blend's total). Every listing was supplied as in stock.
const listings = [
  ...sizes('retatrutide', { image: 'retatrutide.jpg', test: '212146-Retatrutide_20mg_TSIS765B8HAH', path: 'retatrutide' }, [
    [5, 5134], [10, 8077], [15, 10904], [20, 13731], [30, 20540], [50, 31849],
  ]),
  ...sizes('bpc-157', { image: 'bpc-157.jpg', test: '200860-BPC157_20mg_G6T6AXH34XVS', path: 'bpc-157' }, [
    [2, 2307], [5, 5076], [10, 9000], [20, 12693],
  ]),
  // The test report supplied for TB-500 is the vendor's BPC-157 + TB-500 blend report.
  ...sizes('tb-500', { image: 'tb-500.jpg', test: '136729-BPC157_TB500_10mg_Z389R9WPGKD7', path: 'tb-500' }, [
    [2, 3634], [5, 5134], [10, 9808], [20, 18867],
  ]),
  ...sizes('bpc-157-tb-500', { image: 'bpc-157-tb-500-blend.jpg', test: '136729-BPC157_TB500_10mg_Z389R9WPGKD7', path: 'bpc-157-tb-500-blend' }, [
    [10, 8308],
  ]),
  ...sizes('ghk-cu', { image: 'ghk-cu.jpg', test: '212150-GHKCu_100mg_D3CDH5Q9BKW7', path: 'ghk-cu' }, [
    [50, 4615], [100, 8077],
  ]),
  ...sizes('mots-c', { image: 'mots-c.jpg', test: '204783-MOTSc_40mg_6IS4MX16ZVD5', path: 'mots-c' }, [
    [10, 4846], [40, 11943],
  ]),
  ...sizes('ipamorelin', { image: 'ipamorelin.jpg', test: '212161-Ipamorelin_5mg_9YXTYJ15NUFI', path: 'ipamorelin' }, [
    [2, 2768], [5, 3922], [10, 7615],
  ]),
  ...sizes('tesamorelin', { image: 'tesamorelin.jpg', test: '212154-Tesamorelin_10mg_NNBYCKYCYEK4', path: 'tesamorelin' }, [
    [2, 2653], [5, 5019], [10, 9577], [20, 17078],
  ]),
  ...sizes('cjc-1295-no-dac', { image: 'cjc-1295-without-dac.jpg', test: '212158-CJC1295_no_DAC_2mg_IZYTXVWA9K3D', path: 'cjc-1295-without-dac' }, [
    [2, 3461], [5, 5538], [10, 8308],
  ]),
  ...sizes('ipamorelin-cjc-1295-no-dac', { image: 'cjc-1295-ipamorelin-blend.jpg', test: '155228-CJC1295_without_DAC_Mod_GRF_129_Ipamorelin_5mg_Blend_EBQMYVYQR4WN', path: 'cjc-1295-ipamorelin-blend' }, [
    [10, 7904], [20, 12462],
  ]),
  ...sizes('epitalon', { image: 'epitalon-50mg.jpg', test: '212160-Epithalon_50mg_TYNHBXD8FM9R', path: 'epitalon-50mg' }, [
    [10, 3807], [40, 10385], [50, 12693],
  ]),
  ...sizes('semax', { image: 'semax.jpg', test: '212155-Semax_10mg_F48S54Y1HAYQ', path: 'semax' }, [
    [5, 3461], [10, 4615], [30, 12693],
  ]),
  ...sizes('selank', { image: 'selank.jpg', test: '123935-Selank_10mg_3N5W5GFN9ZJ9', path: 'selank' }, [
    [5, 3461], [10, 4615], [30, 12693],
  ]),
  ...sizes('ss-31-elamipretide', { image: 'ss-31.jpg', test: '212156-SS31_10mg_BFI6XX5CYX13', path: 'ss-31' }, [
    [10, 5538], [50, 15809],
  ]),
  ...sizes('glutathione', { image: 'glutathione-1500mg.jpg', test: '212164-Glutathione_1500mg_W5WFGN6ETCD9', path: 'glutathione-1500mg' }, [
    [1500, 5019],
  ]),
  ...sizes('pt-141', { image: 'pt-141-10mg.jpg', test: '212166-PT141_10mg_XWU9H99WKYP1', path: 'pt-141-10mg' }, [
    [10, 4846],
  ]),
  ...sizes('melanotan-i', { image: 'mt-1-10mg.jpg', test: '212162-Melanotan1_10mg_U7VIFC5IY9YV', path: 'mt-1-10mg' }, [
    [10, 3230],
  ]),
  ...sizes('melanotan-2', { image: 'mt-2-melanotan-2-acetate.jpg', test: '155231-MT2_Melanotan_2_Acetate_10mg_52IY2XTLW8J4', path: 'mt-2-melanotan-2-acetate' }, [
    [5, 2884], [10, 4038],
  ]),
  ...sizes('glow-ghk-cu-bpc-157-tb-500', { image: 'tissue-research-blend-bpc-157-ghk-cu-tb-500-70mg.jpg', test: '136730-GLOW_GHK_or_GHKCu_TB500_BPC157_70mg_7A73FMWNNBXP', path: 'tissue-research-blend-bpc-157-ghk-cu-tb-500-70mg' }, [
    [70, 11770],
  ]),
  ...sizes('klow-bpc-157-tb-500-kpv-ghk-cu', { image: 'klow-blend-bpc-157-ghk-cu-tb-500-kpv-80mg.jpg', test: '172225-KLOW_80mg_GHKCu_TB500_BPC157_KPV_W34FXTSZG3Z4', path: 'klow-blend-bpc-157-ghk-cu-tb-500-kpv-80mg' }, [
    [80, 14424],
  ]),
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, sizes in mL on
  // the same scale the admin form uses for mL sizes.
  ...sizes('bacteriostatic-water', { image: 'bacteriostatic-water.jpg', test: '155229-Bacteriostatic_Water_10ml_H63R5HRGK5XG', path: 'bacteriostatic-water' }, [
    [3, 691], [5, 922], [10, 1153],
  ]),
];

runSeed({ supplierSlug: 'certa-peptides-2', listings });
