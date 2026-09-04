import Link from 'next/link';
import { primaryNav, site } from '@/config/site';
import { ChevronDownIcon } from '@/components/icons/icons';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${site.name} home`}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-pill border-2 border-brand text-sm font-black text-brand"
      >
        P
      </span>
      <span className="text-xl font-black tracking-tight">
        <span className="text-content">{site.nameParts.lead}</span>
        <span className="text-brand">{site.nameParts.tail}</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-shell items-center gap-4 px-4 py-3">
        <Wordmark />

        <nav aria-label="Primary" className="hidden flex-1 justify-center xl:flex">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-chip px-2.5 py-2 text-sm font-medium text-content transition hover:text-brand"
                >
                  {item.label}
                  {item.children ? (
                    <ChevronDownIcon className="h-3.5 w-3.5 text-faint transition group-hover:rotate-180" />
                  ) : null}
                </Link>

                {item.children ? (
                  // Hover-and-focus reveal: focus-within keeps the submenu
                  // reachable by keyboard, not just by pointer.
                  <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="rounded-card border border-line bg-surface-raised p-2 shadow-lift">
                      {item.childrenHeading ? (
                        <p className="px-3 py-1.5 text-micro font-bold uppercase text-faint">
                          {item.childrenHeading}
                        </p>
                      ) : null}
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.href + child.label}>
                            <Link
                              href={child.href}
                              className="block rounded-chip px-3 py-2 hover:bg-surface-sunken"
                            >
                              <span className="block text-sm font-semibold text-content">
                                {child.label}
                              </span>
                              {child.hint ? (
                                <span className="block text-xs text-muted">{child.hint}</span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
