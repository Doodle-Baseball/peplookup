'use client';

import Link from 'next/link';

/**
 * Dosage-chip row for the product page's "Select Dosage" card. Selecting a
 * chip still navigates (the page's form/dose state is URL-driven), but
 * "+N More" expands the full list in place, no navigation, matching the
 * homepage product card's dose-expansion behavior.
 */
export function DoseChipsExpandable({
  doses,
  selectedKey,
}: {
  doses: { key: string; label: string; href: string }[];
  selectedKey: string | null;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {doses.map((dose) => (
        <Link
          key={dose.key}
          href={dose.href}
          scroll={false}
          className={`h-fit rounded-full border px-3.5 py-2 text-sm font-bold transition-all ${
            selectedKey === dose.key
              ? 'border-content bg-content text-surface shadow-sm'
              : 'border-line bg-surface text-content hover:border-brand hover:bg-brand hover:text-surface'
          }`}
        >
          {dose.label}
        </Link>
      ))}
    </div>
  );
}
