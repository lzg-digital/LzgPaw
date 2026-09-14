import { createBrowserClient } from '@supabase/ssr';

/**
 * Anon-key Supabase client for Client Components. Respects RLS exactly like
 * `lib/supabase/server.ts` — the only difference is where it can be called
 * from. Most data fetching in this app happens server-side (Server
 * Components / Route Handlers); reach for this only when a Client Component
 * genuinely needs to query directly (e.g. a live admin table).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
