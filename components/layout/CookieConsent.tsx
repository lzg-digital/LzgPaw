'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hasAnswered, setConsent } from '@/lib/consent';

/**
 * Renders once, on first paint, if the visitor hasn't made a choice yet.
 * No analytics event of any kind fires before one of the two buttons here
 * is pressed — see lib/analytics.ts and docs/COMPLIANCE.md §5.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasAnswered());
  }, []);

  if (!visible) return null;

  function choose(analytics: boolean) {
    setConsent(analytics);
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-forest-100 bg-cream px-4 py-4 shadow-[0_-8px_24px_rgba(23,33,30,0.12)] sm:px-6"
    >
      <div className="mx-auto flex max-w-content flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/80">
          We use essential cookies to run this site, and — only with your
          permission — optional analytics cookies to understand how it's
          used. Read our{' '}
          <Link href="/legal/privacy-policy" className="underline underline-offset-2 hover:text-forest">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-full border border-forest/30 px-4 py-2 text-sm font-medium text-ink transition hover:bg-sage"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition hover:bg-forest-700"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
