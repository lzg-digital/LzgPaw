import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isLoginRateLimited, recordLoginAttempt } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  if (await isLoginRateLimited(email, ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Please wait 15 minutes and try again.' },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await recordLoginAttempt(email, ip, false);
    // Deliberately generic — never reveal whether the email exists.
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  // Being a valid Supabase Auth user is not enough — confirm admin_users
  // membership (service-role lookup; admin_users has no RLS policies at
  // all) before granting a session that middleware.ts will treat as "logged
  // in to /admin".
  const adminClient = createAdminClient();
  const { data: adminRow } = await adminClient
    .from('admin_users')
    .select('id, active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!adminRow || !adminRow.active) {
    await supabase.auth.signOut();
    await recordLoginAttempt(email, ip, false);
    return NextResponse.json({ error: 'This account is not authorized for admin access.' }, { status: 403 });
  }

  await recordLoginAttempt(email, ip, true);
  await adminClient.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminRow.id);

  return NextResponse.json({ ok: true });
}
