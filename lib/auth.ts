import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminUser } from '@/types/admin';

/**
 * Resolves the current request to an authenticated + authorized admin, or
 * null. This is intentionally a two-step check:
 *
 *   1. Ask Supabase Auth (via the anon-key, cookie-aware server client) who
 *      the caller is. `getUser()` — not `getSession()` — is used because it
 *      revalidates the JWT against Supabase rather than trusting the cookie
 *      blindly.
 *   2. Look that id up in `admin_users` using the SERVICE-ROLE client. This
 *      table has no RLS policies at all (see database/schema.sql), so this
 *      is the only way to read it — which is the point: being logged in via
 *      Supabase Auth is not by itself enough to be an admin.
 *
 * Every admin page and every /api/admin/* route must call this before doing
 * anything else, and must treat `null` as "not authorized" (redirect / 401),
 * never as "treat as a normal visitor".
 */
export async function requireAdmin(): Promise<AdminUser | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const admin = createAdminClient();
  const { data: adminRow, error: adminError } = await admin
    .from('admin_users')
    .select('id, email, name, role, active')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError || !adminRow || !adminRow.active) return null;

  return adminRow as AdminUser;
}

// ----------------------------------------------------------------------------
// Brute-force protection for /admin/login
// ----------------------------------------------------------------------------
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function isLoginRateLimited(email: string, ipAddress: string | null): Promise<boolean> {
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count } = await admin
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .eq('success', false)
    .gte('created_at', windowStart);

  // Also rate-limit by IP so a single attacker can't cycle through emails
  // to dodge the per-email limit.
  let ipCount = 0;
  if (ipAddress) {
    const { count: ipAttemptCount } = await admin
      .from('admin_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .eq('success', false)
      .gte('created_at', windowStart);
    ipCount = ipAttemptCount ?? 0;
  }

  return (count ?? 0) >= MAX_ATTEMPTS || ipCount >= MAX_ATTEMPTS * 2;
}

export async function recordLoginAttempt(email: string, ipAddress: string | null, success: boolean) {
  const admin = createAdminClient();
  await admin.from('admin_login_attempts').insert({
    email: email.toLowerCase(),
    ip_address: ipAddress,
    success,
  });
}
