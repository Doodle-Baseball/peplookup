import { supplierPath } from '@/lib/supplier-path';
import { site } from '@/config/site';
import { getSuppliers } from '@/lib/repository';
import { cronAuthError, isTestRun } from '@/lib/monitoring/cron-auth';
import { htmlList, sendAlertEmail } from '@/lib/monitoring/alert-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ORIGIN = `https://${site.domain}`;

/**
 * C3, every 15 minutes: the homepage, one supplier page and the sitemap must
 * each answer 200 on the live domain (a redirect counts as a failure). Emails
 * when any doesn't.
 *
 * This runs on the site's own deployment, so it catches broken pages and bad
 * deploys but not a full outage of the deployment itself; an outside uptime
 * monitor covers that.
 */
export async function GET(request: Request) {
  const denied = cronAuthError(request);
  if (denied) return denied;

  const supplier = (await getSuppliers())[0];
  const paths = ['/', ...(supplier ? [supplierPath(supplier.slug)] : []), '/sitemap.xml'];
  const results = await Promise.all(
    paths.map(async (path) => {
      try {
        const response = await fetch(`${ORIGIN}${path}`, {
          redirect: 'manual',
          cache: 'no-store',
          signal: AbortSignal.timeout(20_000),
        });
        return { path, status: response.status };
      } catch (error) {
        return { path, status: 0, error: error instanceof Error ? error.message : String(error) };
      }
    }),
  );

  const down = results.filter((result) => result.status !== 200);
  if (down.length > 0 || isTestRun(request)) {
    await sendAlertEmail({
      subject: down.length > 0 ? `Uptime alert: ${down.length} page(s) not answering 200` : 'Uptime check (test email)',
      html: htmlList(results.map((result) => `${ORIGIN}${result.path}: ${result.status || `no response (${result.error})`}`)),
    });
  }
  return Response.json({ results });
}
