import { cronAuthError, isTestRun } from '@/lib/monitoring/cron-auth';
import { escapeHtml, htmlList, sendAlertEmail } from '@/lib/monitoring/alert-email';
import { currentPageStatuses, recordPageStatuses } from '@/lib/monitoring/index-status';
import { searchAlerts, summarise } from '@/lib/monitoring/search-alerts';
import { fetchDailySearchTotals, SearchConsoleNotConfiguredError } from '@/lib/monitoring/search-console';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * C1, daily: records every page's indexing decision, then compares the latest
 * day of Search Console impressions with the 7-day average and the 7-day
 * average position with the week before, and emails when either drops.
 * Also emails if the homepage would be noindex, the one change that would
 * take the whole site out of search.
 */
export async function GET(request: Request) {
  const denied = cronAuthError(request);
  if (denied) return denied;
  const test = isTestRun(request);

  const problems: string[] = [];
  const notes: string[] = [];

  const statuses = await currentPageStatuses();
  const home = statuses.find((status) => status.path === '/');
  if (home && !home.indexable) problems.push(`The homepage is noindex: ${home.reasons.join('; ')}.`);
  try {
    const changed = await recordPageStatuses(statuses);
    if (changed.length > 0) notes.push(`${changed.length} pages changed indexing or quality state today.`);
  } catch (error) {
    notes.push(error instanceof Error ? error.message : 'Page statuses could not be recorded.');
  }

  let summaryLines: string[] = [];
  try {
    const summary = summarise(await fetchDailySearchTotals(21));
    problems.push(...searchAlerts(summary).map((alert) => alert.message));
    summaryLines = [
      summary.latest ? `Latest day with data: ${summary.latest.date}, ${summary.latest.impressions} impressions` : 'No Search Console data returned',
      `7-day average: ${Math.round(summary.impressionsSevenDayAverage)} impressions/day`,
      `Average position: ${summary.positionLastWeek?.toFixed(1) ?? 'n/a'} (week before: ${summary.positionWeekBefore?.toFixed(1) ?? 'n/a'})`,
    ];
  } catch (error) {
    // Not configured is a setup step, not an outage; anything else is reported.
    if (error instanceof SearchConsoleNotConfiguredError) notes.push(error.message);
    else problems.push(`Search Console could not be read: ${error instanceof Error ? error.message : String(error)}`);
  }

  const indexableCount = statuses.filter((status) => status.indexable).length;
  if (problems.length > 0 || test) {
    await sendAlertEmail({
      subject: test && problems.length === 0 ? 'Daily SEO alert (test email)' : 'SEO alert: search traffic or indexing dropped',
      html: [
        problems.length > 0 ? `<h2>Problems</h2>${htmlList(problems)}` : '<p>This is a test of the daily SEO alert. Nothing is wrong.</p>',
        summaryLines.length > 0 ? `<h2>Search Console</h2>${htmlList(summaryLines)}` : '',
        `<p>${escapeHtml(`${indexableCount} of ${statuses.length} pages are indexable.`)}</p>`,
        notes.length > 0 ? `<h2>Notes</h2>${htmlList(notes)}` : '',
      ].join(''),
    });
  }

  return Response.json({ problems, notes, indexableCount, pageCount: statuses.length, emailed: problems.length > 0 || test });
}
