'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      router.push(searchParams.get('redirectTo') || '/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-xl">
        <h1 className="font-serif text-2xl text-ink">LzgPaw Admin</h1>
        <p className="mt-1 text-sm text-ink/60">Sign in to manage the store.</p>

        <label className="mt-6 flex flex-col gap-1 text-sm text-ink">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-forest/20 px-3 py-2 outline-none focus:border-forest"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm text-ink">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-forest/20 px-3 py-2 outline-none focus:border-forest"
          />
        </label>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream transition hover:bg-forest-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="mt-6 text-center text-xs text-ink/40">
          There is no default admin account — access is granted by creating a row in{' '}
          <code className="rounded bg-sage px-1">admin_users</code> linked to a Supabase Auth user. See README.md.
        </p>
      </form>
    </div>
  );
}
