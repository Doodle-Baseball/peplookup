// Adds Hospira Bacteriostatic Water's listings, as supplied from hospirabacteriostaticwater.com,
// to the Supabase `offers` table. See scripts/lib/seed-vendor-offers.js.
// Water sizes are in ml, stored on the same `mg` field, matching the convention used for other
// vendors' water. Packs store the single 30ml vial with `count` vials and the pack price.
// No COA link or stock status was supplied, so listings carry no COA and take the shared
// default (in stock). The supplier's link carries no referral code, so URLs are as supplied.
const { runSeed } = require('./lib/seed-vendor-offers');

const image = (file) => `https://hospirabacteriostaticwater.com/wp-content/uploads/2026/07/${file}`;
const product = (slug) => `https://hospirabacteriostaticwater.com/product/${slug}/`;

const listings = [
  { productSlug: 'bacteriostatic-water', mg: 30, priceCents: 2299, imageUrl: image('Hospira-Bacteriostatic-Water-30ml-Single-Vial.webp'), coaUrl: null, productUrl: product('hospira-bacteriostatic-water-30ml-1-vial') },
  { productSlug: 'bacteriostatic-water', mg: 30, count: 5, priceCents: 10995, imageUrl: image('Hospira-Bacteriostatic-Water-30ml-5-Vial.webp'), coaUrl: null, productUrl: product('hospira-bacteriostatic-water-30ml-5-vial-pack') },
  { productSlug: 'bacteriostatic-water', mg: 30, count: 10, priceCents: 19999, imageUrl: image('Hospira-Bacteriostatic-Water-30ml-10-ViaL.webp'), coaUrl: null, productUrl: product('hospira-bacteriostatic-water-30ml-10-vial-pack') },
  { productSlug: 'bacteriostatic-water', mg: 30, count: 25, priceCents: 39999, imageUrl: image('Hospira-Bacteriostatic-Water-30ml-25-Vial-Pack-1.webp'), coaUrl: null, productUrl: product('hospira-bacteriostatic-water-30ml-25-vial-pack') },
  { productSlug: 'bacteriostatic-water', mg: 30, count: 100, priceCents: 204900, imageUrl: image('Hospira-Bacteriostatic-Water-30ml-100-Vial-Wholesale.webp'), coaUrl: null, productUrl: product('hospira-bacteriostatic-water-30ml-100-vial-pack') },
];

runSeed({ supplierSlug: 'hospira-bacteriostatic-water', listings });
