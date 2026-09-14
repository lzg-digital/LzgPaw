'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderFulfillmentFormProps {
  orderId: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
}

const STATUSES = ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'];

export function OrderFulfillmentForm({ orderId, fulfillmentStatus, trackingNumber, trackingCarrier }: OrderFulfillmentFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(fulfillmentStatus);
  const [carrier, setCarrier] = useState(trackingCarrier ?? '');
  const [tracking, setTracking] = useState(trackingNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment_status: status,
          tracking_number: tracking || null,
          tracking_carrier: carrier || null,
        }),
      });
      if (!res.ok) throw new Error('Could not save');
      setMessage('Saved.');
      router.refresh();
    } catch {
      setMessage('Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl bg-white/60 p-5">
      <h2 className="font-serif text-lg text-ink">Fulfillment</h2>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-forest/20 px-3 py-2">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Carrier
        <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="rounded-lg border border-forest/20 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Tracking number
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="rounded-lg border border-forest/20 px-3 py-2" />
      </label>
      {message && <p className="text-xs text-ink/60">{message}</p>}
      <button type="submit" disabled={saving} className="w-fit rounded-full bg-forest px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
