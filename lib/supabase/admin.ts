import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely — this
 * is the ONLY client allowed to read/write orders, customers, payment_events,
 * admin_users, discount_codes, etc.
 *
 * Hard rules:
 *   - Import this ONLY from server-only code: Route Handlers under /app/api,
 *     or server-only modules under /services. The `server-only` package
 *     above makes an accidental client-bundle import a build error.
 *   - Never forward SUPABASE_SERVICE_ROLE_KEY to the browser, a Client
 *     Component, or a log line.
 *   - Every write through this client MUST be preceded by the caller's own
 *     authorization check (admin session check, webhook signature
 *     verification, or checkout-payload validation) — this client trusts
 *     the caller completely, by design.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service-role client requested but NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
