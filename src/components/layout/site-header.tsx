import Link from 'next/link';
import { primaryNav, site } from '@/config/site';
import { ChevronDownIcon, HeartIcon } from '@/components/icons/icons';
import { MobileNav } from '@/components/layout/mobile-nav';
import { WatchlistCountBadge } from '@/components/layout/watchlist-count-badge';
import { LogoMark } from '@/components/layout/logo-mark';
import { NavLink } from '@/components/layout/nav-link';

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${site.name} home`}>
      <LogoMark size={32} className="h-6 w-auto rounded-pill sm:h-8" />
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-2 sm:top-3 sm:px-4">
      <div className="relative mx-auto flex w-full max-w-shell items-center gap-2 rounded-2xl border border-line bg-surface-raised/80 px-2.5 py-2 shadow-lift backdrop-blur-xl supports-[backdrop-filter]:bg-surface-raised/70 sm:gap-4 sm:px-5 sm:rounded-pill">
        <Wordmark />

        {/* xl, not lg: the eight uppercase items wrap to two rows and push the
            page wider than the viewport below ~1280px. */}
        <nav aria-label="Primary" className="hidden flex-1 justify-center xl:flex">
          <ul className="flex items-center gap-0.5">
            {primaryNav.map((item) => (
              <li key={item.label} className="group relative">
                <NavLink
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-pill px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-content transition-colors hover:bg-brand hover:text-surface"
                  activeClassName="bg-brand text-surface"
                >
                  {item.label}
                  {item.children ? (
                    <ChevronDownIcon className="h-3.5 w-3.5 text-faint transition-colors group-hover:rotate-180 group-hover:text-surface" />
                  ) : null}
                </NavLink>

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
                              className="group/item block rounded-chip px-3 py-2 transition-colors hover:bg-brand-soft"
                            >
                              <span className="text-sm font-semibold text-content group-hover/item:text-brand-strong">
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
          <Link
            href="/watchlist"
            aria-label="Watchlist"
            className="relative rounded-pill p-2 text-content transition-colors hover:bg-brand hover:text-surface"
          >
            <HeartIcon className="h-5 w-5" />
            <WatchlistCountBadge className="absolute -right-1 -top-1" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
