import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { BoltIcon, CheckBadgeIcon, ExternalIcon, GlobeIcon, ShieldCheckIcon } from '@/components/icons/icons';

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
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
          <BoltIcon className="h-3.5 w-3.5" />
          About {site.name}
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? (
            seo.h1
          ) : (
            <>
              Compare before you <span className="italic text-brand">buy.</span>
            </>
          )}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{site.description}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {site.tagline} We built {site.name} because comparing peptide pricing across suppliers meant
          opening a dozen tabs and doing the cost-per-mg math by hand, normalising every listing down
          to one number lets you see the real comparison in one place.
        </p>

        <section className="mt-12 space-y-5">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="flex gap-4 rounded-card border border-line bg-surface-raised p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                {principle.icon}
              </span>
              <div>
                <h2 className="font-black text-content">{principle.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{principle.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-card border border-brand/20 bg-brand-tint p-8 text-center">
          <h2 className="text-xl font-black text-content">Join the research community</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Discuss protocols, share verified suppliers and swap notes with other researchers in our
            Skool community.
          </p>
          <a
            href="https://www.skool.com/peptide-5115/about"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-3d mt-5 inline-flex items-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Join the community
            <ExternalIcon className="h-4 w-4" />
          </a>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-lg font-black text-content">Questions, corrections or partnerships?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
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
