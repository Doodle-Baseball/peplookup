import Link from 'next/link';
import { footerNav, site } from '@/config/site';

export function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-16 border-t border-line bg-surface-sunken">
      <div className="mx-auto max-w-shell px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <span className="text-xl font-black tracking-tight">
              <span className="text-content">{site.nameParts.lead}</span>
              <span className="text-brand">{site.nameParts.tail}</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted">{site.tagline}</p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-3 inline-block text-sm font-semibold text-brand-strong hover:underline"
            >
              {site.contactEmail}
            </a>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-labelledby={`footer-${group.heading}`}>
              <h2
                id={`footer-${group.heading}`}
                className="text-micro font-bold uppercase text-faint"
              >
                {group.heading}
              </h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-muted hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 space-y-3 border-t border-line pt-6 text-xs text-faint">
          <p className="font-semibold text-muted">
            © {year} {site.name}. All rights reserved.
          </p>
          <p>
            All products listed on this site are for research and development use only, and are not
            for human or animal consumption.
          </p>
          <p>
            Statements on this site have not been evaluated by the U.S. Food and Drug
            Administration, and are not intended to diagnose, treat, cure or prevent any disease.
          </p>
          <p>
            {site.name} is a price comparison platform. We do not manufacture, compound, sell or
            ship any products, and we are not a party to any transaction between a buyer and a
            supplier. We may earn a commission from links to suppliers; this never affects how
            listings are ranked. See our{' '}
            <Link href="/disclaimer" className="underline hover:text-muted">
              disclaimer
            </Link>{' '}
            for details.
          </p>
        </div>
      </div>
    </footer>
  );
}
