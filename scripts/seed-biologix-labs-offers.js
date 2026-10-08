// Adds Biologix Labs' product listings, as supplied from biologixlabsresearch.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

// Product photos live in the vendor's Cloudinary account; each is given as
// "<version>/<file>" and sits under the Biologix folder.
const photo = (versionAndFile) => {
  const [version, file] = versionAndFile.split('/');
  return `https://res.cloudinary.com/mjfii8xr/image/upload/v${version}/Biologix/${file}`;
};
const product = (path) => `https://www.biologixlabsresearch.com/shop/${path}?ref=PEPLOOKUP`;
// The same COA library page was supplied for every listing.
const COA_PAGE = 'https://www.biologixlabsresearch.com/shop?tab=coa-library&ref=PEPLOOKUP';

/**
 * One compound's listings. Each row is [mg, packCount, priceCents, photo, inStock?]:
 * a "10-vials kit" is 10 vials of that size at the kit's price, so the price per
 * mg is worked out over the whole pack. Sizes are mg (mL for bacteriostatic water).
 */
function compound(productSlug, shopPath, rows) {
  return rows.map(([mg, count, priceCents, image, inStock]) => ({
    productSlug,
    mg,
    count,
    priceCents,
    ...(inStock === false ? { inStock: false } : {}),
    imageUrl: photo(image),
    coaUrl: COA_PAGE,
    productUrl: product(shopPath),
  }));
}

