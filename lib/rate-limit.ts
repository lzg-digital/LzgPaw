import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * A lightweight, Postgres-backed rate limiter for public, unauthenticated
 * endpoints. Not as fast as an edge/Redis-based limiter, but requires no
 * extra infrastructure and is enough to blunt casual abuse (enumeration,
 * spam, order-flooding) — see docs/COMPLIANCE.md and README "Known gaps"
 * for the honest ceiling on this approach: a determined, distributed
 * attacker can still exceed it. If this store scales to the point that
 * matters, swap this for an edge-level limiter (e.g. Upstash Redis) without
 * changing any call site — they all just call `isRateLimited`/`recordHit`.
 */
export async function isRateLimited(bucket: string, key: string, maxAttempts: number, windowMinutes: number): Promise<boolean> {
  const supabase = createAdminClient();
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('rate_limit_events')
    .select('id', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .eq('key', key)
    .gte('created_at', windowStart);

  if (error) {
    // Fail open rather than taking the whole endpoint down if this table
    // has an unexpected problem — logged so it doesn't go unnoticed.
    console.error('[rate-limit] check failed, failing open', error.message);
    return false;
  }

  return (count ?? 0) >= maxAttempts;
}

export async function recordHit(bucket: string, key: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('rate_limit_events').insert({ bucket, key });
  if (error) console.error('[rate-limit] failed to record hit', error.message);
}

/** Best-effort client IP extraction behind a proxy (Vercel sets this). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
