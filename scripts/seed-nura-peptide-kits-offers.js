// Adds Nura Peptide's multi-vial and multi-bottle kits, as supplied from
// nurapeptide.com, to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
//
// Every kit comes in 3, 5 and 10 packs. A "10mg 3-vials kit" is stored as
// `count: 3` at the same per-vial `mg`, the convention used for other vendors'
// multi-vial packs. Capsule kits store the total capsules in the pack
// ("0.5mg x 100 caps, 3 bottles" is 300 capsules of 0.5mg), matching how other
// vendors' capsule bottles are stored. Bacteriostatic water stores ml on `mg`.
// The sheet gave no stock column, so kits default to in stock.
const { runSeed } = require('./lib/seed-vendor-offers');

const REF = '?ref=peplookup';
const SITE = 'https://nurapeptide.com/';
const COA_PAGE = `${SITE}coa${REF}`;
const MEDIA = `${SITE}api/catalog-media/20260928-transparent-`;
const KIT_SIZES = [3, 5, 10];

/**
 * The 3-, 5- and 10-pack of one product size.
 * @param {string} productSlug compound slug on this site
 * @param {string} path the vendor's product page, without the ref
 * @param {string} image file name under MEDIA
 * @param {number} mg per vial (or per capsule, or ml for water)
 * @param {[number, number, number]} prices in cents for the 3, 5 and 10 pack
 * @param {{ form?: 'capsule', perBottle?: number }} [options]
 */
function kits(productSlug, path, image, mg, prices, options = {}) {
  return KIT_SIZES.map((packs, index) => ({
    productSlug,
    ...(options.form ? { form: options.form } : {}),
    mg,
    count: packs * (options.perBottle ?? 1),
    priceCents: prices[index],
    imageUrl: `${MEDIA}${image}`,
    coaUrl: COA_PAGE,
    productUrl: `${SITE}${path}${REF}`,
  }));
}

