'use client';

import { useEffect, useState } from 'react';

export type JumpToItem = { id: string; label: string };

/**
 * Anchor nav for a product page's own sections. Highlights whichever section
 * is currently in view (IntersectionObserver) so the active pill tracks
 * scroll position instead of always pointing at the first item.
 */
export function JumpToNav({ items }: { items: JumpToItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
    history.replaceState(null, '', `#${id}`);
  };

  return (
    // Scrolls on one line rather than wrapping: a wrapped row inside the
    // pill-shaped container grows it into a multi-line blob with rounded ends.
    <div className="scrollbar-hide flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto py-1 text-sm font-bold text-muted">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(event) => handleClick(event, item.id)}
          className={`shrink-0 whitespace-nowrap rounded-pill px-3.5 py-2 transition-colors ${
            activeId === item.id
              ? 'bg-brand text-surface shadow-card'
              : 'text-muted hover:bg-brand-soft hover:text-content'
          }`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
