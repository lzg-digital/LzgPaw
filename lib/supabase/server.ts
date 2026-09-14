import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Anon-key Supabase client for use in Server Components, Server Actions and
 * Route Handlers. Respects Row Level Security exactly as a logged-out or
 * logged-in visitor would — this is what every public storefront query and
 * the admin-session check should use.
 *
 * Never import this file into a Client Component; it depends on
 * `next/headers`, which only works on the server.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component render — safe to ignore because
            // middleware.ts refreshes the session cookie on every request.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // See note above.
          }
        },
      },
    }
  );
}
