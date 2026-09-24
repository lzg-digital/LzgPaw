import React from 'react';
import { Heart, ShieldCheck, Sparkles, Instagram, Mail, Truck, Award, Check } from 'lucide-react';

interface AboutPageProps {
  onNavigateToShop: () => void;
  onNavigateToContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateToShop,
  onNavigateToContact,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Editorial Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
          Crafted for Companion Happiness
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 tracking-tight leading-tight">
          Where Thoughtful Design Meets Unconditional Pet Love
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          LzgPaw was founded on a simple realization: our pets give us their whole hearts, yet too many everyday pet accessories are mass-produced with cheap plastics, flimsy stitching, and toxic dyes. We set out to change that standard.
        </p>
      </div>

      {/* Visual Story Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs">
        <div className="rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 shadow-inner">
          <img
            src="/src/assets/images/hero_lzgpaw_pets_1790283953347.jpg"
            alt="LzgPaw pets enjoying orthopedic comfort"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h2 className="text-xl font-display font-bold text-stone-900">
            Veterinarian-Vetted Comfort & Longevity
          </h2>
          <p>
            From human-grade orthopedic memory foam beds that support aging joints to whisper-quiet stainless steel fountains that protect feline kidneys, each piece in the LzgPaw collection is developed alongside veterinarians and pet behaviorists.
          </p>
          <p>
            We prioritize sustainable materials: vegetable-tanned Italian saddlery leathers, lead-free ceramics, natural New Zealand felt wool, and 100% organic botanical balms.
          </p>

          <div className="pt-2 space-y-2 text-stone-800 font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Zero toxic dyes, phthalates, or harsh sulfates</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Free worldwide delivery on every order with real-time tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Direct Pay Online (DPO Pay) PCI-DSS Level 1 verified payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm sm:text-base">Heirloom Craftsmanship</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Constructed to withstand chewing, playing, and years of deep snuggles. Machine-washable covers and corrosion-free solid brass hardware.
          </p>
        </div>

        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm sm:text-base">Free Delivery Worldwide</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            We believe pet parents shouldn’t face hidden checkout surcharges. Every order ships free with push notification delivery updates.
          </p>
        </div>

        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm sm:text-base">30-Day Pet Happiness Guarantee</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            If your pet doesn’t take to our bed, fountain, or accessories within 30 days, we issue a prompt, cheerful exchange or refund.
          </p>
        </div>
      </div>

      {/* Connect With Founder & Direct Contact */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-300">
            Get in Touch With Our Care Team
          </span>
          <h3 className="text-2xl font-display font-bold">
            We’d Love to Hear From You & Your Companion
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Have sizing questions or custom inquiries? Reach us directly via email or connect with our growing pet parent community on Instagram.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
            <a
              href="mailto:ricopack0117@gmail.coma"
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 px-3.5 py-2 rounded-lg text-amber-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>ricopack0117@gmail.coma</span>
            </a>
            <a
              href="https://instagram.com/lzgpaw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 px-3.5 py-2 rounded-lg text-amber-200 transition-colors"
            >
              <Instagram className="w-4 h-4 text-amber-400" />
              <span>@lzgpaw</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={onNavigateToShop}
            className="px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 rounded-xl font-semibold text-xs transition-colors shadow-md cursor-pointer"
          >
            Explore Pet Catalog
          </button>
          <button
            onClick={onNavigateToContact}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            Send Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};
