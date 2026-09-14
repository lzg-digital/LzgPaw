'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface PurchaseTrackerProps {
  orderId: string;
  total: number;
  currency: string;
}

const DEDUPE_KEY_PREFIX = 'lzgpaw_purchase_tracked_';

/**
 * A page refresh on the confirmation page should not double-count a
 * purchase — sessionStorage (cleared when the tab closes) is enough to
 * dedupe without needing any server-side event log.
 */
export function PurchaseTracker({ orderId, total, currency }: PurchaseTrackerProps) {
  useEffect(() => {
    const key = `${DEDUPE_KEY_PREFIX}${orderId}`;
    if (typeof window === 'undefined' || window.sessionStorage.getItem(key)) return;

    trackEvent('purchase', { orderId, metadata: { total, currency } });
    window.sessionStorage.setItem(key, '1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return null;
}
