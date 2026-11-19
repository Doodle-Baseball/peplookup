'use client';

/**
 * A link to the application form that scrolls there without putting "#apply"
 * in the address bar. The href stays so the link still works without JavaScript.
 */
export function ScrollToApplyLink({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a
      href="#apply"
      className={className}
      onClick={(event) => {
        const target = document.getElementById('apply');
        if (!target) return;
        event.preventDefault();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }}
    >
      {children}
    </a>
  );
}
