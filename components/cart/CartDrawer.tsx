'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice, cn } from '@/lib/utils';

export function CartDrawer() {
  const { lines, subtotal, isOpen, closeCart, updateQuantity, removeLine } = useCart();

  return (
    <div className={cn('fixed inset-0 z-50', isOpen ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!isOpen}>
      <div
        className={cn('absolute inset-0 bg-ink/40 transition-opacity', isOpen ? 'opacity-100' : 'opacity-0')}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md transform flex-col bg-cream shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-forest-100 px-6 py-5">
          <h2 className="font-serif text-xl text-ink">Your Cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="p-1 text-forest">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-ink/70">Your cart is empty.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-forest-700"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-forest-100 overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-sage">
                    {line.image && (
                      <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{line.name}</p>
                      {line.variantLabel && <p className="text-xs text-ink/60">{line.variantLabel}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-forest/20">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.name}`}
                          onClick={() => updateQuantity(line.key, line.quantity - 1)}
                          className="p-1.5 text-forest"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="min-w-[1.5ch] text-center text-sm" aria-live="polite">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.name}`}
                          onClick={() => updateQuantity(line.key, line.quantity + 1)}
                          className="p-1.5 text-forest"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-ink">
                        {formatPrice(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name} from cart`}
                    onClick={() => removeLine(line.key)}
                    className="self-start p-1 text-ink/40 transition hover:text-clay"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-forest-100 px-6 py-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-ink/70">Subtotal</span>
                <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-ink/60">Shipping and any applicable tax are calculated at checkout.</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-full bg-clay px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-clay-600"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
