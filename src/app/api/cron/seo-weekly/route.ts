import { cronAuthError } from '@/lib/monitoring/cron-auth';
import { escapeHtml, htmlList, sendAlertEmail } from '@/lib/monitoring/alert-email';
import { currentPageStatuses, pagesThatWorsenedSince } from '@/lib/monitoring/index-status';
import { summarise } from '@/lib/monitoring/search-alerts';
import { fetchDailySearchTotals } from '@/lib/monitoring/search-console';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * C2, every Monday: impressions, clicks and average position for the last 7
 * days, how many pages are indexable, and the pages that became noindex (or
 * started failing their quality rules) during the week, with the reason.
 */
export async function GET(request: Request) {
  const denied = cronAuthError(request);
  if (denied) return denied;

  const sections: string[] = [];
  try {
    const summary = summarise(await fetchDailySearchTotals(21));
    sections.push(
      `<h2>Search, last 7 days</h2>${htmlList([
        `Impressions: ${summary.impressionsLastWeek}`,
        `Clicks: ${summary.clicksLastWeek}`,
        `Average position: ${summary.positionLastWeek?.toFixed(1) ?? 'n/a'} (week before: ${summary.positionWeekBefore?.toFixed(1) ?? 'n/a'})`,
      ])}`,
    );
  } catch (error) {
    sections.push(`<p>Search Console could not be read: ${escapeHtml(error instanceof Error ? error.message : String(error))}</p>`);
  }

  const statuses = await currentPageStatuses();
  const indexable = statuses.filter((status) => status.indexable).length;
  const failing = statuses.filter((status) => !status.qualityPasses).length;
  sections.push(
    `<h2>Pages</h2>${htmlList([
      `Indexable: ${indexable} of ${statuses.length}`,
      `Failing a quality rule: ${failing}`,
    ])}`,
  );

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const worsened = await pagesThatWorsenedSince(weekAgo);
    sections.push(
      worsened.length === 0
        ? '<p>No page became noindex or started failing its quality rules this week.</p>'
        : `<h2>Changed this week</h2>${htmlList(
            worsened.map((page) => `${page.path}: ${page.noindex ? 'noindex' : 'failing quality'}: ${page.reasons.join('; ')}`),
          )}`,
    );
  } catch (error) {
    sections.push(`<p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p>`);
  }

  await sendAlertEmail({ subject: 'Weekly SEO report', html: sections.join('') });
  return Response.json({ sent: true, indexable, pageCount: statuses.length });
}
