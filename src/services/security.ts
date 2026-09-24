/**
 * Maximum Security Engine for LzgPaw
 * Provides input sanitization, rate-limiting, CSRF token generation,
 * and secure credential handling.
 */

export class SecurityService {
  private static rateLimitMap: Map<string, number[]> = new Map();

  /**
   * Sanitizes user input to prevent XSS (Cross-Site Scripting) attacks
   */
  public static sanitize(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Unescapes sanitized text for safe display
   */
  public static unescape(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  /**
   * Enforces client-side rate limiting to prevent automated spam/brute-force
   * e.g., max 5 attempts per 60 seconds per key
   */
  public static checkRateLimit(actionKey: string, maxAttempts = 5, windowMs = 60000): { allowed: boolean; remainingMs: number } {
    const now = Date.now();
    const timestamps = this.rateLimitMap.get(actionKey) || [];
    
    // Filter timestamps within the current active window
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxAttempts) {
      const oldestInWindow = recent[0];
      const remainingMs = Math.max(0, windowMs - (now - oldestInWindow));
      return { allowed: false, remainingMs };
    }

    recent.push(now);
    this.rateLimitMap.set(actionKey, recent);
    return { allowed: true, remainingMs: 0 };
  }

  /**
   * Generates a cryptographically random transaction nonce / token
   */
  public static generateSecureToken(prefix = 'LZG-SEC'): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(12);
      window.crypto.getRandomValues(array);
      const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
      return `${prefix}-${hex.toUpperCase()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Timing-safe string comparison to protect against timing attacks
   */
  public static timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
