import { InAppNotification } from '../types/store';

const NOTIFICATIONS_STORAGE_KEY = 'lzgpaw_notifications_v1';

export class NotificationService {
  private static listeners: ((notifications: InAppNotification[]) => void)[] = [];

  public static getNotifications(): InAppNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) {
        const initial: InAppNotification[] = [
          {
            id: 'notif-welcome',
            title: 'Welcome to LzgPaw! 🐾',
            message: 'Enjoy Free Delivery on every order, plus Buy 2 and Get a Free Gift automatically!',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            read: false,
            type: 'promo',
          },
          {
            id: 'notif-order-demo',
            title: 'Order Dispatched · LZG-8492',
            message: 'Your CloudSupport Bed and WhiskerCalm Fountain are in transit with DHL PetExpress!',
            timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
            read: false,
            orderId: 'LZG-8492',
            type: 'order',
          },
        ];
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public static subscribe(listener: (notifications: InAppNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(notifications: InAppNotification[]) {
    this.listeners.forEach((l) => l(notifications));
  }

  public static async requestBrowserPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Could not request notification permission', err);
      return 'denied';
    }
  }

  public static getBrowserPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public static sendPushNotification(title: string, message: string, orderId?: string) {
    const notif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      orderId,
      type: orderId ? 'order' : 'system',
    };

    // Save to In-App notification list
    const current = this.getNotifications();
    const updated = [notif, ...current];
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    this.notifyListeners(updated);

    // If native Web Notification is granted, trigger browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Native notification trigger warning', err);
      }
    }

    return notif;
  }

  public static markAllAsRead() {
    const current = this.getNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    this.notifyListeners(updated);
  }

  public static clearNotifications() {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    this.notifyListeners([]);
  }
}
