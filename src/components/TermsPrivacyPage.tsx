import React, { useState } from 'react';
import { Shield, FileText, Lock, Mail, CheckCircle2, ChevronRight, Instagram } from 'lucide-react';

interface TermsPrivacyPageProps {
  onNavigateToContact?: () => void;
}

export const TermsPrivacyPage: React.FC<TermsPrivacyPageProps> = ({ onNavigateToContact }) => {
  const [activeSection, setActiveSection] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-display font-bold text-stone-900">
          Legal & Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Clear, transparent commitments on consumer protection, payment security, and pet safety standards.
        </p>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-stone-200/80 rounded-xl mt-4">
          <button
            onClick={() => setActiveSection('terms')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSection === 'terms'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSection === 'privacy'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Privacy & Data Security
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
        {activeSection === 'terms' ? (
          <>
            <div className="space-y-3 pb-6 border-b border-stone-100">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Last Updated: September 2026
              </span>
              <h2 className="text-xl font-bold font-display text-stone-900">
                1. General Agreement & Storefront Operation
              </h2>
              <p>
                Welcome to <strong>LzgPaw</strong>. By browsing our website, placing an order, or utilizing our tracking systems, you agree to comply with and be bound by the following terms and conditions. These terms govern the purchase of all premium pet products, beds, fountains, and wellness accessories supplied by LzgPaw.
              </p>
            </div>

            <div className="space-y-3 pb-6 border-b border-stone-100">
              <h2 className="text-xl font-bold font-display text-stone-900">
                2. Pricing, Free Delivery Guarantee & Promotions
              </h2>
              <ul className="space-y-2 list-disc list-inside text-stone-600">
                <li>
                  <strong>Free Worldwide Delivery:</strong> LzgPaw provides complimentary standard and express delivery on all orders without minimum purchase thresholds or surprise checkout surcharges.
                </li>
                <li>
                  <strong>Compare-at Pricing:</strong> Strike-through prices indicate regular manufacturer recommended retail values. The active discounted price shown is the final amount billed.
                </li>
                <li>
                  <strong>Offer Bundles:</strong> When ordering qualifying multi-item bundles (such as ordering 2 or more products), bundle discounts and automatic complimentary items are applied at checkout according to active store promotions.
                </li>
              </ul>
            </div>

            <div className="space-y-3 pb-6 border-b border-stone-100">
              <h2 className="text-xl font-bold font-display text-stone-900">
                3. Secure Payment Terms (DPO Pay Gateway)
              </h2>
              <p>
                All transactions are securely routed through <strong>Direct Pay Online (DPO Group)</strong>, an internationally certified payment gateway. We support major payment cards (Visa, Mastercard, American Express), Mobile Money (M-Pesa, Airtel Money, MTN MoMo), and authorized bank transfers.
              </p>
              <p className="text-stone-600">
                LzgPaw does not store raw credit card numbers or Mobile Money PINs. Payment tokens are encrypted and authenticated directly with card networks and mobile telecommunications operators using 3D Secure protocols.
              </p>
            </div>

            <div className="space-y-3 pb-6 border-b border-stone-100">
              <h2 className="text-xl font-bold font-display text-stone-900">
                4. 30-Day Pet Happiness Guarantee & Returns
              </h2>
              <p>
                We stand behind our materials and ergonomic designs. If you or your companion are not completely satisfied with your purchase, you may initiate a return or exchange within thirty (30) days of receipt:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                <li>Items must be undamaged and in clean condition.</li>
                <li>Refunds are returned to the original payment method verified by DPO Pay within 3–5 business days of inspection.</li>
                <li>To initiate an exchange or refund, contact our care team at <strong>ricopack0117@gmail.coma</strong> or via Instagram <strong>@lzgpaw</strong>.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold font-display text-stone-900">
                5. Product Safety & Veterinary Disclaimers
              </h2>
              <p>
                While all LzgPaw beds, leashes, feeders, and accessories are manufactured using non-toxic, pet-safe materials, pet owners are encouraged to supervise their companions with any new household item. LzgPaw is not liable for incidental damage resulting from improper assembly or unrecommended chewing.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 pb-6 border-b border-stone-100">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Last Updated: September 2026
              </span>
              <h2 className="text-xl font-bold font-display text-stone-900">
                1. Information We Collect
              </h2>
              <p>
                We value your privacy and only collect personal information necessary to fulfill orders, process payments, and provide live shipment tracking:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                <li><strong>Contact Details:</strong> Customer name, shipping address, email address, and phone number for carrier delivery updates.</li>
                <li><strong>Order History:</strong> Product selections, order IDs, courier tracking numbers, and fulfillment records.</li>
                <li><strong>Technical Information:</strong> Device type and browser notification tokens when you opt in to receive shipment tracking alerts.</li>
              </ul>
            </div>

            <div className="space-y-3 pb-6 border-b border-stone-100">
              <h2 className="text-xl font-bold font-display text-stone-900">
                2. How We Safeguard Payment Information
              </h2>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-stone-900">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Tokenized Financial Data Protection</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your financial details are processed via Direct Pay Online (DPO Group) under PCI-DSS Level 1 compliance. LzgPaw servers never receive, store, or transmit your credit card security CVV codes or mobile wallet PINs. All data transmission between your browser and the payment gateway is encrypted with modern TLS security.
                </p>
              </div>
            </div>

            <div className="space-y-3 pb-6 border-b border-stone-100">
              <h2 className="text-xl font-bold font-display text-stone-900">
                3. Browser Push Notifications & Tracking
              </h2>
              <p>
                When you click &quot;Notify Me&quot; on our tracking page or after checkout, your browser registers a local push notification permission solely for updating you on delivery transitions (e.g. dispatched, in transit, delivered). You can revoke notification permissions at any time through your browser settings.
              </p>
            </div>

            <div className="space-y-3 pb-6 border-b border-stone-100">
              <h2 className="text-xl font-bold font-display text-stone-900">
                4. Third-Party Sharing
              </h2>
              <p>
                We strictly <strong>never sell, rent, or trade</strong> your personal data to marketing brokers or advertisers. Data is shared exclusively with necessary logistics partners (courier carriers) and our authorized payment processor (DPO Pay) to execute fulfillment.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold font-display text-stone-900">
                5. Your Rights & Privacy Inquiries
              </h2>
              <p>
                You have the right to request access to the information we hold about you, request corrections, or ask for complete deletion of your records. For any inquiries regarding our privacy standards, contact:
              </p>
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs font-mono space-y-1">
                <div>Email: <a href="mailto:ricopack0117@gmail.coma" className="text-stone-900 font-bold underline">ricopack0117@gmail.coma</a></div>
                <div>Instagram: <a href="https://instagram.com/lzgpaw" target="_blank" rel="noopener noreferrer" className="text-stone-900 font-bold underline">@lzgpaw</a></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Support Assistance */}
      <div className="bg-stone-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="font-bold text-stone-900 text-sm">Need Clarification on Our Terms or Privacy?</h4>
          <p className="text-stone-600 mt-0.5">
            Our support desk is always open to clarify policy questions for our pet parent community.
          </p>
        </div>
        {onNavigateToContact && (
          <button
            onClick={onNavigateToContact}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold shrink-0 cursor-pointer shadow-xs"
          >
            Contact Customer Support
          </button>
        )}
      </div>
    </div>
  );
};
