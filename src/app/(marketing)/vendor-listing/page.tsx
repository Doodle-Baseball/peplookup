import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { VENDOR_LISTING_CONTACT } from '@/config/vendor-listing';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getSuppliers } from '@/lib/repository';
import { VendorListingPlans } from '@/components/vendor-listing/vendor-listing-plans';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentIcon,
  GlobeIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  StoreIcon,
} from '@/components/icons/icons';

const PAGE = staticSeoPage('/vendor-listing');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const STEPS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Choose a plan',
    body: 'Basic for a monthly listing, or Pro for a year of extra visibility and promotion.',
    icon: <StoreIcon className="h-6 w-6" />,
  },
  {
    title: 'Apply and pay securely',
    body: 'Tell us about your brand, then complete payment on Whop. Your card details never touch our site.',
    icon: <LockIcon className="h-6 w-6" />,
  },
  {
    title: 'We set up your listing',
    body: `${VENDOR_LISTING_CONTACT.name} contacts you within ${VENDOR_LISTING_CONTACT.responseWindow} and adds your brand to ${site.name}.`,
    icon: <CheckBadgeIcon className="h-6 w-6" />,
  },
];

const PRINCIPLES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Prices stay honest',
    body: 'Cost per mg is calculated from the brand’s published price and pack size. A plan never changes a price, a pack size or a cost-per-mg figure.',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
  },
  {
    title: 'Plans are what you see',
    body: 'Basic and Pro are described in full above. Plans differ in visibility, promotion and support, and nothing else.',
    icon: <GlobeIcon className="h-5 w-5" />,
  },
  {
    title: 'Corrections are free',
    body: 'We fix a wrong price or a dead link whether or not you are a paying brand. Accuracy is the product.',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
  },
];

const PREPARE: { text: string; icon: React.ReactNode }[] = [
  {
    text: 'A public product page per item, with the price and pack size readable without an account.',
    icon: <StoreIcon className="h-4 w-4" />,
  },
  {
    text: 'Certificates of analysis published at stable links, named by product and batch.',
    icon: <DocumentIcon className="h-4 w-4" />,
  },
  {
    text: 'A note when pricing, sizes or stock change materially, so listings do not go stale.',
    icon: <ClockIcon className="h-4 w-4" />,
  },
  {
    text: 'A correction, any time you see something wrong on your profile.',
    icon: <MailIcon className="h-4 w-4" />,
  },
];

