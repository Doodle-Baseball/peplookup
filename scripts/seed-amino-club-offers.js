// Adds Amino Club's product listings, as supplied from aminoclub.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// The vendor serves product photos through its Next.js image route; a few are
// on other deployments, so the deployment id is part of each photo URL.
const DPL_A = 'dpl_AvDqEZVNq6jj47XRitvXTR3BWbY7';
const DPL_B = 'dpl_5M8uEd537F3xJ48CnQ7JoSv9LdjQ';
const DPL_C = 'dpl_BAFMmWxHV9njZk2sXLfNFFec6V3V';
const photo = (dpl, file) =>
  `https://www.aminoclub.com/_next/image?dpl=${dpl}&q=75&url=%2Fapi%2Fimages%2Fs3.us-east-1.amazonaws.com%2Fmedusajs.cloud-data-prod-use1-20241127093450366600000001%2Fe432a7e0149b9f2bd6e%252F${file}&w=640`;
const product = (path) => `https://www.aminoclub.com/us/products/${path}?utm_source=affiliate_marketing&code=PRODUCTS`;
// The same general COA page was supplied for every listing.
const COA_PAGE = 'https://www.aminoclub.com/us/coa';

// Prices in integer cents, sizes in mg (a blend's total; a spray's peptide content).
// inStock: false where the listing was supplied as out of stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 2599, imageUrl: photo(DPL_A, 'BPC-157-01KDVES8F3JTW5T4Z0P87QXEE5.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157') },
  { productSlug: 'bpc-157', form: 'spray', mg: 15, priceCents: 3899, inStock: false, imageUrl: photo(DPL_A, 'BPC-157-1-01KZ9CJ7R2ECEK293MF5SVY3WJ.png'), coaUrl: COA_PAGE, productUrl: product('bpc-157-spray') },
  { productSlug: 'tb-500', mg: 10, priceCents: 2599, imageUrl: photo(DPL_A, 'TB-500-01KE3XSXFW99CZ6NK9P13B7MP5.png'), coaUrl: COA_PAGE, productUrl: product('tb-500') },
  // The same Wolverine stack listings, supplied under both the BPC-157 + TB-500 and Wolverine compounds.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 5199, imageUrl: photo(DPL_A, 'Wolverine-01KFY44VD9J4TXVKAX65RFC9RE.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-stack') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 7499, imageUrl: photo(DPL_A, 'Wolverine-01KFY44VD9J4TXVKAX65RFC9RE.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-stack') },
  { productSlug: 'wolverine', mg: 10, priceCents: 5199, imageUrl: photo(DPL_A, 'Wolverine-01KFY44VD9J4TXVKAX65RFC9RE.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-stack') },
  { productSlug: 'wolverine', mg: 20, priceCents: 7499, imageUrl: photo(DPL_A, 'Wolverine-01KFY44VD9J4TXVKAX65RFC9RE.png'), coaUrl: COA_PAGE, productUrl: product('wolverine-stack') },
  { productSlug: 'bpc-157-tb-500', form: 'spray', mg: 30, priceCents: 6499, inStock: false, imageUrl: photo(DPL_A, 'TB-500-1-01KZ9CYQEC9XZC7WK811A7RWEA.png'), coaUrl: COA_PAGE, productUrl: product('bpc-tb-spray') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 1949, imageUrl: photo(DPL_A, 'GHK-Cu-01KE3T0CT617E7XBMTVZ7SV5EZ.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 3769, imageUrl: photo(DPL_A, 'GHK-Cu-01KE3T0CT617E7XBMTVZ7SV5EZ.png'), coaUrl: COA_PAGE, productUrl: product('ghk-cu') },
  { productSlug: 'ghk-cu', form: 'spray', mg: 25, priceCents: 2499, imageUrl: photo(DPL_A, 'GHK-Cu-1-01KWD05ZD39D34PPTY0QSPG6C0.png'), coaUrl: COA_PAGE, productUrl: product('ghkcu-spray') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 4549, imageUrl: photo(DPL_A, 'GLP-3-MainProductImage-01KDV23PTYN489GSK7E4P7GCK9.png'), coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 8774, imageUrl: photo(DPL_A, 'GLP-3-MainProductImage-01KDV23PTYN489GSK7E4P7GCK9.png'), coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 12999, imageUrl: photo(DPL_A, 'GLP-3-MainProductImage-01KDV23PTYN489GSK7E4P7GCK9.png'), coaUrl: COA_PAGE, productUrl: product('glp-3') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 3899, imageUrl: photo(DPL_A, 'GLP-2%2520%28TR%29-1-01KYMPTH1H044T61C3JPAR1EK5.png'), coaUrl: COA_PAGE, productUrl: product('glp-2') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 7149, imageUrl: photo(DPL_A, 'GLP-2%2520%28TR%29-1-01KYMPTH1H044T61C3JPAR1EK5.png'), coaUrl: COA_PAGE, productUrl: product('glp-2') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 3249, imageUrl: photo(DPL_A, 'GLP-1%2520%28SM%29-1-01KYMQPHK2ZB3W93N3JDBKPHQ6.png'), coaUrl: COA_PAGE, productUrl: product('glp-1') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 4549, imageUrl: photo(DPL_A, 'CAGRILINTIDE-01KGXQJ21TA47NXY6ESQS5PAHP.png'), coaUrl: COA_PAGE, productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 3249, imageUrl: photo(DPL_A, 'IPAMORELIN-01KG62P25SJFEBF78SC47VRPWS.png'), coaUrl: COA_PAGE, productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 4549, imageUrl: photo(DPL_A, 'Tesamorelin-01KE3X89JARVGZGRZC8EK6FTMA.png'), coaUrl: COA_PAGE, productUrl: product('tesamorlin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 2999, imageUrl: photo(DPL_B, 'SERMORELIN-1-01KYJ2YTJP18EQRRM4D39EDEWH.png'), coaUrl: COA_PAGE, productUrl: product('sermorelin') },
  { productSlug: 'nad', mg: 500, priceCents: 4549, imageUrl: photo(DPL_A, 'NAD%2520%252B-01KE3YXV5GV94HR9BYD5D7YJGA.png'), coaUrl: COA_PAGE, productUrl: product('nad-plus') },
  { productSlug: 'nad', form: 'spray', mg: 750, priceCents: 3249, imageUrl: photo(DPL_B, 'NAD%252B-1-01KWCZ62WSGT0MM2M6QM6NVP1X.png'), coaUrl: COA_PAGE, productUrl: product('nad-plus-spray') },
  { productSlug: 'mots-c', mg: 10, priceCents: 2599, imageUrl: photo(DPL_A, 'MOTS-C-01KE3ZWA92VS303F14994Y066P.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 8774, imageUrl: photo(DPL_A, 'MOTS-C-01KE3ZWA92VS303F14994Y066P.png'), coaUrl: COA_PAGE, productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 1949, imageUrl: photo(DPL_B, 'Epithalon-01KHTD4PEAEX09537J73DHCJ8J.png'), coaUrl: COA_PAGE, productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 1947, imageUrl: photo(DPL_A, 'SEMAX-01KG49DV7GCMG9NPT7FATKZB0X.png'), coaUrl: COA_PAGE, productUrl: product('semax') },
  // 25 mg in 15 mL.
  { productSlug: 'semax', form: 'spray', mg: 25, priceCents: 3899, imageUrl: photo(DPL_A, 'SEMAX-1-01KWD072RVBE5S0MH8CF3YSY0E.png'), coaUrl: COA_PAGE, productUrl: product('semax-spray') },
  { productSlug: 'selank', mg: 10, priceCents: 1947, imageUrl: photo(DPL_A, 'SELANK-01KG49W1ZH9QH1ZWYZCD0330V9.png'), coaUrl: COA_PAGE, productUrl: product('selank') },
  // 20 mg in 15 mL.
  { productSlug: 'selank', form: 'spray', mg: 20, priceCents: 3899, imageUrl: photo(DPL_C, 'SELANK-1-01KWD07VSHEX7VVZMB5D846SBR.png'), coaUrl: COA_PAGE, productUrl: product('selank-spray') },
  { productSlug: 'pt-141', mg: 10, priceCents: 1949, imageUrl: photo(DPL_B, 'PT-141-01KG4ASVRST158DHTNC341VQFX.png'), coaUrl: COA_PAGE, productUrl: product('pt-141') },
  // 15 mg in 15 mL.
  { productSlug: 'pt-141', form: 'spray', mg: 15, priceCents: 3574, inStock: false, imageUrl: photo(DPL_B, 'PT%2520-%2520141-01KWD05DDSBR9BE0C63YZ94HTY.png'), coaUrl: COA_PAGE, productUrl: product('pt-141-spray') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 3249, imageUrl: photo(DPL_A, '5-AMINO%2520-1MQ-01KHTDTHAJKWMKQ9M8Q1FFEP62.png'), coaUrl: COA_PAGE, productUrl: product('5-amino-1mq') },
  { productSlug: 'dihexa', mg: 10, priceCents: 2999, imageUrl: photo(DPL_B, 'DIHEXA-1-01KYJ385MQM0GW2P1TQT4AABG9.png'), coaUrl: COA_PAGE, productUrl: product('dihexa') },
  { productSlug: 'dsip', mg: 5, priceCents: 1949, imageUrl: photo(DPL_B, 'DSIP-01KE43BF19532KM65G2F4A0JJ0.png'), coaUrl: COA_PAGE, productUrl: product('dsip') },
  // 15 mg in 15 mL.
  { productSlug: 'dsip', form: 'spray', mg: 15, priceCents: 3899, imageUrl: photo(DPL_B, 'DSIP-1-01KZEECGGN9A8MA3K1KK6047AB.png'), coaUrl: COA_PAGE, productUrl: product('dsip-spray') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 3899, imageUrl: photo(DPL_A, 'GLUTATHIONE-01KG62AW8WTK7CYQFFAYRGQV7S.png'), coaUrl: COA_PAGE, productUrl: product('glutathione') },
  { productSlug: 'melanotan-i', mg: 10, priceCents: 1947, imageUrl: photo(DPL_A, 'MELANOTAN%2520_-01KKR02YMXG2RFC3FJBY9HEV4P.png'), coaUrl: COA_PAGE, productUrl: product('melanotan-i') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 1497, imageUrl: photo(DPL_B, 'Melanotan%2520II-01KE3Y4EBVMD7ZM4DSBF40Y0GV.png'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii') },
  // 15 mg in 15 mL.
  { productSlug: 'melanotan-2', form: 'spray', mg: 15, priceCents: 3899, inStock: false, imageUrl: photo(DPL_A, 'MELANOTAN%2520II-1-01KZEESW762PYT36F8HKHN8PTT.png'), coaUrl: COA_PAGE, productUrl: product('melanotan-ii-spray') },
  { productSlug: 'ahk-cu', mg: 50, priceCents: 2274, inStock: false, imageUrl: photo(DPL_A, 'AHK-Cu-2-01KZ4HZ4X1WHRFNCJD3DQ8CRGG.png'), coaUrl: COA_PAGE, productUrl: product('ahk-cu') },
  // The CJC-1295 / Ipamorelin (No DAC) listing, supplied under both the CJC-1295 (No DAC) and the blend compounds.
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 3899, imageUrl: photo(DPL_A, 'Ipamorelin-01KE40M6Y9ZWRTGZJXK0GZXP6K.png'), coaUrl: COA_PAGE, productUrl: product('cjc-ipa-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 3899, imageUrl: photo(DPL_A, 'Ipamorelin-01KE40M6Y9ZWRTGZJXK0GZXP6K.png'), coaUrl: COA_PAGE, productUrl: product('cjc-ipa-no-dac') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 5849, imageUrl: photo(DPL_A, 'GLOW-01KE430RMQSPFA17YCBFP9YEQC.png'), coaUrl: COA_PAGE, productUrl: product('glow') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 6499, imageUrl: photo(DPL_A, 'KLOW-01KG4A2YW406AG6CVHE80M28W6.png'), coaUrl: COA_PAGE, productUrl: product('klow') },
];

runSeed({ supplierSlug: 'amino-club-2', listings });
