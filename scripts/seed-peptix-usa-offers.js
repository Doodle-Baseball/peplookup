// Adds Peptix USA's product listings, as supplied from peptixusa.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Tesamorelin and Bacteriostatic Water were supplied with no COA link.
const { runSeed } = require('./lib/seed-vendor-offers');

const IMAGES = 'https://tkrvivuwntdhynezjzeh.supabase.co/functions/v1/product-image/';
const REF = '?ref=peplookup';

const listings = [
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 4000,
    imageUrl: `${IMAGES}bpc-157.png?t=orVjtXFqD7HsdMrFcDRWOxBiKuuYub8nnixQ5pS4Ok6jDYacpjjuOO24KjPCi_vP07h47apIzXJM3pv5-12Pkct5dJVsqgtmzftOrHPNHYBVitIRqLI`,
    coaUrl: 'https://tkrvivuwntdhynezjzeh.supabase.co/storage/v1/object/public/coa-pdfs/cache/fe1fd7bc2d8443a017a0f20bc741423bdb7ffff3ebf44e680c285235fda9f80f.png?ref=peplookup',
    productUrl: `https://peptixusa.com/product/bpc-157${REF}`,
  },
  {
    productSlug: 'retatrutide',
    mg: 10,
    priceCents: 5900,
    imageUrl: `${IMAGES}reta-glp-3.png?t=fIrZbY4ixXiElwLnRBBPtlRBCWaQVALrsuXXtdBY3WmMP3PG53Fa8vg8kg_1BSHLOsVKyQNVqIcrIpn2ItS7jLbCe05gUpe9pz0a0wHylkxHdiqAvjI`,
    coaUrl: 'https://tkrvivuwntdhynezjzeh.supabase.co/storage/v1/object/public/coa-pdfs/product-47/1785158430250-533a0f27-d9686.png?ref=peplookup',
    productUrl: `https://peptixusa.com/product/retatrutide${REF}`,
  },
  {
    productSlug: 'tesamorelin',
    mg: 10,
    priceCents: 6200,
    imageUrl: `${IMAGES}tesamorelin.jpeg?t=7t9w5UzCYnVN75WtfSgR-6hJG3jg2-4DzlFDvZoIvnAvQljHTTEIa-VBGbeO4gtwSd1S56l5T1pfWwtY6CbHXp0oTQh8L-Zd`,
    coaUrl: null,
    productUrl: `https://peptixusa.com/product/tesamorelin${REF}`,
  },
  {
    productSlug: 'glow-ghk-cu-bpc-157-tb-500',
    mg: 70,
    priceCents: 8500,
    imageUrl: `${IMAGES}glow.png?t=CkaU6-l92uS-sy_JX_jvXUnMxOrMk0qicTyoj0vNOZnsrQOTnjE05TZyWxLW7hn8ZqTcBK71dzYHNrSN5NgE07ZZJ_K2Gr4ZFa63Hx0eFAg6x1F9B-A`,
    coaUrl: 'https://tkrvivuwntdhynezjzeh.supabase.co/storage/v1/object/public/coa-pdfs/cache/0417eec4ec65e678d725d1077b4355dc18c13bdb0fc6ea17f88b7a16ec872338.png?ref=peplookup',
    productUrl: `https://peptixusa.com/product/glow${REF}`,
  },
  {
    productSlug: 'bacteriostatic-water',
    mg: 10,
    priceCents: 1500,
    imageUrl: `${IMAGES}bacteriostatic-water.png?t=eBMtzkDYveAjXP5Z9lRtw2lg9mI2vkPo6qP7rGZjZC6TVy8bjp_dTBGiZpkHtLisxe4-lTC5ajdgrnLDpjinJp0EeXYpju-0Bl0WVHZDFOP8GygUmkk`,
    coaUrl: null,
    productUrl: `https://peptixusa.com/product/bac-water${REF}`,
  },
];

runSeed({ supplierSlug: 'peptix-usa-2', listings });
