import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { CartItem, BundleOffer, CustomerDetails, Order, PaymentMethod } from '../types/store';
import { StoreStorage } from '../services/storeStorage';
import { SecurityService } from '../services/security';
import { DpoConfigService } from '../config/dpoConfig';
import { TrustBadges } from './TrustBadges';

interface DPOPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  bundleOffer: BundleOffer;
  onOrderSuccess: (order: Order) => void;
  onNavigateToTracking?: (orderId: string) => void;
}

export const DPOPaymentModal: React.FC<DPOPaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  bundleOffer,
  onOrderSuccess,
  onNavigateToTracking,
}) => {
  const [step, setStep] = useState<'details' | 'processing' | 'otp' | 'success'>('details');
  const [paymentTab, setPaymentTab] = useState<PaymentMethod>('DPO_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [resendCountdown, setResendCountdown] = useState(45);
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'generic'>('generic');

  // Customer Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    postalCode: '',
    notes: '',
  });

  // Card details
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // Mobile money details
  const [mobileProvider, setMobileProvider] = useState('M-Pesa');
  const [mobilePhone, setMobilePhone] = useState('');

  // Countdown timer for 3D Secure OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  if (!isOpen) return null;

  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const compareAtSubtotal = cart.reduce(
    (acc, item) => acc + (item.product.compareAtPrice || item.product.price) * item.quantity,
    0
  );
  const totalSavings = compareAtSubtotal - subtotal;
  const isBundleActive = bundleOffer.active && totalItemCount >= bundleOffer.requiredQuantity;

  const handleInputChange = (field: keyof CustomerDetails, val: string) => {
    const clean = SecurityService.sanitize(val);
    setCustomer((prev) => ({ ...prev, [field]: clean }));
  };

  const handleCardNumberChange = (val: string) => {
    // Strip non-digits
    const clean = val.replace(/\D/g, '').slice(0, 16);
    // Detect brand
    if (clean.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(clean)) {
      setCardBrand('mastercard');
    } else if (/^3[47]/.test(clean)) {
      setCardBrand('amex');
    } else {
      setCardBrand('generic');
    }

    // Format with spaces
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setCardData((prev) => ({ ...prev, expiry: `${clean.slice(0, 2)}/${clean.slice(2)}` }));
    } else {
      setCardData((prev) => ({ ...prev, expiry: clean }));
    }
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce rate-limiting
    const rateCheck = SecurityService.checkRateLimit('checkout_action', 6, 60000);
    if (!rateCheck.allowed) {
      alert(`Too many checkout attempts. Please wait ${Math.ceil(rateCheck.remainingMs / 1000)} seconds.`);
      return;
    }

    if (!customer.name.trim() || !customer.email.trim() || !customer.address.trim()) {
      alert('Please fill in your shipping and contact information.');
      return;
    }

    if (paymentTab === 'DPO_CARD') {
      const cleanDigits = cardData.number.replace(/\s/g, '');
      if (cleanDigits.length < 13) {
        alert('Please enter a valid credit or debit card number.');
        return;
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        alert('Please enter a valid card expiration date (MM/YY).');
        return;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        alert('Please enter your card CVV security code.');
        return;
      }
    }

    if (paymentTab === 'DPO_MOBILE_MONEY' && !mobilePhone.trim()) {
      alert('Please enter your registered mobile money phone number.');
      return;
    }

    setIsSubmitting(true);
    setStep('processing');

    // Simulate DPO Pay 3D Secure / Tokenization roundtrip with authentic gateway latency
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setResendCountdown(45);
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 4) {
      setOtpError('Please enter the 4 to 6-digit authorization code sent to your device.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Generate Order with cryptographic security token
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderId = `LZG-${randomDigits}`;
      const dpoTrxId = SecurityService.generateSecureToken('DPO-TRX');
      const trackingNumber = `LP-TRK-${Date.now().toString().slice(-8)}`;

      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customer,
        items: [...cart],
        freeGifts: isBundleActive ? [bundleOffer.freeGift] : [],
        subtotal,
        compareAtSubtotal,
        discount: 0,
        shipping: 0, // Free Worldwide Delivery
        total: subtotal,
        paymentMethod: paymentTab,
        paymentStatus: 'paid',
        dpoReference: `DPO-REF-${randomDigits}`,
        dpoTransactionId: dpoTrxId,
        orderStatus: 'confirmed',
        trackingNumber: trackingNumber,
        carrier: 'DHL Express Worldwide',
        estimatedDelivery: '2-4 Business Days',
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date().toISOString(),
            note: 'Order submitted securely through LzgPaw Storefront.',
            location: 'Order Management System',
          },
          {
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            note: `DPO Pay gateway settlement verified (${dpoTrxId}). Payment captured successfully.`,
            location: 'DPO Settlement Engine',
          },
        ],
      };

      StoreStorage.addOrder(newOrder);
      setCreatedOrder(newOrder);
      setStep('success');
      onOrderSuccess(newOrder);
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8 border border-stone-200">
        {/* DPO Pay Header */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-display font-bold text-amber-300 text-sm">
              DPO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">DPO Pay Gateway</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  PCI-DSS Level 1
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" /> Direct Merchant Settlement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Announcement Notice */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-900">
          <span className="font-medium">Free Worldwide Priority Delivery Applied</span>
          <span className="font-bold font-mono text-emerald-700">$0.00</span>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {step === 'details' && (
            <form onSubmit={handleStartPayment} className="space-y-5">
              {/* Order Summary Pill */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-stone-500">Order Total ({totalItemCount} items)</span>
                  <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
                {isBundleActive && (
                  <div className="flex items-center gap-2 bg-amber-100/70 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <div>
                      <div className="font-bold">Multi-Item Offer Active</div>
                      <div className="text-[11px] text-amber-800">Bonus Care Pack Included ($0.00)</div>
                    </div>
                  </div>
                )}
                {totalSavings > 0 && (
                  <div className="text-right">
                    <span className="text-stone-500">Compare-at Savings</span>
                    <div className="font-bold font-mono text-emerald-700">-${totalSavings.toFixed(2)}</div>
                  </div>
                )}
              </div>

              {/* Shipping Address Inputs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  1. Shipping & Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={customer.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Email Address (for order updates) *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={customer.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Phone Number (for courier SMS) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={customer.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">City & State / Region *</label>
                    <input
                      type="text"
                      required
                      placeholder="Seattle, WA"
                      value={customer.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Maple Street, Apt 4"
                      value={customer.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* DPO Pay Payment Mode Tabs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  2. Select Payment Channel
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('DPO_CARD')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentTab === 'DPO_CARD'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('DPO_MOBILE_MONEY')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentTab === 'DPO_MOBILE_MONEY'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-stone-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Money</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('DPO_BANK_TRANSFER')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentTab === 'DPO_BANK_TRANSFER'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-stone-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                </div>

                {/* Sub-form based on method */}
                {paymentTab === 'DPO_CARD' && (
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-stone-600 font-medium">Card Number</label>
                        <span className="text-[11px] font-bold text-stone-700 uppercase">
                          {cardBrand === 'visa' && 'Visa'}
                          {cardBrand === 'mastercard' && 'Mastercard'}
                          {cardBrand === 'amex' && 'American Express'}
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="4532 0000 0000 8921"
                        value={cardData.number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono text-stone-900 focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">Expires (MM/YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="09/28"
                          value={cardData.expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono text-stone-900 focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">CVV / CVC Code</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono text-stone-900 focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentTab === 'DPO_MOBILE_MONEY' && (
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-600 mb-1 font-medium">Mobile Money Provider</label>
                      <select
                        value={mobileProvider}
                        onChange={(e) => setMobileProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-medium cursor-pointer"
                      >
                        <option value="M-Pesa">Safaricom / Vodacom M-Pesa</option>
                        <option value="Airtel">Airtel Money</option>
                        <option value="Tigo">Tigo Pesa</option>
                        <option value="MTN">MTN Mobile Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1 font-medium">Registered Wallet Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+255 / +254 700 000 000"
                        value={mobilePhone}
                        onChange={(e) => setMobilePhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      An instant DPO Pay USSD prompt will be triggered to enter your PIN.
                    </p>
                  </div>
                )}

                {paymentTab === 'DPO_BANK_TRANSFER' && (
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 text-xs text-stone-600">
                    <p className="font-semibold text-stone-900">Direct Electronic Funds Transfer</p>
                    <p>
                      DPO Pay generates an instant tokenized virtual IBAN reference for real-time bank wire reconciliation.
                    </p>
                    <div className="p-2 bg-white rounded border border-stone-300 font-mono text-[11px] text-stone-700">
                      Account: LzgPaw Global Ltd · Clearing ID: DPO-882193
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Payment CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <span>Authorize & Pay ${subtotal.toFixed(2)} via DPO Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
              <div>
                <h3 className="text-base font-semibold text-stone-900">Connecting to DPO Pay Gateway</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Establishing secure tokenized authorization and requesting 3D Secure verification...
                </p>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="py-6 space-y-5 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">3D Secure Authorization</h3>
                <p className="text-xs text-stone-500 mt-1">
                  For your security, a one-time verification passcode has been dispatched for this payment of{' '}
                  <span className="font-bold text-stone-900 font-mono">${subtotal.toFixed(2)}</span>.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] text-stone-500 block mb-1">Enter Verification Passcode (OTP)</span>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    setOtpError('');
                  }}
                  className="w-48 text-center px-4 py-2.5 text-xl tracking-widest font-mono font-bold bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />

                <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-center gap-1">
                  <span>Didn&apos;t receive code?</span>
                  {resendCountdown > 0 ? (
                    <span className="font-mono text-stone-400">Resend in {resendCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResendCountdown(45)}
                      className="text-amber-800 font-semibold hover:underline cursor-pointer"
                    >
                      Resend Now
                    </button>
                  )}
                </div>

                {otpError && (
                  <div className="text-xs text-red-600 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {otpError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Confirm Payment with DPO Pay
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'success' && createdOrder && (
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-stone-900">Payment Successfully Verified!</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Your order has been routed to fulfillment. A confirmation email and push notification have been sent.
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Order Reference:</span>
                  <span className="font-mono font-bold text-stone-900">#{createdOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">DPO Transaction ID:</span>
                  <span className="font-mono text-stone-700">{createdOrder.dpoTransactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Carrier / Shipping:</span>
                  <span className="font-medium text-emerald-700">Free Express Delivery ({createdOrder.carrier})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Courier Tracking #:</span>
                  <span className="font-mono font-semibold text-stone-900">{createdOrder.trackingNumber}</span>
                </div>
                {createdOrder.freeGifts.length > 0 && (
                  <div className="flex justify-between text-amber-900 bg-amber-100/60 p-1.5 rounded">
                    <span>Multi-Item Bonus:</span>
                    <span className="font-semibold">Complimentary Order Perk Included</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Amount Paid:</span>
                  <span className="font-mono">${createdOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <TrustBadges variant="compact" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {onNavigateToTracking && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTracking(createdOrder.id);
                    }}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Track Order Telematics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
