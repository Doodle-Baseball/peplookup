// Adds Synthesis Peptides' product listings, as supplied from synthesispeptides.co,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos and COA PDFs are both served from the vendor's Medusa S3 bucket.
const file = (name) =>
  `https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/ef0525899c1be447f2e/${name}`;
const product = (path) => `https://synthesispeptides.co/products/${path}?synthaff=PEPLOOKUP`;

// Prices in integer cents, sizes in mg (a blend's total).
// inStock: false where the listing was supplied as out of stock.
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4999, imageUrl: file('BPC-157_10mg-01KXEB2XA774QY277VBR1K8VQT.png'), coaUrl: file('BPC-157%2010mg--SYNT2607220092-01KZW2A307M8N1NXDQHTXRJHBF.pdf'), productUrl: product('bpc-157') },
  { productSlug: 'tb-500', mg: 10, priceCents: 7499, imageUrl: file('TB-500_10mg-01KX40VZ7368DH9TXHNEANKS8X.png'), coaUrl: file('TB-500-10mg-TB10926---SYNT2608110689-01M0GPPQN037NYJ03XJS95NMZ1.pdf'), productUrl: product('tb-500') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 6499, imageUrl: file('BPC-157_TB500_20mg-01KXGSKJ4FK9422S2XJTGF9J33.png'), coaUrl: file('Wolverine-Blend-10mg-WOLV20926---SYNT2608110759-01M0GPPRAE8KRXHQM7PCGJ80WC.pdf'), productUrl: product('bpc-157-tb-500') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 9999, imageUrl: file('BPC-157_TB500_20mg-01KXGSKJ4FK9422S2XJTGF9J33.png'), coaUrl: file('Wolverine-Blend-10mg-WOLV20926---SYNT2608110759-01M0GPPRAE8KRXHQM7PCGJ80WC.pdf'), productUrl: product('bpc-157-tb-500') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3699, imageUrl: file('GHK-Cu_50mg-01KX3ZE3HBED9FESPM7Q7SNYTC.png'), coaUrl: file('GHK-Cu_GHK50626_COA-01M1PKMS5W9WAXGKHXA3MPNT51.pdf'), productUrl: product('ghk-cu') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 8999, imageUrl: file('SYN-3RT_5mg-01M0G24YXTRZ4VCFZ7B6T2YWHF.png'), coaUrl: file('Retatrutide-10mg-3GR10926---SYNT2608110724-01M0GPPS06CNFHV2PYHJJARCTE.pdf'), productUrl: product('syn-3rt') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 13999, imageUrl: file('SYN-3RT_5mg-01M0G24YXTRZ4VCFZ7B6T2YWHF.png'), coaUrl: file('Retatrutide-10mg-3GR10926---SYNT2608110724-01M0GPPS06CNFHV2PYHJJARCTE.pdf'), productUrl: product('syn-3rt') },
  { productSlug: 'retatrutide', mg: 40, priceCents: 22999, imageUrl: file('SYN-3RT_5mg-01M0G24YXTRZ4VCFZ7B6T2YWHF.png'), coaUrl: file('Retatrutide-10mg-3GR10926---SYNT2608110724-01M0GPPS06CNFHV2PYHJJARCTE.pdf'), productUrl: product('syn-3rt') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 5999, imageUrl: file('SYN-2TZ_10mg-01M0G4CNMD9GHXT4R9QJBN07DZ.png'), coaUrl: file('glp-2t-2026-05-08-23-01KXSEYRGS7Z1ZGYSJ7ABV2R9Z.pdf'), productUrl: product('syn-2tz') },
  { productSlug: 'tirzepatide', mg: 15, priceCents: 7999, imageUrl: file('SYN-2TZ_10mg-01M0G4CNMD9GHXT4R9QJBN07DZ.png'), coaUrl: file('glp-2t-2026-05-08-23-01KXSEYRGS7Z1ZGYSJ7ABV2R9Z.pdf'), productUrl: product('syn-2tz') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 7299, imageUrl: file('SYN-1SG_10mg-01M0G2QEP6KH8FFTD72HNSKMQW.png'), coaUrl: file('Semaglutide%2010mg--SYNT2607220008-01KZW2A1Z0D2MR0CTXAZHBEND2.pdf'), productUrl: product('syn-1sg') },
  { productSlug: 'cagrilintide', mg: 5, priceCents: 6299, inStock: false, imageUrl: file('Cagrilintide_5mg-01KX4CET4P0ZTZKFQ3C9P1GJYW.png'), coaUrl: file('cagrilintide-amylin-analogue-2025-09-12-9-01KXSEYMHQTS0YG7Q8SFT1DBWM.pdf'), productUrl: product('cagrilintide') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 6499, imageUrl: file('Ipamorelin_10mg-2-01KX462873WHHRNK8MG4Y4WS0G.png'), coaUrl: file('ipamorelin-2026-05-08-38-01KXSEYX1YP21YT48SJK3A187Y.pdf'), productUrl: product('ipamorelin') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7999, imageUrl: file('Tesamorelin_10mg-01KX442T8CN2YJT81RVS64RW52.png'), coaUrl: file('tesamorelin-2026-05-20-77-01KXSEZ86CPY6YAKMK5EA3VMBD.pdf'), productUrl: product('tesamorelin') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 7499, imageUrl: file('Semorelin_10mg-01KX1WK0XWZS73VKCTJPRKMH4K.png'), coaUrl: file('Sermorelin_SERM10626_COA-01M1PKJ57DN696D6CKDEH2YVY9.pdf'), productUrl: product('sermorelin-10mg') },
  { productSlug: 'nad', mg: 500, priceCents: 6399, imageUrl: file('NAD_500mg-01KX407NTRWH8Z0M0EY5HBEP6P.png'), coaUrl: file('nad-2026-07-05-55-01KXSEZ20M4G426RHRC59CPZZ0.pdf'), productUrl: product('nad') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4999, imageUrl: file('MOTS-C_10mg-01KX422D69GCKZ5YVQFDSM0V84.png'), coaUrl: file('MOTS-C%2040mg--synthesis-peptides-MOT40726-MSAyep-01KZW2A4JVR52FEPV4KM3YZFC0.pdf'), productUrl: product('mots-c') },
  { productSlug: 'mots-c', mg: 40, priceCents: 14999, imageUrl: file('MOTS-C_10mg-01KX422D69GCKZ5YVQFDSM0V84.png'), coaUrl: file('MOTS-C%2040mg--synthesis-peptides-MOT40726-MSAyep-01KZW2A4JVR52FEPV4KM3YZFC0.pdf'), productUrl: product('mots-c') },
  { productSlug: 'epitalon', mg: 10, priceCents: 4399, imageUrl: file('Epithalon_10mg-01KX1VY4KHFRNR3Q87KRBDDYQ8.png'), coaUrl: file('Epithalon_50mg_LotEPI50826_969-01KY7R7YP8CTBAJG66VSEW5NVR.pdf'), productUrl: product('epithalon') },
  { productSlug: 'epitalon', mg: 50, priceCents: 13999, imageUrl: file('Epithalon_10mg-01KX1VY4KHFRNR3Q87KRBDDYQ8.png'), coaUrl: file('Epithalon_50mg_LotEPI50826_969-01KY7R7YP8CTBAJG66VSEW5NVR.pdf'), productUrl: product('epithalon') },
  { productSlug: 'semax', mg: 10, priceCents: 3699, imageUrl: file('SEMAX_10mg-01KX45PNCP5SE20009KVEPH90D.png'), coaUrl: file('semax-2026-05-08-64-01KXSEZ4MNVH4S7071FZ4W4QGH.pdf'), productUrl: product('semax') },
  { productSlug: 'semax', mg: 30, priceCents: 7499, imageUrl: file('SEMAX_30mg-01KX45PNCRD02FN1T8VGJZ5YW3.png'), coaUrl: file('semax-2026-05-08-64-01KXSEZ4MNVH4S7071FZ4W4QGH.pdf'), productUrl: product('semax') },
  { productSlug: 'selank', mg: 10, priceCents: 4199, imageUrl: file('Selank_10mg-01KX44NAP94XSCZRTEBDV0SGS6.png'), coaUrl: file('Selank-30mg-SEL30926---SYNT2608110654-01M0GPPQ7JZMAXD6GC09FNZQRW.pdf'), productUrl: product('selank') },
  { productSlug: 'selank', mg: 30, priceCents: 7499, imageUrl: file('Selank_30mg-01KX44NAPAJWR0ZC1NVZN1MNQW.png'), coaUrl: file('Selank-30mg-SEL30926---SYNT2608110654-01M0GPPQ7JZMAXD6GC09FNZQRW.pdf'), productUrl: product('selank') },
  { productSlug: 'pt-141', mg: 10, priceCents: 5299, imageUrl: file('PT-141_10mg-01KX483Q4KQNJRW3TZRNBTCKSG.png'), coaUrl: file('PT-141%2010mg--SYNT2607220064-01KZW2A2P1NNG6ESCRDFD4GCVY.pdf'), productUrl: product('pt-141') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 3699, imageUrl: file('5-Amino-1MQ_10mg-01KX47KXZEWAB2KDY8A4N4V6ZZ.png'), coaUrl: file('5-amino-1mq-2025-09-12-0-01KXSEYHBKYMHR2MBHS353Z6DP.pdf'), productUrl: product('5-amino-1mq') },
  { productSlug: '5-amino-1mq', mg: 50, priceCents: 7499, imageUrl: file('5-Amino-1MQ_10mg-2-01KX47KXZBSMW8E672PB1C5QQF.png'), coaUrl: file('5-amino-1mq-2025-09-12-0-01KXSEYHBKYMHR2MBHS353Z6DP.pdf'), productUrl: product('5-amino-1mq') },
  // Listed by the vendor as MitoSS-31 (10 mg) and MitoSS-32 (50 mg).
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5799, imageUrl: file('SS-31_10mg-01KX4BPFRTY01CCKH14XXCA15W.png'), coaUrl: file('mitoss-31-2026-07-07-70-01KXSEZ6748MVT7M3M7BFZ15Y8.pdf'), productUrl: product('mitoss-31') },
  { productSlug: 'ss-31-elamipretide', mg: 50, priceCents: 16299, imageUrl: file('SS-31_50mg-01KXGM1CJNDVAN6PG8MHP46PMG.png'), coaUrl: file('mitoss-31-2026-07-07-70-01KXSEZ6748MVT7M3M7BFZ15Y8.pdf'), productUrl: product('mitoss-32') },
  { productSlug: 'dsip', mg: 5, priceCents: 3699, imageUrl: file('DSIP_5mg-01KX3NY44MPRDBCC5CWVZSDSPV.png'), coaUrl: file('dsip-2025-12-27-13-01KXSEYNSKDHZS67GVXNDRCFQ4.pdf'), productUrl: product('dsip') },
  { productSlug: 'dsip', mg: 10, priceCents: 4799, imageUrl: file('DSIP_10mg-01KX3NY44P3TH5C1V0H8RFM3EC.png'), coaUrl: file('dsip-2025-12-27-13-01KXSEYNSKDHZS67GVXNDRCFQ4.pdf'), productUrl: product('dsip') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 7399, imageUrl: file('Glutathione-01KXNW57G2B8NKYD60TS0YC7C0.png'), coaUrl: file('glutathione-test-01KXSCNG6Q1K5NJ2XKCCHZ28AD.pdf'), productUrl: product('glutathione') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3499, imageUrl: file('MT2_10mg-01KXGW841A3QWRP6S3G4S8MZHB.png'), coaUrl: file('Melanotan-II-10mg-MT210926---SYNT2608110794-01M0GPPRKN0V41GQ5QV0X9TSGD.pdf'), productUrl: product('mt2-melanotan-2') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6399, imageUrl: file('CJC-1295_Ipamorelin_10mg-01KXK755SSFS7EP29GM0XVAHPV.png'), coaUrl: file('cjc-1295-no-dac-ipamorelin-2026-05-24-10-01KXSEYMXQ7H7A5DNMA2BFX6RT.pdf'), productUrl: product('cjc-1295-no-dac-ipamorelin') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 11999, imageUrl: file('Glow70_70mg-01KXE6PKDY66DCPYV9VCX1PSQR.png'), coaUrl: file('glow-70-blend-2026-05-08-20-01KXSEYQQVWVD4Z9M61VTH44XR.pdf'), productUrl: product('glow-70-blend') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 12999, imageUrl: file('KLOW-01KXGVM1P70Z3AA2F5VG31HEV2.png'), coaUrl: file('KLOW-Blend-80mg-KLOW80926---SYNT2608110619-01M0GPKC6KFVTAQQ3BEYWM592G.pdf'), productUrl: product('klow-80') },
];

runSeed({ supplierSlug: 'synthesis-peptides-2', listings });
