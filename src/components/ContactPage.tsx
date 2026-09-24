import React, { useState } from 'react';
import { Mail, Instagram, MapPin, Clock, Send, CheckCircle2, ShieldCheck, Truck, HelpCircle } from 'lucide-react';

interface ContactPageProps {
  onNavigateToFaqs: () => void;
  onNavigateToTracking: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateToFaqs,
  onNavigateToTracking,
}) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    petName: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-stone-900">
          Contact LzgPaw Care Support
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          We’re here for you and your companion. Whether you have questions about our orthopedic sizing, DPO Pay checkout, or free delivery, reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Column */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-semibold text-stone-900 text-sm">Direct Contact Channels</h3>

            <div className="space-y-3 text-xs">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-900 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Direct Support Email</span>
                  <a
                    href="mailto:ricopack0117@gmail.coma"
                    className="font-mono font-semibold text-stone-900 hover:text-amber-800 transition-colors break-all"
                  >
                    ricopack0117@gmail.coma
                  </a>
                  <p className="text-[11px] text-stone-500 mt-0.5">Replies typically within 2-4 hours</p>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-900 shrink-0 mt-0.5">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Official Instagram</span>
                  <a
                    href="https://instagram.com/lzgpaw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-stone-900 hover:text-amber-800 transition-colors"
                  >
                    @lzgpaw
                  </a>
                  <p className="text-[11px] text-stone-500 mt-0.5">Daily pet tips, customer photos & drops</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Care Team Availability</span>
                  <span className="font-semibold text-stone-900">Monday – Saturday: 8am – 8pm PST</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Sunday: 10am – 4pm PST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-stone-900 text-xs">Quick Assistance</h4>
            <button
              onClick={onNavigateToTracking}
              className="w-full text-left py-1.5 text-stone-700 hover:text-stone-900 flex items-center justify-between cursor-pointer"
            >
              <span>Track Your Existing Shipment</span>
              <Truck className="w-3.5 h-3.5 text-stone-400" />
            </button>
            <button
              onClick={onNavigateToFaqs}
              className="w-full text-left py-1.5 text-stone-700 hover:text-stone-900 flex items-center justify-between cursor-pointer"
            >
              <span>Read DPO Pay & Returns FAQs</span>
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-stone-900">Message Received!</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you, {form.name}. Our pet care specialist will get back to you at{' '}
                <span className="font-semibold text-stone-900">{form.email}</span> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', petName: '', subject: '', message: '' });
                }}
                className="mt-4 px-5 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jordan@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Pet Name & Breed (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Milo · Golden Retriever"
                    value={form.petName}
                    onChange={(e) => setForm({ ...form, petName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Topic / Order ID</label>
                  <input
                    type="text"
                    placeholder="e.g. Order #LZG-8492 or Sizing Question"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you and your pet today?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry to ricopack0117@gmail.coma</span>
              </button>

              <div className="pt-2 text-center text-[11px] text-stone-400">
                🔒 Protected by 256-bit SSL. Your personal details are never shared.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
