'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { GuideCoverArt } from '@/components/guides/guide-cover-art';
import type { GuideAccent, GuideIcon } from '@/data/guides';
import { cn } from '@/lib/cn';

/**
 * A guide's cover: the uploaded photo when one is set, otherwise the generated
 * icon + colour art. Covers are hotlinked from wherever the admin points them,
 * so a dead URL falls back to the generated art rather than leaving a broken
 * image frame on the page.
 */
export function GuideCover({
  imageUrl,
  icon,
  accent,
  alt = '',
  className,
  priority = false,
}: {
  imageUrl?: string | null;
  icon: GuideIcon;
  accent: GuideAccent;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (!imageUrl || failed) {
    return <GuideCoverArt icon={icon} accent={accent} className={className} />;
  }

  return (
    <span className={cn('relative block overflow-hidden bg-surface-sunken', className)}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover"
        unoptimized
        priority={priority}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
