'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import Image from 'next/image';

type OfferImageProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt' | 'onError'> & {
  src: string;
  alt: string;
  /** Shown in place of the picture when it cannot be loaded, instead of the browser's broken-image icon. */
  fallback: ReactNode;
};

/** A supplier's product picture that gives way to `fallback` when it fails to load. */
export function OfferImage({ src, alt, fallback, ...imageProps }: OfferImageProps) {
  // Remembers which picture failed, so picking another size (a different picture) gets its own try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return <>{fallback}</>;

  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      // A picture that failed while the page was still loading never fires onError, because React had not
      // attached the handler yet; a finished load with no pixels is the same failure, found on mount.
      ref={(element) => {
        if (element?.complete && element.naturalWidth === 0) setFailedSrc(src);
      }}
    />
  );
}
