'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, GlobeIcon } from '@/components/icons/icons';

interface UserAgentData {
  mobile: boolean;
  brands: readonly { brand: string }[];
}

/**
 * The extension installs only in desktop Google Chrome. Client hints answer
 * that directly where Chrome sends them; the user-agent string is the
 * fallback, excluding the Chromium browsers and mobile builds that also say "Chrome".
 */
export function isDesktopChrome(userAgent: string, userAgentData: UserAgentData | undefined): boolean {
  if (userAgentData) {
    return !userAgentData.mobile && userAgentData.brands.some((entry) => entry.brand === 'Google Chrome');
  }
  return /Chrome\/\d+/.test(userAgent) && !/Edg\/|OPR\/|SamsungBrowser|CriOS|Mobile|Android/.test(userAgent);
}

/**
 * "Get these codes automatically" banner above the /coupons list. Rendered
 * only after hydration, once the browser is known, so Safari, Firefox and
 * phones never see an install prompt they can't use.
 */
export function ExtensionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const userAgentData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
    setVisible(isDesktopChrome(navigator.userAgent, userAgentData));
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/extension"
      className="group mt-8 flex items-center gap-4 rounded-card border border-brand/30 bg-brand-soft p-4 shadow-card transition-colors hover:border-brand sm:p-5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand text-white">
        <GlobeIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-content sm:text-base">Get these codes automatically.</span>
        <span className="block text-sm text-muted">Free Chrome extension</span>
      </span>
      <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-strong transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
