import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Home, 
  MapPin, 
  Bell, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const [allRecentOrders, setAllRecentOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSubscribed, setSmsSubscribed] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);

  useEffect(() => {
    setPushStatus(NotificationService.getBrowserPermission());
    const ordersList = StoreStorage.getOrders();
    setAllRecentOrders(ordersList);

    if (initialOrderId) {
      handleSearch(initialOrderId);
    } else if (ordersList.length > 0) {
      // Automatically load the customer's most recent order
      const mostRecent = ordersList[0];
      setSearchQuery(mostRecent.id);
      setOrder(mostRecent);
      setHasSearched(true);
    }
  }, [initialOrderId]);

  const handleSearch = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    if (!q) return;

    setHasSearched(true);
    const found = StoreStorage.getOrderById(q);
    setOrder(found || null);
    if (found) {
      setSearchQuery(found.id);
    }
  };

  const handleRefreshSignal = () => {
    if (!order) return;
    setIsRefreshing(true);
    setTimeout(() => {
      // Reload fresh order data
      const refreshed = StoreStorage.getOrderById(order.id);
      if (refreshed) {
        setOrder(refreshed);
      }
      setIsRefreshing(false);
      setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 800);
  };

  const handleCopyTrackingNumber = () => {
    if (!order) return;
    navigator.clipboard?.writeText(order.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
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

  const handleSmsSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsPhone.trim()) return;
    setSmsLoading(true);
    setTimeout(() => {
      setSmsLoading(false);
      setSmsSubscribed(true);
    }, 900);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const steps: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'placed', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'DPO Pay Verified', icon: ShieldCheck },
    { key: 'processing', label: 'Packed & Inspected', icon: Package },
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Global Logistics Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
          Live Order & Delivery Tracking
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Track your LzgPaw shipment with live courier telematics. Complimentary worldwide delivery and real-time transit telemetry on every order.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-stone-200 shadow-sm max-w-xl mx-auto">
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
              placeholder="Search by Order # (e.g. LZG-8492), Tracking # or Email..."
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs active:scale-98"
          >
            Track Order
          </button>
        </form>

        {/* Recent Placed Orders for Easy One-Click Lookup */}
        {allRecentOrders.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Recent Shipments:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {allRecentOrders.slice(0, 3).map((ro) => (
                <button
                  key={ro.id}
                  onClick={() => {
                    setSearchQuery(ro.id);
                    handleSearch(ro.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                    order?.id === ro.id
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span>#{ro.id}</span>
                  <span className="text-[10px] opacity-75 capitalize">({ro.orderStatus.replace(/_/g, ' ')})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {order ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          {/* Status Header */}
          <div className="p-5 sm:p-6 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-stone-500 font-medium">Order Number:</span>
                <span className="font-mono font-bold text-stone-900 text-base">#{order.id}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="bg-stone-200 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                  DPO Pay Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Delivered by {order.carrier}
              </p>
            </div>

            {/* Courier Sync & Print Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefreshSignal}
                disabled={isRefreshing}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                title="Refresh live carrier telematics"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Refresh Status'}</span>
              </button>

              <button
                onClick={handlePrintSlip}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Print delivery slip"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Print Slip</span>
              </button>

              {pushStatus !== 'granted' ? (
                <button
                  onClick={handleEnablePush}
                  className="text-xs font-semibold px-3 py-1.5 bg-amber-100/90 text-amber-950 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-800" />
                  <span>Notify Me</span>
                </button>
              ) : (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alerts Active</span>
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
                        } ${isCurrent ? 'ring-4 ring-amber-200 scale-105' : ''}`}
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
            <div className="mt-8 bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Shipping Logistics Partner</span>
                <span className="font-bold text-stone-900 mt-1 block flex items-center gap-1.5 text-sm">
                  <Truck className="w-4 h-4 text-amber-800" /> {order.carrier}
                </span>
                <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">
                  ✓ Priority Dispatch · Free Worldwide Delivery
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Courier Tracking Number</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {order.trackingNumber}
                  </span>
                  <button
                    onClick={handleCopyTrackingNumber}
                    className="p-1 text-stone-500 hover:text-stone-900 rounded bg-white border border-stone-200 cursor-pointer"
                    title="Copy tracking number"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Last signal ping: {lastRefreshedTime}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block">Estimated Arrival Window</span>
                <span className="font-bold text-stone-900 mt-1 block text-sm">
                  {order.estimatedDelivery}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Delivering to: {order.customer.city || 'Verified Address'}, {order.customer.country || 'International'}
                </span>
              </div>
            </div>

            {/* Interactive Live Transit Progress Bar Route */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-stone-50 to-emerald-50/70 border border-stone-200 text-xs">
              <div className="flex items-center justify-between text-stone-600 font-semibold mb-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Live Route Telemetry
                </span>
                <span className="text-stone-500 text-[11px]">Direct Transit Air Cargo</span>
              </div>
              <div className="relative w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(15, (currentStepIndex + 1) * 18))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 mt-1.5">
                <span>Distribution Hub</span>
                <span>Customs Passed</span>
                <span>Regional Facility</span>
                <span>Local Doorstep</span>
              </div>
            </div>
          </div>

          {/* SMS / WhatsApp Updates Subscription Box */}
          <div className="p-5 sm:p-6 bg-amber-50/40 border-b border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Get Instant SMS / WhatsApp Out-For-Delivery Alerts
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Receive carrier SMS notifications when your pet package is loaded into the delivery van.
                  </p>
                </div>
              </div>

              {smsSubscribed ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/80 px-3 py-2 rounded-lg font-semibold border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>SMS Alerts Active for {smsPhone}</span>
                </div>
              ) : (
                <form onSubmit={handleSmsSubscribe} className="flex items-center gap-2 shrink-0">
                  <input
                    type="tel"
                    placeholder="Enter phone number..."
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    required
                    className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 w-44 focus:ring-2 focus:ring-stone-900"
                  />
                  <button
                    type="submit"
                    disabled={smsLoading}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    {smsLoading ? 'Registering...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Detailed Timeline Feed */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Official Checkpoint Telemetry History
              </h3>
              <span className="text-[11px] text-stone-400">
                Verified with carrier database
              </span>
            </div>

            <div className="space-y-4 pl-2 border-l-2 border-stone-200">
              {order.statusHistory.map((item, idx) => (
                <div key={idx} className="relative pl-5">
                  <div className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-amber-600 ring-4 ring-white" />
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-stone-900 capitalize">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
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
                    <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" /> {item.location}
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
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-stone-900">{item.product.name}</h4>
                      <span className="text-stone-500">Qty: {item.quantity} · Free Delivery</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Multi-Item Bonus Item if applicable */}
              {order.freeGifts && order.freeGifts.length > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-800">
                      <Package className="w-4 h-4" />
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
                <span>DPO Pay Payment Reference: </span>
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
              We could not locate an order matching &quot;{searchQuery}&quot;. Please double check the ID in your confirmation email or enter the email you used at checkout.
            </p>
            {onNavigateToContact && (
              <button
                onClick={onNavigateToContact}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-700 pt-2 cursor-pointer"
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
              Email us directly at <span className="font-mono font-semibold text-stone-900">ricopack0117@gmail.com</span> or message our Instagram <span className="font-semibold text-stone-900">@lzgpaw</span>.
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