export default async function VendorListingPage() {
  const [seo, suppliers] = await Promise.all([getSeoOverride(PAGE.path), getSuppliers()]);

  const trustPoints = [
    `${suppliers.length} suppliers tracked`,
    'Secure checkout by Whop',
    `Listing set up within ${VENDOR_LISTING_CONTACT.responseWindow}`,
  ];

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-drift absolute left-1/2 top-0 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="animate-drift-reverse absolute -right-24 top-96 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-20">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-pill border border-accent/20 bg-accent-tint px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-strong">
            <StoreIcon className="h-3.5 w-3.5" />
            Vendor Listing
          </span>
          <h1 className="animate-fade-up animate-delay-100 mt-5 text-3xl font-black leading-tight tracking-tight text-content min-[400px]:text-4xl sm:text-5xl lg:text-6xl">
            {seo?.h1 ? seo.h1 : <>List your brand on <span className="italic text-accent">{site.name}.</span></>}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Get your brand compared by cost per mg next to other suppliers, with a dedicated brand page, your
            commission and discount details, and, on Pro, promotion across our community and platforms.
          </p>
          <div className="animate-fade-up animate-delay-300 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="#plans"
              className="btn-3d inline-flex items-center justify-center gap-2 rounded-chip bg-brand px-7 py-3.5 text-sm font-bold text-white"
            >
              View plans
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-chip border border-line bg-surface-raised px-7 py-3.5 text-sm font-bold text-content shadow-card transition-colors hover:border-brand"
            >
              <MailIcon className="h-4 w-4" />
              Talk to us first
            </Link>
          </div>
          <ul className="animate-fade-up animate-delay-400 mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm font-semibold text-content">
                <CheckCircleIcon className="h-4 w-4 text-ok" />
                {point}
              </li>
            ))}
          </ul>
        </header>

        {/* Plans */}
        <section id="plans" aria-labelledby="plans-heading" className="mt-14 scroll-mt-20 sm:mt-20 sm:scroll-mt-24">
          <div className="text-center">
            <p className="text-micro font-bold uppercase tracking-wide text-faint">Plans &amp; Pricing</p>
            <h2 id="plans-heading" className="mt-2 text-2xl font-black tracking-tight text-content sm:text-3xl">
              Simple, transparent <span className="text-accent">pricing.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Select the plan that fits your brand, share your details and complete a secure payment through
              Whop. Our team takes care of everything from there.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <VendorListingPlans />
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="mt-16 sm:mt-24">
          <div className="text-center">
            <p className="text-micro font-bold uppercase tracking-wide text-faint">How it works</p>
            <h2 id="how-heading" className="mt-2 text-2xl font-black tracking-tight text-content sm:text-3xl">
              Three steps to <span className="text-accent">listed.</span>
            </h2>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="card-3d animate-fade-up relative rounded-panel border border-line bg-surface-raised p-6"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-card bg-brand-soft text-brand-strong">
                    {step.icon}
                  </span>
                  <span className="font-mono text-4xl font-black text-line">{index + 1}</span>
                </span>
                <h3 className="mt-5 text-lg font-black text-content">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What stays the same */}
        <section aria-labelledby="principles-heading" className="mt-16 sm:mt-24">
          <div className="text-center">
            <p className="text-micro font-bold uppercase tracking-wide text-faint">Our commitments</p>
            <h2 id="principles-heading" className="mt-2 text-2xl font-black tracking-tight text-content sm:text-3xl">
              What <span className="text-accent">doesn&rsquo;t</span> change with a plan.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                className="card-3d rounded-panel border border-line bg-surface-raised p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-chip bg-accent-soft text-accent-strong">
                  {principle.icon}
                </span>
                <h3 className="mt-4 font-black text-content">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{principle.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prepare */}
        <section aria-labelledby="prepare-heading" className="mt-16 sm:mt-24">
          <div className="rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8 lg:p-10">
            <div className="grid gap-8 md:grid-cols-5">
              <div className="md:col-span-2">
                <p className="text-micro font-bold uppercase tracking-wide text-faint">Before you apply</p>
                <h2 id="prepare-heading" className="mt-2 text-2xl font-black tracking-tight text-content">
                  What helps your listing <span className="text-accent">most.</span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  If you sell research compounds and want your catalogue compared accurately, these matter in
                  rough order.
                </p>
              </div>
              <ul className="space-y-3 md:col-span-3">
                {PREPARE.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 text-sm leading-relaxed text-content"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Disclosure */}
        <section className="mt-10 rounded-card border border-line bg-surface-raised p-5 sm:mt-12 sm:p-6">
          <h2 className="text-lg font-black text-content">Affiliate disclosure</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Some outbound links on {site.name} are affiliate links, meaning we may earn a commission if you
            buy through them, at no extra cost to you. This is how the site pays for itself. It does not
            change prices or which suppliers we list. The full disclosure sits in our{' '}
            <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
              legal disclaimer
            </Link>{' '}
            and the{' '}
            <Link href="/terms" className="font-semibold text-accent hover:underline">
              terms of service
            </Link>
            .
          </p>
        </section>

        {/* Closing call to action */}
        <section className="relative mt-10 overflow-hidden rounded-panel bg-brand p-6 text-center shadow-panel sm:mt-12 sm:p-12">
          <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-10" />
          <h2 className="relative text-2xl font-black tracking-tight text-white sm:text-3xl">
            Ready to get listed?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            Pick a plan and apply in two minutes, or write to us with any question first.
          </p>
          <div className="relative mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="#plans"
              className="inline-flex items-center justify-center gap-2 rounded-chip bg-surface-raised px-7 py-3.5 text-sm font-bold text-content shadow-lift transition-transform hover:-translate-y-0.5"
            >
              Choose a plan
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.contactEmail}`}
              className="inline-flex items-center justify-center gap-2 break-all rounded-chip border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <MailIcon className="h-4 w-4" />
              {site.contactEmail}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
