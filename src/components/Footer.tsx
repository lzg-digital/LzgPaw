import React from 'react';
import { Mail, Instagram, ShieldCheck, Truck, RefreshCw, Heart, Lock, FileText } from 'lucide-react';
import { TrustBadges } from './TrustBadges';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-stone-200 mt-16 text-stone-600 text-xs">
      {/* Trust Strip */}
      <div className="border-b border-stone-100 bg-[#FAF9F6] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustBadges variant="full" />
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <span className="font-display text-2xl font-bold tracking-tight text-stone-900 block">
              LzgPaw
            </span>
            <p className="text-stone-500 text-xs leading-relaxed">
              Curated premium essentials for dogs and cats. Designing for unconditional love, longevity, and joint vitality.
            </p>
            <div className="pt-1 space-y-1.5 font-mono text-[11px]">
              <a
                href="mailto:ricopack0117@gmail.coma"
                className="flex items-center gap-2 text-stone-700 hover:text-stone-950 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>ricopack0117@gmail.coma</span>
              </a>
              <a
                href="https://instagram.com/lzgpaw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-700 hover:text-stone-950 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-stone-400" />
                <span>@lzgpaw</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Explore Store
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-stone-900 transition-colors cursor-pointer">
                  All Pet Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bundles')} className="hover:text-stone-900 transition-colors cursor-pointer">
                  Multi-Item Bundle Offers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-stone-900 transition-colors cursor-pointer">
                  Real-Time Order Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Customer Support & Legal
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <button onClick={() => onNavigate('faqs')} className="hover:text-stone-900 transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-privacy')} className="hover:text-stone-900 transition-colors cursor-pointer font-medium text-stone-800 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-stone-500" /> Terms & Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-stone-900 transition-colors cursor-pointer">
                  About Our Brand
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-stone-900 transition-colors cursor-pointer">
                  Contact Us (Email & IG)
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Security Standards */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Payment & Protection
            </h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Direct Pay Online (DPO Group) certified payment processing with tokenized fraud protection.
            </p>
            <div className="pt-2">
              <TrustBadges variant="compact" />
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 mt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <span>&copy; {new Date().getFullYear()} LzgPaw Pet Essentials. All rights reserved. Free delivery on every order.</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('terms-privacy')}
              className="hover:text-stone-700 transition-colors cursor-pointer underline"
            >
              Terms & Privacy Policy
            </button>
            <span>·</span>
            <span>Instagram: @lzgpaw</span>
            <span>·</span>
            <span>Support: ricopack0117@gmail.coma</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
