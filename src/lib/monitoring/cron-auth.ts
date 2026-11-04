import 'server-only';

/**
 * Vercel Cron calls each job with "Authorization: Bearer <CRON_SECRET>". With
 * no secret set nothing is allowed through, so the jobs (which send email and
 * write to the database) can't be triggered by anyone who finds the URL.
 */
export function cronAuthError(request: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Set CRON_SECRET to enable the scheduled SEO jobs.' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  return null;
}

/** "?test=1" sends the job's email even when nothing is wrong, to check delivery. */
export function isTestRun(request: Request): boolean {
  return new URL(request.url).searchParams.get('test') === '1';
}
