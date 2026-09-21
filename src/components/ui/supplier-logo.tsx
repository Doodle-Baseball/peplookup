'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * Vendor logo with a letter fallback. Logos are hotlinked from vendor sites and
 * favicon services and some of them 404, a broken-image glyph reads as a broken
 * page, while an initial reads as a deliberate placeholder.
 */
export function SupplierLogo({
  src,
  name,
  size,
  className,
  initialClassName,
}: {
  src: string | null | undefined;
  name: string;
  size: number;
  className?: string;
  initialClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // An image that already failed before hydration never fires onError;
  // decode() rejects for it, so this catches both early and late failures.
  useEffect(() => {
    setFailed(false);
    imageRef.current?.decode().catch(() => setFailed(true));
  }, [src]);

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden border border-line bg-surface-raised',
        className,
      )}
    >
      {src && !failed ? (
        <Image
          ref={imageRef}
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true" className={cn('text-sm font-bold text-faint', initialClassName)}>
          {name.charAt(0)}
        </span>
      )}
    </span>
  );
}
