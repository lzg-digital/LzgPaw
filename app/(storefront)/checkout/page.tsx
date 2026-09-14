'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { trackEvent } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';
import { COUNTRIES } from '@/lib/countries';

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    full_name: '',
    country_code: 'US',
    address_line1: '',
    address_line2: '',
    city: '',
    state_region: '',
    postal_code: '',
    discount_code: '',
    customer_notes: '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    trackEvent('begin_checkout', { metadata: { itemCount: lines.length } });

    const country = COUNTRIES.find((c) => c.code === form.country_code);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          same_as_shipping: true,
          discount_code: form.discount_code || undefined,
          customer_notes: form.customer_notes || undefined,
          shipping_address: {
            full_name: form.full_name || form.customer_name,
            phone: form.customer_phone,
            country: country?.name ?? form.country_code,
            country_code: form.country_code,
            address_line1: form.address_line1,
            address_line2: form.address_line2 || undefined,
            city: form.city,
            state_region: form.state_region || undefined,
            postal_code: form.postal_code || undefined,
          },
          lines: lines.map((line) => ({
            kind: line.kind,
            productId: line.productId,
            variantId: line.variantId,
            bundleId: line.bundleId,
            quantity: line.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');

      clearCart();
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-content py-20 text-center">
        <p className="text-ink/60">Your cart is empty — add something before checking out.</p>
      </div>
    );
  }

  return (
    <div className="container-content grid gap-10 py-12 lg:grid-cols-[1fr_380px] lg:py-16">
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <section>
          <h2 className="font-serif text-xl text-ink">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required value={form.customer_name} onChange={(v) => update('customer_name', v)} />
            <Field label="Phone" required type="tel" value={form.customer_phone} onChange={(v) => update('customer_phone', v)} />
            <Field
              label="Email"
              required
              type="email"
              value={form.customer_email}
              onChange={(v) => update('customer_email', v)}
              className="sm:col-span-2"
            />
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-ink sm:col-span-2">
              Country
              <select
                value={form.country_code}
                onChange={(e) => update('country_code', e.target.value)}
                className="rounded-lg border border-forest/20 px-3 py-2 outline-none focus:border-forest"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Address line 1"
              required
              value={form.address_line1}
              onChange={(v) => update('address_line1', v)}
              className="sm:col-span-2"
            />
            <Field
              label="Address line 2 (optional)"
              value={form.address_line2}
              onChange={(v) => update('address_line2', v)}
              className="sm:col-span-2"
            />
            <Field label="City" required value={form.city} onChange={(v) => update('city', v)} />
            <Field label="State / Region" value={form.state_region} onChange={(v) => update('state_region', v)} />
            <Field label="Postal code" value={form.postal_code} onChange={(v) => update('postal_code', v)} />
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Discount code</h2>
          <div className="mt-4">
            <Field label="Code (optional)" value={form.discount_code} onChange={(v) => update('discount_code', v)} />
          </div>
        </section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-clay py-3.5 text-sm font-semibold text-white transition hover:bg-clay-600 disabled:opacity-60"
        >
          {submitting ? 'Redirecting to payment…' : 'Continue to Payment'}
        </button>
      </form>

      <aside className="h-fit rounded-2xl bg-sage/40 p-6">
        <h2 className="font-serif text-lg text-ink">Order Summary</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {lines.map((line) => (
            <li key={line.key} className="flex justify-between text-sm">
              <span className="text-ink/80">
                {line.name} × {line.quantity}
              </span>
              <span className="font-medium text-ink">{formatPrice(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-forest/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/70">Subtotal</span>
            <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-ink/60">Shipping and any discount are calculated on the next step.</p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-ink ${className ?? ''}`}>
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-forest/20 px-3 py-2 outline-none focus:border-forest"
      />
    </label>
  );
}
