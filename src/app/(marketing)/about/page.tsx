import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { CheckBadgeIcon, ExternalIcon, GlobeIcon, ShieldCheckIcon } from '@/components/icons/icons';
import { AccentedHeading } from '@/components/ui/accented-heading';

const PAGE = staticSeoPage('/about');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const PRINCIPLES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Real numbers or none at all',
    body: 'Every price on this site carries the time it was last observed. We show empty states rather than a placeholder price, a fabricated review count, or a mocked-up COA.',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
  },
  {
    title: 'Ranked by price, not commission',
    body: 'When we do earn a commission from a listed supplier, it never changes the price a buyer pays and never changes where that supplier ranks. That policy is disclosed on every page it applies to.',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
  },
  {
    title: 'We are a comparison tool, not a seller',
    body: `${site.name} does not manufacture, sell, or ship anything. Every purchase happens directly between you and a third-party supplier, see our full disclaimer for the details.`,
    icon: <GlobeIcon className="h-5 w-5" />,
  },
];

export default async function AboutPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14 sm:pt-16">
        <section className="mx-auto max-w-4xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            About {site.name}
          </span>
          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 ? (
              <AccentedHeading text={seo.h1} />
            ) : (
              <>
                Compare before you <span className="text-accent">buy.</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {site.description}
          </p>
          <p className="animate-fade-up animate-delay-300 mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            {site.tagline} We built {site.name} because comparing peptide pricing across suppliers meant
            opening a dozen tabs and doing the cost-per-mg math by hand, normalising every listing down
            to one number lets you see the real comparison in one place.
          </p>
        </section>

        <section className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="tilt-card flex flex-col rounded-card border border-line bg-surface-raised p-6 shadow-card hover:border-accent/40 sm:p-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong shadow-sm">
                {principle.icon}
              </span>
              <h2 className="mt-4 text-lg font-black text-content">{principle.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{principle.body}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-12 max-w-4xl rounded-panel border border-accent/25 bg-accent-tint p-8 text-center shadow-card sm:p-10">
          <h2 className="text-2xl font-black text-content sm:text-3xl">
            Join the research <span className="text-accent">community</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Discuss protocols, share verified suppliers and swap notes with other researchers in our
            Skool community.
          </p>
          <a
            href="https://www.skool.com/peptide-5115/about"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="btn-3d mt-6 inline-flex items-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Join the community
            <ExternalIcon className="h-4 w-4" />
          </a>
        </section>

        <section className="mx-auto mt-12 max-w-4xl rounded-panel border border-line bg-surface-raised p-8 text-center shadow-card sm:p-10">
          <h2 className="text-lg font-black text-content sm:text-xl">Questions, corrections or partnerships?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            We read every message. Reach us on the{' '}
            <Link href="/contact" className="font-semibold text-brand hover:underline">
              contact page
            </Link>{' '}
            or at{' '}
            <a href={`mailto:${site.contactEmail}`} className="font-semibold text-brand hover:underline">
              {site.contactEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
