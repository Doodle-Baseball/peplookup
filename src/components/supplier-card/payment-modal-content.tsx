import Link from 'next/link';
import { ExternalIcon, ShieldCheckIcon } from '@/components/icons/icons';

export function PaymentModalContent({
  supplierName,
  affiliateUrl,
  paymentMethods,
}: {
  supplierName: string;
  affiliateUrl: string;
  paymentMethods: readonly string[];
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2.5">
        {paymentMethods.map((method) => (
          <li
            key={method}
            className="flex items-center gap-3 rounded-chip bg-surface-sunken p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-surface text-brand">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <p className="font-bold text-content">{method}</p>
          </li>
        ))}
      </ul>

      <Link
        href={`/go?to=${encodeURIComponent(affiliateUrl || 'https://')}`}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex w-full items-center justify-center gap-2 rounded-chip bg-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
      >
        Continue
        <span className="font-semibold">{supplierName}</span>
        <ExternalIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
