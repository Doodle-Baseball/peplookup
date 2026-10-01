import Image from 'next/image';
import { site } from '@/config/site';

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/website%20logo.png"
      alt={`${site.name} logo`}
      width={size * 5}
      height={size}
      className={className}
      priority
    />
  );
}
