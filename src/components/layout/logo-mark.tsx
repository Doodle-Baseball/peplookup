import Image from 'next/image';

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/website%20logo.png"
      alt=""
      width={size * 5}
      height={size}
      className={className}
      priority
    />
  );
}
