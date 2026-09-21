import Link from 'next/link';
import { site } from '@/config/site';
import {
  ArrowRightIcon,
  BoxIcon,
  DocumentIcon,
  FlaskIcon,
  SearchIcon,
  StoreIcon,
} from '@/components/icons/icons';

/**
 * Shared body of the 404 page. Lives in a component because the App Router
 * resolves two separate boundaries: unmatched URLs hit the root not-found,
 * which renders outside the marketing layout, while a `notFound()` thrown by a
 * supplier/product/guide page hits the one inside it.
 */

const DESTINATIONS: { href: string; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    href: '/suppliers',
    label: 'Supplier directory',
    hint: 'Compare vendors, shipping and verification',
    icon: <StoreIcon className="h-5 w-5" />,
  },
  {
    href: '/price-checker',
    label: 'Price checker',
    hint: 'Every compound, normalised to cost per mg',
    icon: <BoxIcon className="h-5 w-5" />,
  },
  {
    href: '/lab-reports',
    label: 'Lab reports',
    hint: 'Third-party COA results by vendor',
    icon: <FlaskIcon className="h-5 w-5" />,
  },
  {
    href: '/guides',
    label: 'Research guides',
    hint: 'How COAs, pricing and handling actually work',
    icon: <DocumentIcon className="h-5 w-5" />,
  },
];

export function NotFoundContent() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <p className="eyebrow">Error 404</p>

        <p
          aria-hidden="true"
          className="mt-4 text-[clamp(5rem,22vw,11rem)] font-black leading-none tracking-tight text-brand/15"
        >
          404
        </p>

        <h1 className="-mt-4 text-3xl font-black tracking-tight text-content sm:-mt-8 sm:text-5xl">
          This page could not be <span className="italic text-brand">found.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
          The link may be out of date, or the page may have been renamed. Nothing on {site.name} is gone for
          good. Search for a compound or vendor below, or pick up from one of the sections.
        </p>

        <form action="/price-checker" method="get" role="search" className="mx-auto mt-8 max-w-lg">
          <label htmlFor="not-found-search" className="sr-only">
            Search compounds and vendors
          </label>
          <div className="search-field flex items-center gap-3 border px-4 py-3">
            <SearchIcon className="h-5 w-5 shrink-0 text-accent" />
            <input
              id="not-found-search"
              name="q"
              type="search"
              placeholder="Search a compound or vendor…"
              className="min-w-0 flex-1 bg-transparent text-sm text-content outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              className="shrink-0 rounded-pill bg-brand px-4 py-2 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
            >
              Search
            </button>
          </div>
        </form>

        <ul className="mt-10 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {DESTINATIONS.map((destination) => (
            <li key={destination.href}>
              <Link
                href={destination.href}
                className="group flex h-full items-start gap-3 rounded-card border border-line bg-surface-raised p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                  {destination.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-black text-content">
                    {destination.label}
                    <ArrowRightIcon className="h-3.5 w-3.5 text-accent transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{destination.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted">
          Landed here from a link on this site?{' '}
          <Link href="/contact" className="font-semibold text-brand hover:underline">
            Tell us
          </Link>{' '}
          and we will fix it.
        </p>

        <Link
          href="/"
          className="btn-3d mt-6 inline-flex items-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
        >
          Back to {site.name}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
