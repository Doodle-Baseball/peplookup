import Image from 'next/image';
import { getOffersForSupplier, getSupplier } from '@/lib/repository';
import { ArrowRightIcon, CheckIcon } from '@/components/icons/icons';

const SUPPLIER_SLUG = 'hospira-bacteriostatic-water';

/** The supplier's own cut-out photo of the 30 mL vial, label facing out. */
const VIAL_IMAGE_URL = 'https://hospirabacteriostaticwater.com/wp-content/uploads/2026/07/Hospira-Basteriostatic-Water-2.webp';

/** Each is printed on the vial's label. */
const FEATURES: readonly string[] = ['0.9% benzyl alcohol', 'USP grade, sterile', '30 mL multi-dose'];

/**
 * Home page banner for Hospira Bacteriostatic Water: the vial photo in a
 * panel on the left, the pitch and one button to the single-vial listing on
 * the right. Renders nothing when the supplier is inactive or has no single
 * vial in stock, so the button never leads to a dead listing.
 */
export async function HospiraPromoSection() {
  const [supplier, offers] = await Promise.all([getSupplier(SUPPLIER_SLUG), getOffersForSupplier(SUPPLIER_SLUG)]);
  if (!supplier?.isActive) return null;

  const singleVial = offers.find((offer) => offer.inStock && offer.form === 'vial' && offer.vialCount === 1);
  if (!singleVial) return null;

  return (
    <div className="mx-auto max-w-shell px-4 pb-6 sm:pb-8">
      <section aria-labelledby="hospira-promo-heading" className="panel-dark relative overflow-hidden rounded-panel shadow-panel">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative grid lg:grid-cols-3">
          <div className="flex items-center justify-center bg-black/30 p-6 sm:p-8">
            <div className="relative flex aspect-square w-full max-w-xs justify-center">
              <Image
                src={VIAL_IMAGE_URL}
                alt={`${supplier.name} 30 mL multiple-dose vial`}
                width={640}
                height={640}
                className="vial-3d h-full w-full object-contain"
                unoptimized
                referrerPolicy="no-referrer"
              />
              <span aria-hidden="true" className="vial-3d-shadow absolute -bottom-2 h-4 w-40 rounded-pill" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:col-span-2 lg:p-12">
            <p className="eyebrow flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
              Bac water for peptides
            </p>
            <h2 id="hospira-promo-heading" className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              Your peptides deserve <span className="text-accent-soft">genuine Hospira</span> bac water.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Hospira Bacteriostatic Water for Injection, USP: sterile, non-pyrogenic and preserved with 0.9% benzyl
              alcohol, in sealed 30 mL Hospira vials rather than repackaged generic stock.
            </p>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <CheckIcon className="h-4 w-4 shrink-0 text-accent-soft" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <a
                href={singleVial.productUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="inline-flex items-center justify-center gap-2 rounded-chip bg-white px-6 py-3.5 text-sm font-bold text-content shadow-lift transition-transform hover:-translate-y-0.5"
              >
                Shop Hospira bac water
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
                <span className="sr-only">(affiliate link, opens in a new tab)</span>
              </a>
              <p className="text-xs text-white/50">Featured supplier · For research use only.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