const listings = [
  ...compound('bpc-157', 'bpc-157', [
    [5, 1, 2799, '1787070283/ojjrzawqn10qaqu36enc.webp'],
    [10, 1, 4199, '1787070285/j49eu2gn5e6bgoxcypdu.webp'],
    [20, 1, 6999, '1787070287/dy6pr6vjk0na5whhvxpt.webp'],
    [10, 10, 41990, '1787070285/j49eu2gn5e6bgoxcypdu.webp'],
  ]),
  ...compound('tb-500', 'tb-500', [
    [5, 1, 3599, '1787070426/mzvtkik5y6xntw7kk4rc.webp'],
    [10, 1, 4799, '1787070428/pycc45jee2dx5yamuofb.webp'],
    [10, 10, 47990, '1787070428/pycc45jee2dx5yamuofb.webp'],
  ]),
  ...compound('bpc-157-tb-500', 'bpc-157-tb500', [
    [10, 1, 4799, '1787070289/oyfpcmakc1rl3rrgegbe.webp'],
    [20, 1, 6999, '1787070292/k1a64mvagabgqfksjyn8.webp'],
    [10, 10, 47990, '1787070289/oyfpcmakc1rl3rrgegbe.webp'],
  ]),
  ...compound('ghk-cu', 'ghk', [
    [50, 1, 2999, '1787070319/bs6zaxaorsfih4jn9ffn.webp'],
    [100, 1, 4499, '1787070321/n2kdanv140xrxmdihrly.webp'],
  ]),
  ...compound('retatrutide', 'retatrutide', [
    [5, 1, 3799, '1787070343/izbdacc5xslzrnm2cezj.webp'],
    [10, 1, 7499, '1787070344/hxnhcrrsvkl243lcrc7q.webp'],
    [20, 1, 12999, '1787070346/uuts0x2moxmrsppgtgpc.webp'],
    [30, 1, 16499, '1787070348/wboze9ogznovm8i3tmsd.webp'],
    [10, 10, 74990, '1787070344/hxnhcrrsvkl243lcrc7q.webp'],
  ]),
  ...compound('tirzepatide', 'tirzepatide', [
    [5, 1, 2499, '1787070335/mulsbohawzbu0brjigan.webp'],
    [10, 1, 3499, '1787070337/npapfudwuknrevgjftoo.webp'],
    [20, 1, 5999, '1787070339/lpudzda1m9qlox6271c3.webp'],
    [30, 1, 8499, '1787070341/xgd5zjbvs8qcnsqvcklt.webp'],
    [10, 10, 34990, '1787070337/npapfudwuknrevgjftoo.webp'],
  ]),
  ...compound('semaglutide', 'semaglutide', [
    [20, 1, 2799, '1787070331/axuvbepuesiijhus8qid.webp', false],
    [30, 1, 4099, '1787070333/ccizu6q1sxajuh0y0jix.webp', false],
  ]),
  ...compound('cagrilintide', 'cagrilintide', [
    [5, 1, 4999, '1787070293/vpcv6qcl6t7tvyflykmb.webp'],
    [10, 1, 8199, '1787070295/c1ktzghtslivhput7dly.webp'],
    [10, 10, 81990, '1787070295/c1ktzghtslivhput7dly.webp'],
  ]),
  ...compound('ipamorelin', 'ipamorelin', [
    [2, 1, 1799, '1787070369/jmlozkbkyui0o8bwlrlx.webp'],
    [5, 1, 2799, '1787070370/tc9qh5n4pm7upuk7enld.webp'],
    [10, 1, 3499, '1787070372/k1fngpplhgmj8tl5jlt8.webp'],
    [10, 10, 34990, '1787070372/k1fngpplhgmj8tl5jlt8.webp'],
  ]),
  ...compound('tesamorelin', 'tesamorelin', [
    [5, 1, 4399, '1787070431/un8pt7vqlvbo5r7vtp6d.webp'],
    [10, 1, 6399, '1787070433/dep86osqyxpx0c6rwqen.webp'],
    [20, 1, 10999, '1787734643/u713a05gbqayjlvpb34m.jpg'],
    [10, 10, 63990, '1787070433/dep86osqyxpx0c6rwqen.webp'],
  ]),
  ...compound('sermorelin', 'sermoreline-acetate', [
    [2, 1, 1999, '1787070412/jvannnc3wbjwag571x1o.webp'],
    [5, 1, 3499, '1787070414/uyuano2sdicj7po0rstw.webp'],
    [10, 1, 5499, '1787070416/baqgnghh13jpkdlpxubl.webp'],
    [10, 10, 54990, '1787070416/baqgnghh13jpkdlpxubl.webp'],
  ]),
  ...compound('nad', 'nad-buffered', [
    [500, 1, 4399, '1787070393/baxpktgtjkmndktpk36z.webp'],
    [1000, 1, 8499, '1787070395/p7n762lml6mzltlzqoam.webp'],
    [1000, 10, 84990, '1787070395/p7n762lml6mzltlzqoam.webp'],
  ]),
  ...compound('mots-c', 'mots-c', [
    [10, 1, 3399, '1787070384/qulgxcnjjnjxvon2k9m6.webp'],
    [40, 1, 8599, '1787070386/uxfuhigrn11ocqyqkcvo.webp'],
    [10, 10, 33990, '1787070384/qulgxcnjjnjxvon2k9m6.webp'],
  ]),
  ...compound('epitalon', 'epithalon', [
    [10, 1, 3499, '1787070314/jqi9udgosvzugwwyfki0.webp'],
    [50, 1, 11899, '1787070316/fgb8fr4q5hkujkmfngvd.webp'],
    [10, 10, 34990, '1787070314/jqi9udgosvzugwwyfki0.webp'],
  ]),
  ...compound('semax', 'semax', [
    [5, 1, 2499, '1787070407/rfppbmkycgr30jlvtrrj.webp'],
    [10, 1, 3499, '1787070409/pxcu4qvf9ugbomyxuduu.webp'],
    [30, 1, 6999, '1787070410/btzngp67x12s7qgsisa5.webp'],
    [10, 10, 34990, '1787070409/pxcu4qvf9ugbomyxuduu.webp'],
  ]),
  ...compound('selank', 'selank', [
    [5, 1, 2499, '1787070401/e3dzd9gwe7rox2apwcyb.webp'],
    [10, 1, 3499, '1787070403/o3znrjm7clzuf6mahvvi.webp'],
    [30, 1, 6999, '1787070405/ipmnjyvi4stzytlerx00.webp'],
    [10, 10, 34990, '1787070403/o3znrjm7clzuf6mahvvi.webp'],
  ]),
  ...compound('pt-141', 'pt-141', [
    [10, 1, 3599, '1787070398/ipo839wiopmkaufket4t.webp', false],
    [10, 10, 35990, '1787070398/ipo839wiopmkaufket4t.webp', false],
  ]),
  ...compound('5-amino-1mq', '5-amino-1mq-1', [
    [5, 1, 2999, '1787070275/p4gpdlcpa9rts2igdr1r.webp'],
    [10, 1, 4499, '1787070277/ti5bjr51ppc8fqoyxule.webp'],
    [50, 1, 6799, '1787070279/hnfflzqmcwisfpignr8e.webp'],
    [10, 10, 44990, '1787070277/ti5bjr51ppc8fqoyxule.webp'],
  ]),
  ...compound('mazdutide', 'mazdutide', [
    [5, 1, 5099, '1787070380/xlnmcmyozyktddougm4y.webp', false],
    [10, 1, 12799, '1787070382/vkutqtkbt2dgkifto56a.webp', false],
    [10, 10, 127990, '1787070382/vkutqtkbt2dgkifto56a.webp', false],
  ]),
  ...compound('ss-31-elamipretide', 'ss-31', [
    [10, 1, 3999, '1787070420/kecsumee8zgxs5us5atk.webp'],
    [50, 1, 11199, '1787070422/izmwu8zvz2ajvlxi7rkc.webp'],
    [10, 10, 39990, '1787070420/kecsumee8zgxs5us5atk.webp'],
  ]),
  ...compound('dsip', 'dsip', [
    [5, 1, 2599, '1787070311/ta1l0fkszwzoxktcuho7.webp'],
    [10, 1, 4199, '1787070312/q7fgio7rnimcvjtljkqu.webp'],
    [10, 10, 41990, '1787070312/q7fgio7rnimcvjtljkqu.webp'],
  ]),
  ...compound('glutathione', 'glutathione', [
    [1500, 1, 5499, '1787070351/lzp3peeu4b3b2kidcjl7.webp'],
    [1500, 10, 54990, '1787070351/lzp3peeu4b3b2kidcjl7.webp'],
  ]),
  // The vendor's own URL for Survodutide is spelled "srvodutide".
  ...compound('survodutide', 'srvodutide', [
    [10, 1, 6799, '1787070424/swgjocblffdsuc2oi2p3.webp', false],
    [10, 10, 67990, '1787070424/swgjocblffdsuc2oi2p3.webp', false],
  ]),
  ...compound('hexarelin', 'hexarelin-acetate', [
    [5, 1, 3599, '1787070359/aur1yhdywy2zwpyxcoxh.webp', false],
    [5, 10, 35990, '1787070359/aur1yhdywy2zwpyxcoxh.webp', false],
  ]),
  ...compound('melanotan-1', 'mt-1', [
    [10, 1, 2799, '1787070389/etcfn4r0jdtiaheyzmea.webp', false],
    [10, 10, 27990, '1787070389/etcfn4r0jdtiaheyzmea.webp', false],
  ]),
  ...compound('melanotan-2', 'mt-2', [
    [10, 1, 2799, '1787070390/bjfofgbm9az4ejongzxu.webp', false],
    [10, 10, 27990, '1787070390/bjfofgbm9az4ejongzxu.webp', false],
  ]),
  ...compound('cjc-1295-no-dac', 'cjc-1295-without-dac', [
    [5, 1, 2999, '1787070304/tgmnb0zkdhcxprlqsztv.webp'],
    [10, 1, 4499, '1787070307/subnpqhzurvqejxo5dwn.webp'],
    [10, 10, 44990, '1787070307/subnpqhzurvqejxo5dwn.webp'],
  ]),
  ...compound('glow', 'glow-stack', [
    [70, 1, 7799, '1787070324/jmbjwvlqoacdz3yuatti.webp'],
    [70, 10, 77990, '1787070324/jmbjwvlqoacdz3yuatti.webp'],
  ]),
  ...compound('klow', 'klow', [
    [80, 1, 9799, '1787070374/afipqu43c1aofllehyvb.webp'],
    [80, 10, 97990, '1787070374/afipqu43c1aofllehyvb.webp'],
  ]),
  // Sizes are millilitres here; the site stores them on the same 1000-per-unit scale.
  ...compound('bacteriostatic-water', 'bac-water', [
    [30, 1, 2499, '1785428710/axvh6c8x8w8waeji6vrc.png'],
    [30, 10, 24990, '1785428710/axvh6c8x8w8waeji6vrc.png'],
  ]),
  ...compound('ipamorelin-cjc-1295-no-dac', 'cjc-1295-without-dac-ipa', [
    [10, 1, 5599, '1787070309/wnvfyqwilmkcexlo1cy9.webp'],
    [10, 10, 55990, '1787070309/wnvfyqwilmkcexlo1cy9.webp'],
  ]),
];

runSeed({ supplierSlug: 'biologix-labs', listings });
