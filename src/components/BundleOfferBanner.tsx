import React from 'react';
import { Gift, Sparkles, Check, ArrowRight } from 'lucide-react';
import { BundleOffer, CartItem } from '../types/store';

interface BundleOfferBannerProps {
  bundleOffer: BundleOffer;
  cart: CartItem[];
  onShopQualifying: () => void;
}

export const BundleOfferBanner: React.FC<BundleOfferBannerProps> = ({
  bundleOffer,
  cart,
  onShopQualifying,
}) => {
  if (!bundleOffer.active) return null;

  const totalItemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isGiftUnlocked = totalItemsInCart >= bundleOffer.requiredQuantity;
  const itemsLeft = Math.max(0, bundleOffer.requiredQuantity - totalItemsInCart);

  return (
    <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Copy & Status */}
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Exclusive Store Bundle</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            {bundleOffer.title}
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {bundleOffer.subtitle}
          </p>

          {/* Real-Time Live Cart Progress Meter */}
          <div className="pt-2 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-stone-400 font-medium">
                {isGiftUnlocked ? (
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Bundle Discount & Perk Activated!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-amber-300">{itemsLeft}</strong> more eligible product to activate
                  </span>
                )}
              </span>
              <span className="font-mono text-stone-300">
                {totalItemsInCart}/{bundleOffer.requiredQuantity} items
              </span>
            </div>

            <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totalItemsInCart / bundleOffer.requiredQuantity) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Multi-Item Bonus Card */}
        <div className="lg:col-span-4 bg-stone-800/80 rounded-2xl p-4 border border-stone-700/80 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-300 border border-amber-400/30 shadow-sm">
            <Gift className="w-8 h-8" />
          </div>
          <div className="flex-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Multi-Item Savings
            </span>
            <h4 className="font-bold text-white text-sm mt-0.5">Complimentary Order Perk</h4>
            <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
              Automatically included on qualifying multi-item orders at checkout.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 text-xs">Included · $0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
