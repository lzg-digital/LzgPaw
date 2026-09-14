// Cookie/consent handling for LzgPaw.
//
// Nothing outside this file should read or write the consent cookie
// directly — route everything through here so the "don't track before
// consent" rule (see docs/COMPLIANCE.md §5) can't be silently bypassed by a
// new call site later.

const CONSENT_COOKIE = 'lzgpaw_consent';
const CONSENT_MAX_AGE_DAYS = 180;

export interface ConsentState {
  /** Strictly necessary cookies (cart, this consent choice) are never optional. */
  necessary: true;
  /** Behavioral analytics (page_view, add_to_cart, etc.) — opt-in only. */
  analytics: boolean;
  /** Whether the visitor has made an explicit choice yet. */
  answered: boolean;
}

const DEFAULT_STATE: ConsentState = { necessary: true, analytics: false, answered: false };

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === 'undefined') return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
}

export function getConsent(): ConsentState {
  const raw = readCookie(CONSENT_COOKIE);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      answered: true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function setConsent(analytics: boolean) {
  writeCookie(CONSENT_COOKIE, JSON.stringify({ analytics, ts: Date.now() }), CONSENT_MAX_AGE_DAYS);
}

export function hasAnswered(): boolean {
  return readCookie(CONSENT_COOKIE) !== null;
}
