import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const TONES = {
  trust: 'bg-brand-soft text-brand-strong',
  lab: 'bg-lab-soft text-lab-ink',
  tier: 'bg-content text-surface',
  neutral: 'border border-line bg-surface text-muted',
  ok: 'bg-brand-soft text-brand-strong',
  danger: 'bg-danger/10 text-danger',
} as const;

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-chip px-2 py-1 text-micro font-bold uppercase',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
