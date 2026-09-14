'use client';

import { getConsent } from '@/lib/consent';

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'bundle_select'
  | 'cta_click';

interface TrackOptions {
  productId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

const SESSION_COOKIE = 'lzgpaw_sid';

/** A random, non-identifying id — not a user id, not derived from email/IP. */
function getSessionId(): string {
  if (typeof document === 'undefined') return 'server';
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  if (match) return decodeURIComponent(match[1]);

  const id = crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`;
  return id;
}

/**
 * Fires a behavioral analytics event — but only if the visitor has opted
 * into analytics (see docs/COMPLIANCE.md §5 and lib/consent.ts). Silently
 * no-ops otherwise; callers never need to check consent themselves.
 *
 * This never collects name, email, or precise location — see
 * database/schema.sql `analytics_events` for the exact stored shape.
 */
export function trackEvent(eventType: AnalyticsEventType, options: TrackOptions = {}) {
  const consent = getConsent();
  if (!consent.analytics) return;

  const payload = {
    event_type: eventType,
    session_id: getSessionId(),
    product_id: options.productId,
    order_id: options.orderId,
    metadata: options.metadata ?? {},
  };

  // Fire-and-forget; analytics must never block or break the UI it's attached to.
  fetch('/api/track-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics failures are non-critical and are not surfaced to the user.
  });
}
