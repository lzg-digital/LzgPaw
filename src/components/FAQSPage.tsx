import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, Gift, CreditCard, Mail } from 'lucide-react';
import { FAQ_ITEMS } from '../data/initialData';

interface FAQSPageProps {
  onNavigateToContact: () => void;
}

export const FAQSPage: React.FC<FAQSPageProps> = ({ onNavigateToContact }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-stone-900">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Everything you need to know about our pet essentials, secure payments, free delivery worldwide, and multi-item bundle savings.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-start gap-3">
          <Truck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-semibold text-stone-900">Free Worldwide Delivery</h3>
            <p className="text-stone-500 mt-0.5">Complimentary express shipping on every single order with no minimum spend.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-start gap-3">
          <Gift className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-semibold text-stone-900">Multi-Item Bundle Savings</h3>
            <p className="text-stone-500 mt-0.5">Order 2 or more pet products to activate bundle discounts and special perks.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-semibold text-stone-900">Verified DPO Gateway</h3>
            <p className="text-stone-500 mt-0.5">PCI-DSS Level 1 compliant checkout for cards and mobile money.</p>
          </div>
        </div>
      </div>

      {/* Accordion Questions */}
      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="transition-colors">
            <button
              onClick={() => toggle(idx)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors cursor-pointer"
            >
              <span className="font-semibold text-stone-900 text-sm sm:text-base">
                {item.q}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                  openIndex === idx ? 'rotate-180 text-stone-900' : ''
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still Have Questions Banner */}
      <div className="bg-stone-100 rounded-2xl p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-stone-900">Still have a question?</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          We are always happy to help our pet parent community. Reach out to our direct email{' '}
          <span className="font-mono font-semibold text-stone-900">ricopack0117@gmail.com</span> or message us on Instagram{' '}
          <span className="font-semibold text-stone-900">@lzgpaw</span>.
        </p>
        <button
          onClick={onNavigateToContact}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Contact Support Team
        </button>
      </div>
    </div>
  );
};
