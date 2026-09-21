// Adds Apex Peptides Lab's product listings, as supplied from apexpeptideslab.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const CMS = 'https://cms.apexpeptideslab.com/wp-content/uploads/';
const PRODUCT = 'https://apexpeptideslab.com/product/';

const listings = [
  {
    productSlug: 'bpc-157',
    mg: 5,
    priceCents: 5500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fbpc-157-5mg.webp&w=640',
    coaUrl: `${CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}bpc-157?coupon=peplookup`,
  },
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 7500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fbpc-157-5mg.webp&w=640',
    coaUrl: `${CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}bpc-157?coupon=peplookup`,
  },
  {
    productSlug: 'bpc-157',
    mg: 20,
    priceCents: 11900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fbpc-157-5mg.webp&w=640',
    coaUrl: `${CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}bpc-157?coupon=peplookup`,
  },
  {
    productSlug: 'tb-500',
    mg: 5,
    priceCents: 6900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FTB-500-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/thymosin-b-4-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}tb-500?coupon=peplookup`,
  },
  {
    productSlug: 'tb-500',
    mg: 10,
    priceCents: 9900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FTB-500-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/thymosin-b-4-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}tb-500?coupon=peplookup`,
  },
  {
    productSlug: 'bpc-157-tb-500',
    mg: 10,
    priceCents: 9900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FBPC-TB-500-5mg-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}bpc-tb-500?coupon=peplookup`,
  },
  {
    productSlug: 'bpc-157-tb-500',
    mg: 20,
    priceCents: 12900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FBPC-TB-500-5mg-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}bpc-tb-500?coupon=peplookup`,
  },
  {
    productSlug: 'ghk-cu',
    mg: 50,
    priceCents: 5500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F12%2Fghk-cu-50mg.webp&w=640',
    coaUrl: `${CMS}2025/12/ghk-copper-50mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}ghk-cu?coupon=peplookup`,
  },
  {
    productSlug: 'ghk-cu',
    mg: 100,
    priceCents: 7900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F12%2Fghk-cu-50mg.webp&w=640',
    coaUrl: `${CMS}2025/12/ghk-copper-50mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}ghk-cu?coupon=peplookup`,
  },
  {
    // Sold as "GLP-3 R" (apex-r); the vendor lists this as their Retatrutide product.
    productSlug: 'retatrutide',
    mg: 5,
    priceCents: 7900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-3-R-no-mg-e1776089021524.png&w=640',
    coaUrl: `${CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-r?coupon=peplookup`,
  },
  {
    productSlug: 'retatrutide',
    mg: 10,
    priceCents: 10500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-3-R-no-mg-e1776089021524.png&w=640',
    coaUrl: `${CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-r?coupon=peplookup`,
    inStock: false,
  },
  {
    productSlug: 'retatrutide',
    mg: 15,
    priceCents: 13500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-3-R-no-mg-e1776089021524.png&w=640',
    coaUrl: `${CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-r?coupon=peplookup`,
  },
  {
    productSlug: 'retatrutide',
    mg: 20,
    priceCents: 18500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-3-R-no-mg-e1776089021524.png&w=640',
    coaUrl: `${CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-r?coupon=peplookup`,
  },
  {
    productSlug: 'retatrutide',
    mg: 30,
    priceCents: 22900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-3-R-no-mg-e1776089021524.png&w=640',
    coaUrl: `${CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-r?coupon=peplookup`,
  },
  {
    productSlug: 'retatrutide',
    mg: 60,
    priceCents: 29900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-3-R-no-mg-e1776089021524.png&w=640',
    coaUrl: `${CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-r?coupon=peplookup`,
  },
  {
    // Sold as "GLP-1 T" (apex-t); the vendor lists this as their Tirzepatide product.
    productSlug: 'tirzepatide',
    mg: 5,
    priceCents: 6900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-T-no-mg-e1776089223322.png&w=640',
    coaUrl: `${CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-t?coupon=peplookup`,
  },
  {
    productSlug: 'tirzepatide',
    mg: 10,
    priceCents: 9900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-T-no-mg-e1776089223322.png&w=640',
    coaUrl: `${CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-t?coupon=peplookup`,
  },
  {
    productSlug: 'tirzepatide',
    mg: 15,
    priceCents: 10900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-T-no-mg-e1776089223322.png&w=640',
    coaUrl: `${CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-t?coupon=peplookup`,
  },
  {
    productSlug: 'tirzepatide',
    mg: 20,
    priceCents: 12000,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-T-no-mg-e1776089223322.png&w=640',
    coaUrl: `${CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-t?coupon=peplookup`,
  },
  {
    productSlug: 'tirzepatide',
    mg: 30,
    priceCents: 15900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-T-no-mg-e1776089223322.png&w=640',
    coaUrl: `${CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-t?coupon=peplookup`,
  },
  {
    productSlug: 'tirzepatide',
    mg: 60,
    priceCents: 24900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-T-no-mg-e1776089223322.png&w=640',
    coaUrl: `${CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-t?coupon=peplookup`,
  },
  {
    // Sold as "GLP-1 S" (apex-s); the vendor lists this as their Semaglutide product.
    productSlug: 'semaglutide',
    mg: 2,
    priceCents: 7900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-S-no-mg-e1776089028329.png&w=640&q=75',
    coaUrl: `${CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-s?coupon=peplookup`,
  },
  {
    productSlug: 'semaglutide',
    mg: 5,
    priceCents: 7000,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-S-no-mg-e1776089028329.png&w=640&q=75',
    coaUrl: `${CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-s?coupon=peplookup`,
  },
  {
    productSlug: 'semaglutide',
    mg: 10,
    priceCents: 11900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-S-no-mg-e1776089028329.png&w=640&q=75',
    coaUrl: `${CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-s?coupon=peplookup`,
  },
  {
    productSlug: 'semaglutide',
    mg: 20,
    priceCents: 16900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGLP-1-S-no-mg-e1776089028329.png&w=640&q=75',
    coaUrl: `${CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}apex-s?coupon=peplookup`,
  },
  {
    productSlug: 'ipamorelin',
    mg: 5,
    priceCents: 6900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FIpamorelin-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/lpamorelin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}ipamorelin-5mg?coupon=peplookup`,
  },
  {
    productSlug: 'tesamorelin',
    mg: 5,
    priceCents: 7900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FTesamorelin-5mg.webp&w=640',
    coaUrl: `${CMS}2025/08/tesamorelin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}tesamorelin-5-mg?coupon=peplookup`,
  },
  {
    productSlug: 'tesamorelin',
    mg: 10,
    priceCents: 9500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FTesamorelin-5mg.webp&w=640',
    coaUrl: `${CMS}2025/08/tesamorelin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}tesamorelin-5-mg?coupon=peplookup`,
  },
  {
    productSlug: 'sermorelin',
    mg: 10,
    priceCents: 7900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FSermorelin-10mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/sermorelin-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}sermorelin-10mg?coupon=peplookup`,
  },
  {
    productSlug: 'nad',
    mg: 500,
    priceCents: 6900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FNAD_500mg.webp&w=640',
    coaUrl: `${CMS}2025/08/nad-500-mg.png?coupon=peplookup`,
    productUrl: `${PRODUCT}nad?coupon=peplookup`,
  },
  {
    productSlug: 'nad',
    mg: 1000,
    priceCents: 12900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FNAD_500mg.webp&w=640',
    coaUrl: `${CMS}2025/08/nad-500-mg.png?coupon=peplookup`,
    productUrl: `${PRODUCT}nad?coupon=peplookup`,
  },
  {
    productSlug: 'mots-c',
    mg: 10,
    priceCents: 9900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FMOTS-C-10mg.webp&w=640',
    coaUrl: `${CMS}2025/09/mots-c-10mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}mots-c?coupon=peplookup`,
  },
  {
    productSlug: 'mots-c',
    mg: 40,
    priceCents: 14900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FMOTS-C-10mg.webp&w=640',
    coaUrl: `${CMS}2025/09/mots-c-10mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}mots-c?coupon=peplookup`,
  },
  {
    productSlug: 'epitalon',
    mg: 5,
    priceCents: 4000,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FEpithalon-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/09/epithalon-50-mg.png?coupon=peplookup`,
    productUrl: `${PRODUCT}epithalon-5mg?coupon=peplookup`,
  },
  {
    productSlug: 'semax',
    mg: 5,
    priceCents: 3900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FSemax-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/09/semax-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}semax?coupon=peplookup`,
  },
  {
    productSlug: 'semax',
    mg: 10,
    priceCents: 4900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FSemax-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/09/semax-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}semax?coupon=peplookup`,
  },
  {
    productSlug: 'semax',
    mg: 30,
    priceCents: 12900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FSemax-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/09/semax-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}semax?coupon=peplookup`,
  },
  {
    productSlug: 'selank',
    mg: 5,
    priceCents: 4500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FSelank-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/09/selank-5mg-semax-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}selank-5-mg?coupon=peplookup`,
  },
  {
    productSlug: 'pt-141',
    mg: 10,
    priceCents: 6900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FPT-141-10mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/pt-141-10mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}pt-141-bremelanotide-10mg?coupon=peplookup`,
  },
  {
    // No certificate was supplied for this listing.
    productSlug: 'ss-31-elamipretide',
    mg: 10,
    priceCents: 6900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2026%2F06%2FSS-31.webp&w=640&q=75',
    coaUrl: null,
    productUrl: `${PRODUCT}ss-31?coupon=peplookup`,
  },
  {
    productSlug: 'ss-31-elamipretide',
    mg: 50,
    priceCents: 13900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2026%2F06%2FSS-31.webp&w=640&q=75',
    coaUrl: null,
    productUrl: `${PRODUCT}ss-31?coupon=peplookup`,
  },
  {
    // No certificate was supplied for this listing.
    productSlug: 'dsip',
    mg: 5,
    priceCents: 5900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2026%2F07%2FChatGPT-Image-Jul-29-2026-08_21_12-AM-4.webp&w=640&q=75',
    coaUrl: null,
    productUrl: `${PRODUCT}dsip-5mg?coupon=peplookup`,
  },
  {
    productSlug: 'glutathione',
    mg: 600,
    priceCents: 4900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGlutathione-600mgl.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/l-glutathione-600-mg.png?coupon=peplookup`,
    productUrl: `${PRODUCT}glutathione?coupon=peplookup`,
  },
  {
    productSlug: 'glutathione',
    mg: 1500,
    priceCents: 7900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FGlutathione-600mgl.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/l-glutathione-600-mg.png?coupon=peplookup`,
    productUrl: `${PRODUCT}glutathione?coupon=peplookup`,
  },
  {
    productSlug: 'melanotan-2',
    mg: 10,
    priceCents: 5900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fmelanotan-2-10mg.webp&w=640',
    coaUrl: `${CMS}2025/09/melanotan-II-10mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}melanotan-2-10mg?coupon=peplookup`,
  },
  {
    productSlug: 'cjc-1295-no-dac',
    mg: 5,
    priceCents: 7800,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fcjc-1295-5mg.webp&w=640&q=75',
    coaUrl: `${CMS}2025/08/cjc-1295-without-dac-5mg.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}cjc-1295-no-dac-5mg?coupon=peplookup`,
  },
  {
    productSlug: 'cjc-1295-no-dac',
    mg: 10,
    priceCents: 8900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F11%2Fcjc-1295-10mg.png&w=640&q=75',
    coaUrl: `${CMS}2025/11/COA_CJC-1295_noDAC_10mg_2026-02-03_20260223-1-scaled.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}cjc-1295-no-dac-10mg?coupon=peplookup`,
  },
  {
    // No certificate was supplied for this listing.
    productSlug: 'glow-ghk-cu-bpc-157-tb-500',
    mg: 70,
    priceCents: 9900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FBPC-157_GHK-CU_TB500.webp&w=640',
    coaUrl: null,
    productUrl: `${PRODUCT}glow-bpc-157-10mg-ghk-cu-50mg-tb500-10mg?coupon=peplookup`,
  },
  {
    productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu',
    mg: 80,
    priceCents: 12900,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?q=75&url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F12%2FIMG_8099.jpg&w=640',
    coaUrl: `${CMS}2025/12/klow.jpg?coupon=peplookup`,
    productUrl: `${PRODUCT}klow-ghk-cu-50-mg-bpc-157-10-mg-tb-4-10-mg-kpv-10-mg?coupon=peplookup`,
  },
  {
    // No certificate was supplied for this listing.
    productSlug: 'bacteriostatic-water',
    mg: 3,
    priceCents: 1000,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FBAC-Water-Hosp-1.webp&w=640&q=75',
    coaUrl: null,
    productUrl: `${PRODUCT}bacteriostatic-water?coupon=peplookup`,
  },
  {
    productSlug: 'bacteriostatic-water',
    mg: 10,
    priceCents: 1500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FBAC-Water-Hosp-1.webp&w=640&q=75',
    coaUrl: null,
    productUrl: `${PRODUCT}bacteriostatic-water?coupon=peplookup`,
  },
  {
    productSlug: 'bacteriostatic-water',
    mg: 30,
    priceCents: 2500,
    imageUrl:
      'https://apexpeptideslab.com/_next/image?url=https%3A%2F%2Fcms.apexpeptideslab.com%2Fwp-content%2Fuploads%2F2025%2F08%2FBAC-Water-Hosp-1.webp&w=640&q=75',
    coaUrl: null,
    productUrl: `${PRODUCT}bacteriostatic-water?coupon=peplookup`,
  },
];

runSeed({ supplierSlug: 'apex-peptides-lab-2', listings });
