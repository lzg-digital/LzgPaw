import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, Sparkles, Package, ExternalLink, ShieldCheck } from 'lucide-react';
import { InAppNotification } from '../types/store';
import { NotificationService } from '../services/notifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setNotifications(NotificationService.getNotifications());
    setPermission(NotificationService.getBrowserPermission());

    const unsubscribe = NotificationService.subscribe((updated) => {
      setNotifications(updated);
    });

    return unsubscribe;
  }, []);

  const handleRequestPermission = async () => {
    const result = await NotificationService.requestBrowserPermission();
    setPermission(result);
    if (result === 'granted') {
      NotificationService.sendPushNotification(
        '🔔 Push Notifications Activated!',
        'You will now receive instant push updates whenever your LzgPaw order status changes.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">Notifications & Alerts</h2>
              <p className="text-xs text-stone-500">Live order status & bundle deals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Opt-in Prompt */}
        {permission !== 'granted' && (
          <div className="bg-amber-50/70 border-b border-amber-200/60 p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-amber-900">Enable Live Device Push Notifications</p>
              <p className="text-amber-700 mt-0.5">
                Receive instant browser alerts when your package is packed, dispatched, or out for delivery.
              </p>
              <button
                onClick={handleRequestPermission}
                className="mt-2 text-xs font-semibold px-3 py-1 bg-amber-900 text-white rounded hover:bg-amber-800 transition-colors"
              >
                Enable Push Alerts
              </button>
            </div>
          </div>
        )}

        {permission === 'granted' && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Web Push Notifications are Active
            </span>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-stone-400">
              <Bell className="w-8 h-8 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No new notifications</p>
              <p className="text-xs mt-1">Updates on your pet orders will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border text-xs transition-all ${
                  item.read ? 'bg-stone-50 border-stone-200' : 'bg-white border-amber-300/80 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'order' ? (
                      <Package className="w-4 h-4 text-stone-700" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-700" />
                    )}
                    <span className="font-semibold text-stone-900">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1.5 text-stone-600 leading-relaxed">{item.message}</p>

                {item.orderId && (
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-500">Order #{item.orderId}</span>
                    <button
                      onClick={() => {
                        onClose();
                        if (onSelectOrder && item.orderId) {
                          onSelectOrder(item.orderId);
                        }
                      }}
                      className="text-[11px] font-medium text-amber-900 hover:text-amber-700 flex items-center gap-1"
                    >
                      Track Package <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
          <button
            onClick={() => NotificationService.markAllAsRead()}
            className="text-stone-600 hover:text-stone-900 flex items-center gap-1.5 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
          <button
            onClick={() => NotificationService.clearNotifications()}
            className="text-stone-400 hover:text-stone-600"
          >
            Clear history
          </button>
        </div>
      </div>
    </div>
  );
};
