import React from 'react';
import { X, Trash2, Plus, Minus, Gift, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem, BundleOffer } from '../types/store';
import { TrustBadges } from './TrustBadges';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  bundleOffer: BundleOffer;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  bundleOffer,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const compareAtSubtotal = cart.reduce(
    (acc, item) => acc + (item.product.compareAtPrice || item.product.price) * item.quantity,
    0
  );
  const totalSavings = compareAtSubtotal - subtotal;

  const isGiftUnlocked = bundleOffer.active && totalItemCount >= bundleOffer.requiredQuantity;
  const itemsNeededForGift = Math.max(0, bundleOffer.requiredQuantity - totalItemCount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            <h2 className="font-semibold text-stone-900 text-base">Your Pet Care Bag</h2>
            <span className="text-xs text-stone-500 font-mono tabular-nums">({totalItemCount} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery & Bundle Progress Tracker */}
        <div className="bg-stone-900 text-stone-100 p-3.5 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Free Delivery Active On Every Order
            </span>
            <span className="font-mono">$0.00</span>
          </div>

          {/* Bundle Offer Progress */}
          {bundleOffer.active && (
            <div className="mt-3 pt-2.5 border-t border-stone-800">
              {isGiftUnlocked ? (
                <div className="flex items-center gap-2 text-amber-300 font-semibold bg-amber-950/40 p-2 rounded border border-amber-500/40">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Bundle Offer & Extra Perk Activated!</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-stone-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add {itemsNeededForGift} more item to unlock multi-item savings!</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">{totalItemCount}/2</span>
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (totalItemCount / bundleOffer.requiredQuantity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400">
              <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.2] text-stone-300" />
              <p className="text-base font-semibold text-stone-700">Your bag is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore our veterinarian-approved pet beds, fountains, and wellness supplies to unlock free gifts!
              </p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-stone-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/product_orthopedic_bed_1790283966759.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {item.product.category}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/50">
                      <div className="flex items-center border border-stone-300 rounded bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold font-mono tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono tabular-nums text-stone-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        {item.product.compareAtPrice > item.product.price && (
                          <span className="text-[10px] text-stone-400 line-through font-mono block">
                            ${(item.product.compareAtPrice * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Multi-Item Bonus Card Display if unlocked */}
              {isGiftUnlocked && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 border border-amber-200">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      <Sparkles className="w-3 h-3" /> Multi-Item Perk
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                      Complimentary Pet Care Essential Pack
                    </h4>
                    <p className="text-[11px] text-stone-600 line-clamp-1">
                      Included with your qualifying order
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Included
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-white space-y-3">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-stone-900">${subtotal.toFixed(2)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span>Compare-at Savings</span>
                  <span className="font-mono tabular-nums">-${totalSavings.toFixed(2)}</span>
                </div>
              )}
              {isGiftUnlocked && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Multi-Item Perk</span>
                  <span className="font-mono tabular-nums">Included ($0.00)</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Worldwide Delivery</span>
                <span className="uppercase font-bold tracking-wider text-[11px]">Free</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                <span>Estimated Total</span>
                <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* DPO Pay Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
            >
              <span>Checkout with DPO Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <TrustBadges variant="inline" />
          </div>
        )}
      </div>
    </div>
  );
};
