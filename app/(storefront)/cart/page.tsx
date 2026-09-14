'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeLine } = useCart();

  return (
    <div className="container-content py-12 sm:py-16">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">Your Cart</h1>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-forest/25 py-20 text-center">
          <p className="text-ink/60">Your cart is empty.</p>
          <Link href="/shop" className="rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="flex flex-col divide-y divide-forest-100">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sage">
                  {line.image && <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-medium text-ink">{line.name}</p>
                    {line.variantLabel && <p className="text-sm text-ink/60">{line.variantLabel}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-full border border-forest/20 px-1">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name}`}
                        onClick={() => updateQuantity(line.key, line.quantity - 1)}
                        className="p-2 text-forest"
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name}`}
                        onClick={() => updateQuantity(line.key, line.quantity + 1)}
                        className="p-2 text-forest"
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="font-medium text-ink">{formatPrice(line.unitPrice * line.quantity)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => removeLine(line.key)}
                  className="self-start p-1 text-ink/40 hover:text-clay"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl bg-sage/40 p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/70">Subtotal</span>
              <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-ink/60">Shipping and any applicable tax are calculated at checkout.</p>
            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-full bg-clay py-3 text-center text-sm font-semibold text-white transition hover:bg-clay-600"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
