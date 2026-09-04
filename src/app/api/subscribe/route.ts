import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  // No mailing provider is configured yet. Returning 501 rather than a silent
  // 200 keeps the UI honest: nobody is told they subscribed when they did not.
  return NextResponse.json(
    { error: 'Subscriptions are not enabled yet.' },
    { status: 501 },
  );
}
