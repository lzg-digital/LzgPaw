'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Logged server-side via the platform's own error reporting in
    // production; never rendered to the customer (section 37 — error handling).
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center font-sans">
        <h1 className="font-serif text-3xl text-ink">Something went wrong</h1>
        <p className="mt-3 max-w-sm text-ink/60">
          We hit an unexpected error. Please try again, or come back in a few minutes.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
