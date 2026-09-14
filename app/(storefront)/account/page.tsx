'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/account/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Order not found');
      router.push(`/checkout/success?order=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-content max-w-md py-16">
      <h1 className="font-serif text-3xl text-ink">Track an order</h1>
      <p className="mt-2 text-sm text-ink/60">
        Enter your order number and the email you used at checkout to see your order status.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Order number
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="LZG-1000"
            className="rounded-lg border border-forest/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-forest/20 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-forest py-3 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {submitting ? 'Looking up…' : 'Find my order'}
        </button>
      </form>
    </div>
  );
}
