import Image from 'next/image';
import Link from 'next/link';
import { getOffersForSupplier, getSupplier } from '@/lib/repository';
import { toListing } from '@/lib/listing';
import { effectivePrice } from '@/lib/price';
import { cents, formatMoney } from '@/lib/money';
import { seenAgo } from '@/lib/format';
import { ArrowRightIcon, CheckIcon, DropletIcon, ExternalIcon } from '@/components/icons/icons';

const SUPPLIER_SLUG = 'hospira-bacteriostatic-water';

/** "1, 5, 10 or 25" style list of pack sizes. */
function listCounts(counts: readonly number[]): string {
  if (counts.length <= 1) return counts.join('');
  return `${counts.slice(0, -1).join(', ')} or ${counts[counts.length - 1]}`;
}

/** A shipping note from the supplier's profile, written as a sentence. */
function shippingFeature(note: string): string {
  if (/^u\.?s\.? only$/i.test(note)) return 'Ships within the U.S. only';
  return note.charAt(0).toUpperCase() + note.slice(1);
}

/**
 * Home page feature for Hospira Bacteriostatic Water: its single 30 mL vial
 * floating on a light stage inside a dark panel, beside the supplier's listed
 * facts. Prices, pack sizes and shipping are read from its live listings and
 * profile. Renders nothing when the supplier is inactive or has no single
 * vial in stock.
 */
export async function HospiraPromoSection() {
  const [supplier, offers] = await Promise.all([getSupplier(SUPPLIER_SLUG), getOffersForSupplier(SUPPLIER_SLUG)]);
  if (!supplier?.isActive) return null;

  const inStock = offers.filter((offer) => offer.inStock && offer.form === 'vial');
  const singleVial = inStock.find((offer) => offer.vialCount === 1);
  if (!singleVial) return null;

  const singleVialPrice = effectivePrice(toListing(singleVial));
  // Compared at full precision; rounded to cents only for display.
  const cheapestPerVial = inStock.reduce(
    (best, offer) => {
      const perVial = effectivePrice(toListing(offer)) / offer.vialCount;
      return perVial < best.perVial ? { perVial, vialCount: offer.vialCount } : best;
    },
    { perVial: singleVialPrice as number, vialCount: 1 },
  );
  const packCounts = [...new Set(inStock.map((offer) => offer.vialCount))].sort((a, b) => a - b);
  // Water volumes are stored in ml on the mg field.
  const vialMl = (singleVial.vialSize / 1000).toLocaleString('en-US');
  const shippingNotes = (supplier.shippingSpeed ?? '')
    .split(';')
    .map((note) => note.trim())
    .filter(Boolean)
    .map(shippingFeature);

  const features = [
    `${vialMl} mL vials with 0.9% benzyl alcohol`,
    packCounts.length > 1 ? `Sold singly or in packs of ${listCounts(packCounts.filter((count) => count > 1))}` : null,
    ...shippingNotes,
  ].filter((feature): feature is string => feature !== null);

  return (
    <div className="mx-auto max-w-shell px-4 pb-6 sm:pb-8">
      <section aria-labelledby="hospira-promo-heading" className="panel-dark relative overflow-hidden rounded-panel shadow-panel">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative grid items-center gap-8 p-4 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
          <div className="card-3d relative flex h-72 items-center justify-center overflow-hidden rounded-card bg-surface-raised sm:h-96">
            <span aria-hidden="true" className="absolute h-56 w-56 rounded-full bg-accent/15 blur-3xl sm:h-72 sm:w-72" />
            <span aria-hidden="true" className="absolute h-60 w-60 rounded-full border border-line sm:h-80 sm:w-80" />
            <span aria-hidden="true" className="absolute h-44 w-44 rounded-full border border-line sm:h-60 sm:w-60" />

            <div className="card-3d-layer relative flex h-full w-full items-center justify-center">
              {singleVial.imageUrl ? (
                <Image
                  src={singleVial.imageUrl}
                  alt={`${supplier.name} ${vialMl} mL single vial`}
                  width={320}
                  height={320}
                  className="vial-3d vial-3d-matte relative h-56 w-56 object-contain mix-blend-multiply sm:h-72 sm:w-72"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              ) : (
                <DropletIcon className="vial-3d h-20 w-20 text-faint" />
              )}
              <span aria-hidden="true" className="vial-3d-shadow absolute bottom-6 h-4 w-40 rounded-pill sm:bottom-8" />
            </div>

            <span className="absolute left-4 top-4 rounded-pill border border-line bg-surface px-3 py-1 font-mono text-micro font-bold uppercase tracking-wide text-content">
              {vialMl} mL vial
            </span>
            <span className="absolute bottom-4 right-4 rounded-chip bg-brand px-3.5 py-2 text-right text-surface shadow-lift">
              <span className="block text-micro font-bold uppercase tracking-wide text-surface/70">From</span>
              <span className="block text-lg font-black leading-tight">{formatMoney(singleVialPrice, singleVial.currency)}</span>
            </span>
          </div>

          <div className="min-w-0 px-1 pb-2 sm:px-0 sm:pb-0">
            <p className="eyebrow">Featured supplier · Bacteriostatic water</p>
            <h2 id="hospira-promo-heading" className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              {supplier.name}, <span className="text-accent-soft">by the vial or by the case.</span>
            </h2>
            {supplier.description ? (
              <p className="mt-4 max-w-xl text-base leading-7 text-white/65">{supplier.description}</p>
            ) : null}

            <ul className="mt-6 grid gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm font-semibold leading-6 text-white/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {cheapestPerVial.vialCount > 1 ? (
              <p className="mt-6 text-sm text-white/65">
                As low as{' '}
                <span className="font-bold text-white">
                  {formatMoney(cents(cheapestPerVial.perVial), singleVial.currency)} a vial
                </span>{' '}
                in packs of {cheapestPerVial.vialCount}.
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:items-center">
              <a
                href={singleVial.productUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-content shadow-lift transition-transform hover:-translate-y-0.5"
              >
                Shop now
                <ExternalIcon className="h-4 w-4 shrink-0" />
                <span className="sr-only">at {supplier.name} (affiliate link, opens in a new tab)</span>
              </a>
              <Link
                href={`/suppliers/${supplier.slug}`}
                className="group inline-flex items-center justify-center gap-1.5 rounded-pill border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white/50"
              >
                View profile
                <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/50">
              Price updated {seenAgo(singleVial.scrapedAt, new Date())} · For research use only.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
