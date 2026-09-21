// Adds BioPeptide Technologies' product listings, as supplied from biopeptitech.com, to the
// Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const product = (path) => `https://biopeptitech.com/products/${path}?ref=peplookup`;
// The same general COA page was supplied for every listing.
const COA_PAGE = 'https://biopeptitech.com/pages/coa';

// Prices in integer cents, sizes in mg (a blend's total). inStock: false only where the listing
// was supplied as "Sold out"; a blank stock field or "Listed" is treated as in stock.
const listings = [
  { productSlug: 'bpc-157', mg: 5, priceCents: 2900, imageUrl: 'https://biopeptitech.com/cdn/shop/files/d_2_29a0fb12-0e70-4310-8560-a97cc4a305e6_700x700.png?v=1735259613', coaUrl: COA_PAGE, productUrl: product('bpc-157-5mg') },
  { productSlug: 'bpc-157', mg: 10, priceCents: 5700, imageUrl: 'https://biopeptitech.com/cdn/shop/files/d_2000x2000.png?v=1757912097', coaUrl: COA_PAGE, productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4500, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofd_869x869.png?v=1735287783', coaUrl: COA_PAGE, productUrl: product('tb-500-thymosin-beta-4-5mg-43aa') },
  // 5 mg + 5 mg.
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 5400, imageUrl: 'https://biopeptitech.com/cdn/shop/files/BPC157-TB5005mg5mg_700x700.png?v=1742328606', coaUrl: COA_PAGE, productUrl: product('bpc-157-5mg-tb-500-5mg-blend') },
  { productSlug: 'ghk-cu', mg: 50, priceCents: 3900, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofd_869x869.png?v=1735261581', coaUrl: COA_PAGE, productUrl: product('ghk-cu-50mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 8400, imageUrl: 'https://biopeptitech.com/cdn/shop/files/8A4C3596-D266-4705-BF88-2975E6A548EF_700x700.png?v=1746227355', coaUrl: COA_PAGE, productUrl: product('retatrutide-10mg') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/Copyofd_bfca5eae-2d9d-41b5-9d05-b2506aee92db_869x869.png?v=1756508473', coaUrl: COA_PAGE, productUrl: product('retatru-20mg') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 15000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofd_9f1633be-830b-48d5-b195-038407002fa4_869x869.png?v=1756508615', coaUrl: COA_PAGE, productUrl: product('retatru-30mg') },
  { productSlug: 'retatrutide', mg: 50, priceCents: 24950, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofd_1_869x869.png?v=1767827171', coaUrl: COA_PAGE, productUrl: product('retatru-50mg') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 13500, imageUrl: 'https://biopeptitech.com/cdn/shop/files/ChatGPTImageJun11_2026_03_45_30PM_700x700.png?v=1781217954', coaUrl: COA_PAGE, productUrl: product('tirzepatide-30mg') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 21000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/ChatGPTImageJun11_2026_03_48_33PM_869x869.png?v=1781218146', coaUrl: COA_PAGE, productUrl: product('tirz-60mg') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 9000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/ECB274A4-27BF-4642-9945-8F3542255D6E_869x869.png?v=1746230041', coaUrl: COA_PAGE, productUrl: product('semaglutide-10mg') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 9900, imageUrl: 'https://biopeptitech.com/cdn/shop/files/IMG-4238_700x700.png?v=1746227236', coaUrl: COA_PAGE, productUrl: product('cargilintide') },
  { productSlug: 'ipamorelin', mg: 5, priceCents: 2400, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofd_869x869.png?v=1735263680', coaUrl: COA_PAGE, productUrl: product('ipamorelin-5mg') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 3000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofd_1_869x869.png?v=1735288225', coaUrl: COA_PAGE, productUrl: product('tesamorelin-5mg') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 4500, inStock: false, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofd_21123bc3-03d6-4c8e-b93e-6823dac5ff6f_869x869.png?v=1759954721', coaUrl: COA_PAGE, productUrl: product('tesamorelin-10mg') },
  { productSlug: 'nad', mg: 500, priceCents: 4500, imageUrl: 'https://biopeptitech.com/cdn/shop/files/NAD_500_869x869.png?v=1742327907', coaUrl: COA_PAGE, productUrl: product('nad-500mg') },
  { productSlug: 'semax', mg: 10, priceCents: 4500, imageUrl: 'https://biopeptitech.com/cdn/shop/files/Semax10mg_1_869x869.png?v=1767909014', coaUrl: COA_PAGE, productUrl: product('semax-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofd_869x869.png?v=1735261915', coaUrl: COA_PAGE, productUrl: product('epithalon-epitalon-10mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 2600, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofCopyofd_869x869.png?v=1735285329', coaUrl: COA_PAGE, productUrl: product('pt-141-10mg') },
  { productSlug: 'dsip', mg: 15, priceCents: 8999, imageUrl: 'https://biopeptitech.com/cdn/shop/files/DSIP15mg_869x869.png?v=1766099646', coaUrl: COA_PAGE, productUrl: product('dsip-15mg') },
  { productSlug: 'glutathione', mg: 1500, priceCents: 7500, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofCopyofCopyofCopyofCopyofCopyofd_869x869.png?v=1735263048', coaUrl: COA_PAGE, productUrl: product('glutathione-1500mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3000, imageUrl: 'https://biopeptitech.com/cdn/shop/files/CopyofCopyofd_3_869x869.png?v=1735260810', coaUrl: COA_PAGE, productUrl: product('cjc-1295-w-o-dac-5mg') },
  // 5 mg + 5 mg.
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6900, imageUrl: 'https://biopeptitech.com/cdn/shop/files/BPC157-TB5005mg5mg_3_869x869.png?v=1742331873', coaUrl: COA_PAGE, productUrl: product('cjc-1295-5mg-ipamorelin-5mg-blend') },
  // 5 mg BPC-157 + 5 mg TB-500 + 50 mg GHK-Cu, per the vendor's own product name.
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 7500, imageUrl: 'https://biopeptitech.com/cdn/shop/files/NAD_500mg_1_869x869.png?v=1749592427', coaUrl: COA_PAGE, productUrl: product('glow-bpc-157-5mg-tb-500-5mg-ghk-cu-50mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 11900, imageUrl: 'https://biopeptitech.com/cdn/shop/files/NAD_500mg_3_869x869.png?v=1757035089', coaUrl: COA_PAGE, productUrl: product('klow-80-mg') },
  // Listed by the vendor as a "Solution"; stored as a vial like other vendors' water, size in mL on
  // the same scale the admin form uses for mL sizes.
  { productSlug: 'bacteriostatic-water', mg: 10, priceCents: 899, imageUrl: 'https://biopeptitech.com/cdn/shop/files/ChatGPTImageOct23_2025_12_51_08PM_869x1304.png?v=1761249104', coaUrl: COA_PAGE, productUrl: product('bacteriostatic-water') },
];

runSeed({ supplierSlug: 'biopeptide-technologies-2', listings });
