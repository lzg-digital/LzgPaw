import React, { useState } from 'react';
import { ArrowRight, Gift, Truck, ShieldCheck, Star } from 'lucide-react';
import heroImgAsset from '../assets/images/hero_lzgpaw_pets_1790283953347.jpg';

interface HeroSectionProps {
  onShopClick: () => void;
  onBundleClick: () => void;
}

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1400&q=85';

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopClick,
  onBundleClick,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(heroImgAsset);

  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full">
              <Gift className="w-3.5 h-3.5 text-amber-700" />
              <span>Multi-Item Offer: Buy 2 or More & Save on Every Order</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-stone-900 tracking-tight leading-[1.08] text-balance">
              Thoughtful Living for Cherished Companions
            </h1>

            <p className="text-base text-stone-600 max-w-lg leading-relaxed">
              Medical-grade orthopedic memory beds, whisper-quiet hydration fountains, and botanical balms crafted to keep your dogs and cats thriving at every age.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onShopClick}
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onBundleClick}
                className="px-6 py-3.5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-xs"
              >
                View Bundle Offers
              </button>
            </div>

            {/* Micro Trust Proof */}
            <div className="pt-4 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-stone-600 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="font-medium">Free Delivery Always</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Verified Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-800 shrink-0 fill-current" />
                <span className="font-medium">4.9 / 5 Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Anchor */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-16/10 sm:aspect-16/10 lg:aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-200/90 bg-stone-100">
              <img
                src={imgSrc}
                alt="Happy golden retriever and British shorthair cat relaxing together"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover object-center transition-all duration-300"
                onError={() => {
                  if (imgSrc !== FALLBACK_HERO_IMAGE) {
                    setImgSrc(FALLBACK_HERO_IMAGE);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent pointer-events-none"></div>

              {/* Floating Value Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/60 shadow-xl max-w-xs text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-stone-900">100% Non-Toxic & Vet Tested</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Human-grade materials with hypoallergenic memory foam and lead-free ceramics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
