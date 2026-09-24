import React from 'react';
import { ShieldCheck, Lock, CheckCircle, Truck, RefreshCw } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'compact' | 'full' | 'inline';
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ variant = 'full' }) => {
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-500">
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Checkout
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <Lock className="w-3.5 h-3.5 text-stone-600" /> Buyer Protection
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <Truck className="w-4 h-4 text-stone-600" /> Free Delivery
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80">
        <div className="flex items-center justify-between text-xs text-stone-700 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Merchant
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-stone-600" /> Encrypted Payment
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Safe Order Guarantee
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual Trust Guarantee Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-900 leading-tight">Verified Merchant</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Direct Pay Online</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-900 leading-tight">Encrypted Checkout</div>
            <div className="text-[10px] text-stone-400 mt-0.5">PCI-DSS Certified</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-900 leading-tight">Free Express Delivery</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Tracked on Every Order</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-stone-900 leading-tight">30-Day Guarantee</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Easy Exchanges & Returns</div>
          </div>
        </div>
      </div>

      {/* Payment Brand Logos / Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-stone-500">
        <span className="font-medium mr-1 text-stone-400">Accepted Payment Methods:</span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-stone-800 text-[10px] tracking-wide">
          VISA
        </span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-stone-800 text-[10px] tracking-wide">
          MASTERCARD
        </span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-stone-800 text-[10px] tracking-wide">
          AMERICAN EXPRESS
        </span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-emerald-800 text-[10px] tracking-wide">
          M-PESA
        </span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-red-800 text-[10px] tracking-wide">
          AIRTEL MONEY
        </span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-amber-800 text-[10px] tracking-wide">
          MTN MOMO
        </span>
        <span className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-stone-700 text-[10px] tracking-wide">
          BANK WIRE
        </span>
      </div>
    </div>
  );
};
