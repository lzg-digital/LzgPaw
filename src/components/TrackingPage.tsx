import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, Home, MapPin, Bell, Gift, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../types/store';
import { StoreStorage } from '../services/storeStorage';
import { NotificationService } from '../services/notifications';

interface TrackingPageProps {
  initialOrderId?: string;
  onNavigateToContact?: () => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({
  initialOrderId,
  onNavigateToContact,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId || 'LZG-8492');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPushStatus(NotificationService.getBrowserPermission());
    if (initialOrderId) {
      handleSearch(initialOrderId);
    } else {
      handleSearch('LZG-8492');
    }
  }, [initialOrderId]);

  const handleSearch = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    if (!q) return;

    setHasSearched(true);
    const found = StoreStorage.getOrderById(q);
    setOrder(found || null);
  };

  const handleEnablePush = async () => {
    const res = await NotificationService.requestBrowserPermission();
    setPushStatus(res);
    if (res === 'granted' && order) {
      NotificationService.sendPushNotification(
        `🔔 Tracking Alerts Activated · Order #${order.id}`,
        `You will receive live device updates as ${order.carrier} makes progress toward delivery.`
      );
    }
  };

  const steps: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'placed', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'DPO Pay Verified', icon: ShieldCheck },
    { key: 'processing', label: 'Packed & Prepared', icon: Package },
    { key: 'shipped', label: 'In Transit', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'delivered', label: 'Delivered Safely', icon: Home },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const mapping: Record<OrderStatus, number> = {
      placed: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      out_for_delivery: 4,
      delivered: 5,
      cancelled: -1,
    };
    return mapping[status] ?? 0;
  };

  const currentStepIndex = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
          Live Order & Delivery Tracking
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Track your LzgPaw shipment in real time. All orders enjoy complimentary worldwide delivery and real-time courier status.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order # (e.g. LZG-8492) or Email..."
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Track
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2.5 px-1">
          <span>Quick Demo Orders:</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchQuery('LZG-8492');
                handleSearch('LZG-8492');
              }}
              className="text-amber-900 hover:underline font-mono"
            >
              LZG-8492 (Shipped)
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setSearchQuery('LZG-9281');
                handleSearch('LZG-9281');
              }}
              className="text-amber-900 hover:underline font-mono"
            >
              LZG-9281 (Processing)
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Results */}
      {order ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          {/* Status Header */}
          <div className="p-5 sm:p-6 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Order Number:</span>
                <span className="font-mono font-bold text-stone-900 text-base">#{order.id}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                  {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Courier & Push Button */}
            <div className="flex flex-wrap items-center gap-2">
              {pushStatus !== 'granted' ? (
                <button
                  onClick={handleEnablePush}
                  className="text-xs font-semibold px-3 py-1.5 bg-amber-100/90 text-amber-950 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-800" />
                  <span>Notify Me on Status Change</span>
                </button>
              ) : (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Push Alerts Subscribed</span>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-6 sm:p-8">
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-100 -z-0">
                <div
                  className="h-full bg-stone-900 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-stone-900 text-white shadow-md'
                            : 'bg-stone-100 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-amber-200' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs font-medium mt-2.5 ${
                          isDone ? 'text-stone-900 font-semibold' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carrier & Transit Info Box */}
            <div className="mt-8 bg-stone-50 rounded-xl p-4 border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Shipping Carrier</span>
                <span className="font-semibold text-stone-900 mt-0.5 block flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-800" /> {order.carrier}
                </span>
                <span className="text-emerald-700 font-medium text-[11px]">Free Worldwide Delivery</span>
              </div>
              <div>
                <span className="text-stone-500 block">Courier Tracking Number</span>
                <span className="font-mono font-semibold text-stone-900 mt-0.5 block">
                  {order.trackingNumber}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Estimated Arrival</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">
                  {order.estimatedDelivery}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Timeline Feed */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-4">
              Real-Time Tracking Events
            </h3>
            <div className="space-y-4 pl-2 border-l-2 border-stone-200">
              {order.statusHistory.map((item, idx) => (
                <div key={idx} className="relative pl-5">
                  <div className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-amber-600 ring-4 ring-white" />
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-stone-900 capitalize">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{item.note}</p>
                  {item.location && (
                    <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Order Package Details */}
          <div className="p-6 bg-stone-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Shipment Contents ({order.items.reduce((a, b) => a + b.quantity, 0)} items)
            </h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-stone-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/product_orthopedic_bed_1790283966759.jpg';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-stone-900">{item.product.name}</h4>
                      <span className="text-stone-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Multi-Item Bonus Item */}
              {order.freeGifts.length > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-800">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span>Multi-Item Bonus Perk</span>
                      </div>
                      <span className="text-stone-600">Complimentary Companion Care Pack</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">Included ($0.00)</span>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 text-stone-600">
              <div>
                <span>DPO Pay Transaction: </span>
                <span className="font-mono text-stone-900 font-semibold">{order.dpoTransactionId}</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-stone-900">
                <span>Total Paid:</span>
                <span className="font-mono">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        hasSearched && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto stroke-[1.2]" />
            <h3 className="font-semibold text-stone-900 text-base">No Shipment Found</h3>
            <p className="text-xs text-stone-500">
              We could not locate an order matching &quot;{searchQuery}&quot;. Please double check the ID in your confirmation email or try one of the sample orders above.
            </p>
            {onNavigateToContact && (
              <button
                onClick={onNavigateToContact}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-700 pt-2"
              >
                <span>Contact LzgPaw Support</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      )}

      {/* Need Help Banner */}
      <div className="bg-stone-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-700 shadow-xs shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm">Have Questions About Your Pet Delivery?</h4>
            <p className="text-stone-600 mt-0.5">
              Email us directly at <span className="font-mono font-semibold text-stone-900">ricopack0117@gmail.coma</span> or message our Instagram <span className="font-semibold text-stone-900">@lzgpaw</span>.
            </p>
          </div>
        </div>
        {onNavigateToContact && (
          <button
            onClick={onNavigateToContact}
            className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-900 font-semibold rounded-lg shrink-0 cursor-pointer shadow-xs"
          >
            Contact Support
          </button>
        )}
      </div>
    </div>
  );
};
