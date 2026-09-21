import Link from 'next/link';
import { footerNav, site, whatsappUrl } from '@/config/site';
import { LogoMark } from '@/components/layout/logo-mark';
import packageJson from '../../../package.json';

export function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer
      // Mobile keeps the newer treatment (narrow side margins, halved vertical
      // margin, rounded-panel). From sm up it reverts to what it was before
      // that: an even 30px margin all round with the larger rounded-box radius.
      className="relative mx-4 my-[15px] overflow-hidden rounded-panel border border-footer-border bg-surface-sunken shadow-panel sm:m-30 sm:rounded-box"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
      />
      <div className="mx-auto max-w-shell px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-10">
          <h2 className="max-w-xl text-[clamp(2.25rem,6vw,4rem)] font-black leading-[0.95] text-content">
            Compare before you <span className="text-accent">buy.</span>
          </h2>
          <a
            href={`mailto:${site.contactEmail}`}
            className="inline-flex items-center rounded-pill border border-line bg-surface-raised px-5 py-3 text-sm font-bold text-content shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
          >
            {site.contactEmail}
          </a>
        </div>

        {/* Two link columns on phones: stacked one-per-row, the five groups
            alone ran well over a screen and a half. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <span className="flex items-center gap-2 text-xl font-black tracking-tight">
              <LogoMark size={28} className="rounded-pill" />
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted">{site.tagline}</p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-3 block break-all text-sm font-semibold text-brand-strong hover:underline"
            >
              {site.contactEmail}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm font-semibold text-brand-strong hover:underline"
            >
              WhatsApp {site.whatsapp}
            </a>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-labelledby={`footer-${group.heading}`}>
              <h2
                id={`footer-${group.heading}`}
                className="eyebrow flex items-center gap-2"
              >
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
                {group.heading}
              </h2>
              <ul className="mt-3 space-y-1">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="-mx-2 block rounded-chip px-2 py-1 text-sm text-muted transition-colors hover:bg-brand hover:text-surface"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-faint">
          <span>
            © {year} {site.name}. All rights reserved.
          </span>
          <span>v{packageJson.version}</span>
        </div>

        {/* Oversized faded wordmark, purely decorative, so hidden from screen
            readers to avoid announcing the site name a second time. */}
        <div aria-hidden="true" className="overflow-hidden pt-10 text-center">
          <span className="block bg-gradient-to-b from-content to-content/0 bg-clip-text text-4xl font-black uppercase leading-none tracking-tight text-transparent sm:text-6xl lg:text-8xl">
            {site.name}.
          </span>
        </div>
      </div>
    </footer>
  );
}
