import type { ReactNode } from 'react';

/**
 * Accents the vendor's name inside a heading, the way "What is BPC-157?"
 * accents the compound. A title edited in the admin that doesn't mention the
 * vendor accents its last word instead, so every box keeps the same rhythm.
 */
export function accentedTitle(title: string, vendorName: string): ReactNode {
  const at = title.indexOf(vendorName);
  if (at !== -1) {
    return (
      <>
        {title.slice(0, at)}
        <span className="text-accent">{vendorName}</span>
        {title.slice(at + vendorName.length)}
      </>
    );
  }
  const splitAt = title.lastIndexOf(' ');
  if (splitAt === -1) return <span className="text-accent">{title}</span>;
  return (
    <>
      {title.slice(0, splitAt)} <span className="text-accent">{title.slice(splitAt + 1)}</span>
    </>
  );
}