const listings = [
  // The single vial, sold alongside the kits below.
  {
    productSlug: 'bpc-157',
    mg: 10,
    priceCents: 4900,
    imageUrl: `${MEDIA}01adb63af0221bb95b23256ff3d427761c5c56b5.webp?w=640&v=2`,
    coaUrl: COA_PAGE,
    productUrl: `${SITE}p/bpc-157${REF}`,
  },
  ...kits('bpc-157', 'p/bpc-157', '01adb63af0221bb95b23256ff3d427761c5c56b5.webp', 10, [14700, 24500, 49000]),
  ...kits('bpc-157', 'p/bpc-157-capsules', 'bf44a1c4b1595fdb39ad796522742bf609aacacf.webp', 0.5, [43500, 72500, 145000], { form: 'capsule', perBottle: 100 }),

  ...kits('tb-500', 'p/tb-500', 'ea7b014726426aed75fbec379191b9eb327b7a38.webp', 5, [7500, 12500, 25000]),
  ...kits('tb-500', 'p/tb-500', 'ea7b014726426aed75fbec379191b9eb327b7a38.webp', 10, [16500, 27500, 55000]),

  // "BPC-157 + TB-500": Nura's single vials of this blend are already listed under Wolverine.
  ...kits('wolverine', 'products/bpc-157-tb-500-blend', 'ebf619ab5e00df3905e65b868ecfc18246bce368.webp?w=960&v=2', 10, [18000, 30000, 60000]),
  ...kits('wolverine', 'products/bpc-157-tb-500-blend', '222ac6427496d9180f5ccb1a4d0fb71dda79df83.webp?w=960&v=2', 20, [31800, 53000, 106000]),

  ...kits('ghk-cu', 'p/ghk-cu', 'd37539c143a8fc1a2b98e7e7df8c5a33497d450f.webp', 100, [16500, 27500, 55000]),

  // Sold as "GLP-3R".
  ...kits('retatrutide', 'p/glp-3r', '5222b9681d0edc6e2d878bf09bd52c539c10f2dd.webp', 10, [19500, 32500, 65000]),
  ...kits('retatrutide', 'p/glp-3r', 'dc6ae5c7cea20de1fa2fc06810ae09f34c9cee14.webp?w=960&v=2', 20, [32700, 54500, 109000]),
  ...kits('retatrutide', 'p/glp-3r', '69068e5cddaf7f5de4c5e0202ec4c0e6170c2051.webp?w=960&v=2', 30, [44700, 74500, 149000]),
  ...kits('retatrutide', 'p/glp-3r', 'e82f88b2567c81cd5140bce094e587ac01738f1a.webp?w=960&v=2', 50, [61500, 102500, 205000]),

  // Sold as "GLP-2T".
  ...kits('tirzepatide', 'p/glp-2t', 'ab816ebd99da040d3696abcfb4ab83b7d4f29b8f.webp', 10, [15000, 25000, 50000]),
  ...kits('tirzepatide', 'p/glp-2t', '83e45e9652f63487964711ff7435fed4ea1ec06d.webp?w=960&v=2', 30, [33000, 55000, 110000]),
  ...kits('tirzepatide', 'p/glp-2t', 'bf977505e2a6bfbe32a635b1ca9efa764c576ae1.webp?w=960&v=2', 60, [46500, 77500, 155000]),

  // Sold as "GLP-1SG".
  ...kits('semaglutide', 'p/glp-1sg', '98708833640a9222682f732da3025ba15ae842f8.webp', 10, [16500, 27500, 55000]),
  ...kits('cagrilintide', 'p/cag', '9729259f8a2826fa592ddb34ecbc48884174f899.webp', 10, [29700, 49500, 99000]),
  ...kits('ipamorelin', 'p/ipamorelin', 'f094524c655f72055df520aa2e9b7917747ef56e.webp', 10, [13500, 22500, 45000]),

  ...kits('tesamorelin', 'p/tesamorelin', '234eb7ff986d750ae43a2fd4e9a950f89f3f2ff7.webp', 10, [21000, 35000, 70000]),
  ...kits('tesamorelin', 'p/tesamorelin', 'd0f3accac284201edf76c338564613a34ba49f25.webp?w=960&v=2', 20, [39000, 65000, 130000]),

  ...kits('sermorelin', 'p/sermorelin', '048d44b7e4d24d0837a40a2f9f02c90045c4d64c.webp', 5, [13500, 22500, 45000]),

  ...kits('nad', 'p/nad-plus', '548355842c1b45b43be1a87dcb1e3eff9a24f5a3.webp', 500, [19500, 32500, 65000]),
  ...kits('nad', 'p/nad-plus', '548355842c1b45b43be1a87dcb1e3eff9a24f5a3.webp?w=960&v=2', 1000, [33000, 55000, 110000]),

  ...kits('mots-c', 'p/mots-c', 'b81a2a4e4800f6facf0418908852a67fa6e0bb4b.webp', 10, [13500, 22500, 45000]),
  ...kits('epitalon', 'p/epitalon', '21c6ed039cf2781ddebc50cc3001470e89ec8d8c.webp', 10, [12000, 20000, 40000]),
  ...kits('semax', 'p/semax-lyophilized', '3d05dd0207b2818bf02afc7427fad86650d8a2cd.webp', 10, [13500, 22500, 45000]),
  ...kits('selank', 'p/selank-lyophilized', 'f2ed07e8e425f329957cfbb46119f2fc380f6b1c.webp', 10, [13500, 22500, 45000]),
  ...kits('pt-141', 'p/pt-141', '4bf07139e342ed78606458ffc9d05f1612ff3620.webp', 10, [12000, 20000, 40000]),

  ...kits('5-amino-1mq', 'p/5-amino-1mq', '31d1f632fae939b1e4ca4bc536909b422fcfcb2d.webp', 10, [14700, 24500, 49000]),
  ...kits('5-amino-1mq', 'p/5-amino-1mq', '31d1f632fae939b1e4ca4bc536909b422fcfcb2d.webp', 50, [29700, 49500, 99000]),
  ...kits('5-amino-1mq', 'p/5-amino-1mq-50mg-capsules', 'f9db100a41ba5066dc5a862cb455d48e3831b0ff.webp', 50, [45000, 75000, 150000], { form: 'capsule', perBottle: 60 }),

  ...kits('dsip', 'p/dsip', '615135649279c808971d7f741ccd100c96447e8d.webp', 5, [9900, 16500, 33000]),
  ...kits('glutathione', 'p/glutathione', '5a8b85c7873c1cb4733ebd073224145350876118.webp', 1500, [16500, 27500, 55000]),
  ...kits('melanotan-2', 'p/melanotan-ii', '87f4dcbb04228c91047707b6a734795c9427332e.webp', 10, [12000, 20000, 40000]),
  ...kits('cjc-1295-no-dac', 'p/cjc-1295-no-dac', 'fbd23545740a573bdd417f0fd498fbfce2e8f743.webp', 5, [8700, 14500, 29000]),
  ...kits('glow', 'p/glow', 'be85a6a6e5c1d88ed37d6f2d5060e50c17653c58.webp', 70, [27000, 45000, 90000]),
  ...kits('klow', 'products/klow', '422134f7bfc2e617e4baadb4c5d619d3c60e43bc.webp?w=960&v=2', 80, [32700, 54500, 109000]),

  ...kits('bacteriostatic-water', 'p/bac-water-10ml', 'b29db56cd6f434659242389d19f3df9c9a38972b.webp', 10, [3000, 5000, 10000]),
  ...kits('bacteriostatic-water', 'p/bac-water-30ml', '5470619f2d661e8bcfdb390e36b5916178994bc3.webp', 30, [4200, 7000, 14000]),

  // 5mg + 5mg = 10mg total per vial.
  ...kits('ipamorelin-cjc-1295-no-dac', 'p/ipamorelin-cjc-1295-no-dac', '8dab0d0fbf5d32b018eacf3a6dd69d92883d65c9.webp', 10, [16500, 27500, 55000]),
];

runSeed({ supplierSlug: 'nura-peptide', listings });
