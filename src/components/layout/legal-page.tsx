import type { ReactNode } from 'react';
import Link from 'next/link';
import { site } from '@/config/site';
import { ArrowRightIcon, MailIcon, ShieldCheckIcon } from '@/components/icons/icons';

export interface LegalSection {
  /** Anchor target, also used by the contents list. */
  id: string;
  heading: string;
  body: ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  titleAccent,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  /** Rendered after the title in the accent colour, e.g. a trailing word. */
  titleAccent?: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14">
        <header>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            {eyebrow}
          </span>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
            {title}
            {titleAccent ? <span className="italic text-brand"> {titleAccent}</span> : null}
          </h1>

          <p className="mt-4 inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            Last updated {updated}
          </p>

          <div className="mt-6 space-y-3 text-base leading-relaxed text-muted">{intro}</div>
        </header>

        <nav aria-label="On this page" className="mt-10 rounded-card border border-line bg-surface-raised p-5 shadow-card sm:p-6">
          <h2 className="eyebrow">On this page</h2>
          <ol className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex items-baseline gap-2 rounded-chip py-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent-strong"
                >
                  <span className="text-xs font-black tabular-nums text-faint transition-colors group-hover:text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-24 rounded-card border border-line bg-surface-raised p-5 shadow-card sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-sm font-black tabular-nums text-accent-strong">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id={`${section.id}-heading`} className="text-lg font-black text-content sm:text-xl">
                    {section.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{section.body}</div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-card border border-brand/20 bg-brand-tint p-6 text-center sm:p-8">
          <h2 className="text-xl font-black text-content">Questions about this page?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            We read every message. Reach the {site.name} team and we will get back to you.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="btn-3d inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
            >
              Contact us
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href={`mailto:${site.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
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
