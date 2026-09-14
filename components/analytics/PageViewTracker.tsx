'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent('page_view', { metadata: { path: pathname } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
