import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { trafficRangeSchema } from '@/lib/traffic/snapshot';
import { getTrafficSnapshot, TrafficDbError } from '@/lib/traffic/store';

export const dynamic = 'force-dynamic';

/**
 * Polled by /admin/traffic every few seconds. The middleware only guards
 * /admin pages, not /api/admin/*, so the session is checked here as well.
 */
export async function GET(request: Request) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const range = trafficRangeSchema.safeParse(new URL(request.url).searchParams.get('range') ?? 'all');
  if (!range.success) return NextResponse.json({ error: 'Unknown range.' }, { status: 400 });

  try {
    return NextResponse.json(await getTrafficSnapshot(range.data), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof TrafficDbError ? error.message : 'Traffic could not be loaded.';
    if (!(error instanceof TrafficDbError)) console.error('[traffic] snapshot failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
