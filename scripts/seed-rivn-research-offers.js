// Adds RIVN Research's product listings, as supplied from rivnresearch.com, to the Supabase
// `offers` table. See scripts/lib/seed-vendor-offers.js.
const { runSeed } = require('./lib/seed-vendor-offers');

const upload = (path) => `https://rivnresearch.com/wp-content/uploads/${path}`;
const product = (path) => `https://rivnresearch.com/product/${path}/?sld=3866`;

// Prices in integer cents, sizes in mg (a blend's total). inStock: false where the listing was
// supplied as out of stock. coaUrl is null where no certificate was supplied (this vendor has no
// general COA page to fall back to).
const listings = [
  { productSlug: 'bpc-157', mg: 10, priceCents: 4999, imageUrl: upload('2026/01/6A8D8537-BFF6-4FB9-A743-DEFBA9A6C509-977x1024.webp'), coaUrl: upload('2026/01/img_0367.webp'), productUrl: product('bpc-157-10mg') },
  { productSlug: 'tb-500', mg: 10, priceCents: 4999, imageUrl: upload('2026/03/img_0656.webp'), coaUrl: upload('2026/03/img_4632.webp'), productUrl: product('tb-500-research-peptide') },
  { productSlug: 'bpc-157-tb-500', mg: 10, priceCents: 5499, imageUrl: upload('2026/01/CCB1B77A-BDD0-4F05-A243-B464A3DC2300-600x600.png'), coaUrl: upload('2026/01/img_1494.webp'), productUrl: product('tb-500-bpc-157-wolverine-stack-peptide') },
  { productSlug: 'bpc-157-tb-500', mg: 20, priceCents: 9999, imageUrl: upload('2026/04/img_1978.png'), coaUrl: upload('2026/01/img_1494.webp'), productUrl: product('tb-500-bpc-157-wolverine-stack-peptide') },
  { productSlug: 'ghk-cu', mg: 100, priceCents: 4899, imageUrl: upload('2026/01/e962bf42-a88d-46fa-b23d-1900fd1b94b6-1024x1024.webp'), coaUrl: upload('2026/01/img_1501.webp'), productUrl: product('ghk-cu-100mg') },
  { productSlug: 'retatrutide', mg: 10, priceCents: 7499, imageUrl: upload('2026/01/FB72A685-3959-4DD4-A051-9269FDAA5205-600x600.png'), coaUrl: upload('2026/01/img_7094-1187x1536.webp'), productUrl: product('rt3') },
  { productSlug: 'retatrutide', mg: 20, priceCents: 12999, imageUrl: upload('2026/01/img_6200.jpeg'), coaUrl: upload('2026/01/img_7093-1187x1536.webp'), productUrl: product('rt3') },
  { productSlug: 'retatrutide', mg: 30, priceCents: 17999, imageUrl: upload('2026/01/img_6201.jpeg'), coaUrl: upload('2026/01/img_7092-1187x1536.webp'), productUrl: product('rt3') },
  { productSlug: 'retatrutide', mg: 60, priceCents: 25999, imageUrl: upload('2026/03/img_0653.png'), coaUrl: upload('2026/01/img_7091-1187x1536.webp'), productUrl: product('rt3') },
  { productSlug: 'tirzepatide', mg: 10, priceCents: 7999, imageUrl: upload('2026/01/IMG_9672-1-1-600x600.png'), coaUrl: upload('2026/01/img_7096-1187x1536.webp'), productUrl: product('2tz') },
  { productSlug: 'tirzepatide', mg: 30, priceCents: 13399, imageUrl: upload('2026/01/IMG_9673-1.png'), coaUrl: upload('2026/01/img_7095-1187x1536.webp'), productUrl: product('2tz') },
  { productSlug: 'tirzepatide', mg: 60, priceCents: 16399, imageUrl: upload('2026/01/IMG_9674-1.png'), coaUrl: upload('2026/01/img_1502.webp'), productUrl: product('2tz') },
  { productSlug: 'semaglutide', mg: 10, priceCents: 7999, imageUrl: upload('2026/01/880c8665-b75b-4168-9e5f-18332d106dc5-1024x1024.webp'), coaUrl: upload('2026/01/img_1507.webp'), productUrl: product('rivn-1sg') },
  { productSlug: 'semaglutide', mg: 20, priceCents: 9999, imageUrl: upload('2026/01/880c8665-b75b-4168-9e5f-18332d106dc5-1024x1024.webp'), coaUrl: upload('2026/01/img_1507.webp'), productUrl: product('rivn-1sg') },
  { productSlug: 'cagrilintide', mg: 10, priceCents: 9999, imageUrl: upload('2026/01/6722BAB0-7B8F-437F-ABDA-F25551332325.webp'), coaUrl: upload('2026/01/img_1505.webp'), productUrl: product('cagrilintide-10mg') },
  { productSlug: 'ipamorelin', mg: 10, priceCents: 4199, imageUrl: upload('2026/01/6D3287AF-052D-47A9-ADA9-5014865368FB.webp'), coaUrl: upload('2026/01/img_4637.webp'), productUrl: product('ipamorelin-10mg') },
  { productSlug: 'tesamorelin', mg: 5, priceCents: 4399, inStock: false, imageUrl: upload('2026/01/F61CF94B-E569-453C-AF6F-FA1427A834C9-600x600.png'), coaUrl: upload('2026/01/img_0364.webp'), productUrl: product('tesamorelin-2') },
  { productSlug: 'tesamorelin', mg: 10, priceCents: 7499, imageUrl: upload('2026/01/DEC57747-A129-430C-A034-6DBA7BE4A6B0-150x150.png'), coaUrl: upload('2026/03/img_7098-1187x1536.webp'), productUrl: product('tesamorelin-2') },
  { productSlug: 'sermorelin', mg: 10, priceCents: 6999, imageUrl: upload('2026/01/e622f665-36d6-450b-b98c-cb5afbc70ac6-1013x1024.webp'), coaUrl: upload('2026/01/img_1504.webp'), productUrl: product('semorelin-10mg') },
  { productSlug: 'nad', mg: 500, priceCents: 5699, imageUrl: upload('2026/01/img_1511.webp'), coaUrl: upload('2026/01/img_1495.webp'), productUrl: product('nad-500mg') },
  { productSlug: 'nad', mg: 1000, priceCents: 8999, imageUrl: upload('2026/04/img_1980.png'), coaUrl: upload('2026/01/img_7088-1187x1536.webp'), productUrl: product('nad-500mg') },
  { productSlug: 'mots-c', mg: 10, priceCents: 4799, imageUrl: upload('2026/01/7841A3D7-2648-45FB-A523-BC79D0D33C68.webp'), coaUrl: upload('2026/01/img_0416.webp'), productUrl: product('mots-c-10mg') },
  { productSlug: 'mots-c', mg: 40, priceCents: 9999, imageUrl: upload('2026/05/A94B70C7-6C61-457F-8A54-68D6D8425E58.png'), coaUrl: upload('2026/01/img_7089-1187x1536.webp'), productUrl: product('mots-c-10mg') },
  { productSlug: 'epitalon', mg: 10, priceCents: 3999, imageUrl: upload('2026/01/80906C40-C979-4464-A05E-B10DAD4AD537.webp'), coaUrl: upload('2026/01/img_0370.webp'), productUrl: product('epithalon-10mg') },
  { productSlug: 'semax', mg: 10, priceCents: 4499, imageUrl: upload('2026/01/84E720B2-458B-4B22-85F3-74B996032617.webp'), coaUrl: upload('2026/01/img_0368.webp'), productUrl: product('semax-10mg') },
  { productSlug: 'selank', mg: 10, priceCents: 4999, inStock: false, imageUrl: upload('2026/01/6EBF3925-CF6C-40C4-98AA-49469D8148F6.webp'), coaUrl: upload('2026/01/img_0369.webp'), productUrl: product('selank-10mg') },
  { productSlug: 'pt-141', mg: 10, priceCents: 3299, imageUrl: upload('2026/01/C6403F25-EE18-423E-B782-C2A16A372768.webp'), coaUrl: upload('2026/01/img_4628.webp'), productUrl: product('pt-141-10mg') },
  { productSlug: '5-amino-1mq', mg: 10, priceCents: 4499, imageUrl: upload('2026/01/f557f290-36f5-4209-9ea9-6ec6dca8aba9-1024x1024.webp'), coaUrl: upload('2026/01/img_0372.webp'), productUrl: product('5-amino-1mq-10mg') },
  { productSlug: 'ss-31-elamipretide', mg: 10, priceCents: 5999, imageUrl: upload('2026/05/59C46B89-F1ED-4439-B0F5-DD1022EDB13A-939x1024.webp'), coaUrl: upload('2026/05/img_4630.webp'), productUrl: product('ss-31-10mg') },
  { productSlug: 'dsip', mg: 5, priceCents: 3499, imageUrl: upload('2026/04/img_1979-1024x1024.webp'), coaUrl: upload('2026/04/img_4633.webp'), productUrl: product('dsip-5mg') },
  { productSlug: 'glutathione', mg: 600, priceCents: 3299, imageUrl: upload('2026/05/4709179E-6F20-4140-9C89-A49A11F03491-1024x1024.webp'), coaUrl: upload('2026/01/img_1496.webp'), productUrl: product('gluthathione-1500mg') },
  { productSlug: 'melanotan-2', mg: 10, priceCents: 3999, imageUrl: upload('2026/01/5F04FBEF-4C36-451C-B709-CC1B2B2D9233.webp'), coaUrl: upload('2026/01/img_1500.webp'), productUrl: product('melanotan-2-10mg') },
  { productSlug: 'cjc-1295-no-dac', mg: 5, priceCents: 3999, inStock: false, imageUrl: upload('2026/05/43AEC979-D0DD-40BC-ACDD-8ECDD815F6FA.png'), coaUrl: null, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'cjc-1295-no-dac', mg: 10, priceCents: 4999, inStock: false, imageUrl: upload('2026/05/36E140FB-2AD7-4BC3-9655-A2BFAD306A20.png'), coaUrl: null, productUrl: product('cjc-1295-no-dac') },
  { productSlug: 'ipamorelin-cjc-1295-no-dac', mg: 10, priceCents: 6499, imageUrl: upload('2026/01/146149CB-1FE5-499D-BC49-035AF8F0C0EC.webp'), coaUrl: upload('2026/01/img_7085-1187x1536.webp'), productUrl: product('cjc-1295-no-dac-ipamorelin-10mg') },
  { productSlug: 'glow-ghk-cu-bpc-157-tb-500', mg: 70, priceCents: 9999, imageUrl: upload('2026/01/b8b5c99e-2c2a-45dd-8285-5cb6d506af87-1024x1024.webp'), coaUrl: upload('2026/01/img_1503.webp'), productUrl: product('glwo-70mg') },
  { productSlug: 'klow-bpc-157-tb-500-kpv-ghk-cu', mg: 80, priceCents: 13499, imageUrl: upload('2026/01/b31f95b1-d2a3-4c3b-b09a-3a60c7d21b52-1024x1024.webp'), coaUrl: upload('2026/01/img_1499.webp'), productUrl: product('klow-80mg') },
];

runSeed({ supplierSlug: 'rivn-research-2', listings });
