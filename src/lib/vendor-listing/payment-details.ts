import 'server-only';
import type { VendorPaymentDetails } from '@/config/vendor-listing';

function setting(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

/** The BTC wallet and PayPal email applicants pay to, from the environment. Never hard-coded. */
export function getPaymentDetails(): VendorPaymentDetails {
  return {
    btc: setting('VENDOR_LISTING_BTC_ADDRESS'),
    paypal: setting('VENDOR_LISTING_PAYPAL_EMAIL'),
  };
}
