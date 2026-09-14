import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Runs on every request. Three jobs:
 *
 *  1. Generate a per-request CSP with a nonce for script-src.
 *
 *     IMPORTANT: this can't be a static header in next.config.js. The
 *     Next.js App Router streams hydration data to the browser via inline
 *     `<script>` tags it injects itself (the `self.__next_f.push(...)`
 *     pattern) — this is framework internals, not something this codebase
 *     adds. A `script-src 'self'` policy with no `'unsafe-inline'` and no
 *     nonce blocks those scripts too, which doesn't just weaken security,
 *     it breaks hydration/interactivity across the entire site. Next.js's
 *     own documented fix is exactly what's below: generate a nonce here,
 *     put it in the CSP response header, and Next.js detects and applies
 *     that nonce to its own injected scripts automatically. `'strict-dynamic'`
 *     lets those nonced scripts load Next's code-split chunks in turn.
 *
 *     `style-src` keeps `'unsafe-inline'` rather than a nonce — the admin
 *     product form uses styled-jsx (`<style jsx global>`), which injects
 *     `<style>` tags at runtime through its own mechanism that doesn't
 *     carry a nonce. Inline-style injection is a materially smaller attack
 *     surface than inline script execution, so this is a deliberate,
 *     documented trade-off, not an oversight.
 *
 *  2. Refresh the Supabase auth cookie (required by @supabase/ssr so a
 *     session doesn't silently expire mid-visit).
 *
 *  3. First line of defense for /admin/* : if there's no logged-in Supabase
 *     user at all, redirect to /admin/login immediately. This does NOT
 *     check admin_users (that needs the service-role client, which this
 *     Edge middleware intentionally never touches) — the real
 *     authorization check happens server-side in
 *     app/admin/(dashboard)/layout.tsx via lib/auth.ts `requireAdmin()`.
 *     Two layers: "logged in at all" here, "actually an approved admin"
 *     there.
 */
export async function middleware(request: NextRequest) {
  // btoa() (not Buffer) — the Edge runtime middleware executes in is a
  // constrained, browser-like V8 isolate, and btoa is a guaranteed Web
  // Platform global there, whereas Node's Buffer is a polyfill whose
  // availability isn't worth staking "does the whole site's JS load" on.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Forward the nonce to the app (via a request header) in case a Server
  // Component ever needs to add its own nonced inline script — read with
  // `headers().get('x-nonce')`. Nothing in this codebase currently does,
  // but wiring it through costs nothing and avoids a half-finished pattern.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';
  const isAdminApiRoute = path.startsWith('/api/admin') && path !== '/api/admin/login';

  if ((isAdminRoute || isAdminApiRoute) && !user) {
    // Build the redirect/401 response, then carry over the CSP header and
    // any cookie mutations made above (e.g. clearing an expired session
    // cookie) — returning a fresh NextResponse here without copying those
    // over would silently drop them.
    const denied = isAdminApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(
          (() => {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('redirectTo', path);
            return loginUrl;
          })()
        );

    denied.headers.set('Content-Security-Policy', csp);
    response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie));
    return denied;
  }

  return response;
}

function buildCsp(nonce: string): string {
  const supabaseHost = (() => {
    try {
      return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : '';
    } catch {
      return '';
    }
  })();
  const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : '';
  const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : '';

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
    `media-src 'self' blob: ${supabaseOrigin}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets, so the auth cookie and CSP
     * stay fresh site-wide, while keeping the admin gate check cheap.
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
