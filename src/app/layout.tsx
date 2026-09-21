import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { NavigationProgress } from '@/components/layout/navigation-progress';

/**
 * Self-hosted at build time rather than fetched from fonts.googleapis.com: a
 * cross-origin stylesheet in <head> blocks first paint on two extra DNS +
 * TLS handshakes before a single glyph is requested. next/font emits the
 * @font-face rules inline and serves the files from our own origin.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

/** Backs .eyebrow / .font-mono, the theme's uppercase label type. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: `${site.name} | Compare Peptide Prices by Cost per mg`, template: `%s | ${site.name}` },
  description: site.description,
  metadataBase: new URL(`https://${site.domain}`),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <NavigationProgress />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
