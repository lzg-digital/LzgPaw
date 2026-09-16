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
    <div className="container-content py-8 sm:py-12 lg:py-16">
      <div className="mx-auto mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/70">Secure checkout</p>
        <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Almost there.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Enter your delivery details, then you'll be sent to DPO Pay's secure hosted checkout to complete payment.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-forest">
          {['Secure DPO Pay checkout', 'Visa & Mastercard', 'Card details never stored here'].map((item) => (
            <span key={item} className="rounded-full border border-forest/10 bg-white px-3 py-1.5 shadow-sm">{item}</span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-card sm:p-7">
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

        <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-card sm:p-7">
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

        <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-card sm:p-7">
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

      <aside className="h-fit rounded-3xl border border-forest/10 bg-sage/35 p-6 shadow-card lg:sticky lg:top-28">
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
          <p className="mt-2 text-xs text-ink/60">Final shipping, discounts and total are calculated securely on the server before DPO payment begins.</p>
        </div>
        <div className="mt-5 rounded-2xl bg-white/75 p-4 text-xs leading-5 text-ink/65">
          <strong className="text-ink">Your payment is protected.</strong> DPO hosts the payment page, so LzgPaw does not collect or store your card number or CVV.
        </div>
      </aside>
      </div>
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
