import Link from 'next/link';
import { InfoModal } from '@/components/ui/info-modal';
import { ArrowRightIcon } from '@/components/icons/icons';

export function ProductInfoModal({
  slug,
  name,
  category,
  summary,
}: {
  slug: string;
  name: string;
  category: string | null;
  summary: string | null;
}) {
  return (
    <InfoModal triggerLabel={`About ${name}`} title={name}>
      {category ? (
        <span className="mt-2 inline-block rounded-pill border border-line bg-surface px-2.5 py-0.5 text-xs font-bold text-content">
          {category}
        </span>
      ) : null}
      {summary ? <p className="mt-4 text-sm text-muted">{summary}</p> : null}
      <Link
        href={`/products/${slug}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-chip bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
      >
        View All Suppliers
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </InfoModal>
  );
}
