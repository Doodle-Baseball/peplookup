import type { ReactNode } from 'react';

export function MetaPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="group/pill inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-content transition-colors hover:border-brand hover:bg-brand hover:text-surface">
      <span className="text-muted transition-colors group-hover/pill:text-surface">{icon}</span>
      {children}
    </span>
  );
}
