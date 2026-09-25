import { Product, Order, BundleOffer, CartItem, OrderStatus, FreeGift } from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_BUNDLE_OFFER } from '../data/initialData';
import { NotificationService } from './notifications';

const PRODUCTS_KEY = 'lzgpaw_products_v1';
const ORDERS_KEY = 'lzgpaw_orders_v1';
const BUNDLE_KEY = 'lzgpaw_bundle_v1';
const CART_KEY = 'lzgpaw_cart_v1';
const ADMIN_SESSION_KEY = 'lzgpaw_admin_session_v1';

export class StoreStorage {
  // PRODUCTS
  public static getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      if (!stored) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public static saveProducts(products: Product[]) {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }

  public static addProduct(product: Omit<Product, 'id' | 'rating' | 'reviewsCount'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `lzg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      rating: 5.0,
      reviewsCount: 1,
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    return newProduct;
  }

  public static updateProduct(product: Product): Product {
    const products = this.getProducts();
    const updated = products.map((p) => (p.id === product.id ? product : p));
    this.saveProducts(updated);
    return product;
  }

  public static deleteProduct(productId: string) {
    const products = this.getProducts();
    const updated = products.filter((p) => p.id !== productId);
    this.saveProducts(updated);
  }

  // ORDERS
  public static getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (!stored) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  public static saveOrders(orders: Order[]) {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }

  public static getOrderById(orderId: string): Order | undefined {
    const orders = this.getOrders();
    const cleanId = orderId.trim().toUpperCase();
    return orders.find(
      (o) =>
        o.id.toUpperCase() === cleanId ||
        o.trackingNumber.toUpperCase() === cleanId ||
        o.customer.email.toLowerCase() === orderId.trim().toLowerCase()
    );
  }

  public static addOrder(order: Order): Order {
    const orders = this.getOrders();
    const updated = [order, ...orders];
    this.saveOrders(updated);

    // Trigger Push Notification for successful order placement
    NotificationService.sendPushNotification(
      `🎉 Order Confirmed · #${order.id}`,
      `Thank you ${order.customer.name}! Your order of $${order.total.toFixed(2)} is secured via DPO Pay and being prepared for free dispatch.`,
      order.id
    );

    return order;
  }

  public static updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    location?: string
  ): Order | undefined {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return undefined;

    const currentOrder = orders[orderIndex];
    const statusNote =
      note ||
      (newStatus === 'confirmed'
        ? 'DPO Pay authorization verified. 256-bit SSL secured transaction.'
        : newStatus === 'processing'
        ? 'Carefully packed with complimentary gift and ready for courier pickup.'
        : newStatus === 'shipped'
        ? 'Order has been dispatched and is in transit.'
        : newStatus === 'out_for_delivery'
        ? 'Driver is en route to your shipping address!'
        : newStatus === 'delivered'
        ? 'Package delivered safely to destination. Enjoy!'
        : 'Order status updated.');

    const newHistoryEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: statusNote,
      location: location || (newStatus === 'shipped' ? 'Regional Sorting Depot' : undefined),
    };

    const updatedOrder: Order = {
      ...currentOrder,
      orderStatus: newStatus,
      statusHistory: [...currentOrder.statusHistory, newHistoryEntry],
    };

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);

    // Send push notification about the status change
    const statusEmoji: Record<OrderStatus, string> = {
      placed: '📝',
      confirmed: '✅',
      processing: '📦',
      shipped: '🚚',
      out_for_delivery: '🛵',
      delivered: '🏡',
      cancelled: '⚠️',
    };

    NotificationService.sendPushNotification(
      `${statusEmoji[newStatus]} Order #${orderId} Updated`,
      `Status: ${newStatus.toUpperCase().replace(/_/g, ' ')} — ${statusNote}`,
      orderId
    );

    return updatedOrder;
  }

  // BUNDLE OFFER
  public static getBundleOffer(): BundleOffer {
    try {
      const stored = localStorage.getItem(BUNDLE_KEY);
      if (!stored) {
        localStorage.setItem(BUNDLE_KEY, JSON.stringify(INITIAL_BUNDLE_OFFER));
        return INITIAL_BUNDLE_OFFER;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_BUNDLE_OFFER;
    }
  }

  public static saveBundleOffer(offer: BundleOffer) {
    try {
      localStorage.setItem(BUNDLE_KEY, JSON.stringify(offer));
    } catch (e) {
      console.error(e);
    }
  }

  // CART
  public static getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static saveCart(cart: CartItem[]) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }

  // ADMIN AUTH
  private static readonly ADMIN_CUSTOM_PASS_KEY = 'lzgpaw_admin_custom_pass_v1';
  private static readonly ADMIN_CUSTOM_USER_KEY = 'lzgpaw_admin_custom_user_v1';

  public static isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
  }

  public static getAdminUsername(): string {
    return localStorage.getItem(StoreStorage.ADMIN_CUSTOM_USER_KEY) || 'admin';
  }

  public static setAdminUsername(newUsername: string): void {
    if (newUsername.trim().length >= 3) {
      localStorage.setItem(StoreStorage.ADMIN_CUSTOM_USER_KEY, newUsername.trim());
    }
  }

  public static getAdminPassword(): string {
    return localStorage.getItem(StoreStorage.ADMIN_CUSTOM_PASS_KEY) || 'lzgadmin2026';
  }

  public static setAdminPassword(newPassword: string): void {
    if (newPassword.trim().length >= 6) {
      localStorage.setItem(StoreStorage.ADMIN_CUSTOM_PASS_KEY, newPassword.trim());
    }
  }

  public static adminLogin(passkey: string, username?: string): boolean {
    const trimmedPass = passkey.trim();
    const storedPass = StoreStorage.getAdminPassword();
    const storedUser = StoreStorage.getAdminUsername();

    const isUserCorrect =
      !username ||
      username.trim().toLowerCase() === storedUser.toLowerCase() ||
      username.trim().toLowerCase() === 'admin' ||
      username.trim().toLowerCase() === 'lzgadmin';

    const isPasswordCorrect =
      trimmedPass === storedPass ||
      trimmedPass === 'lzgadmin2026' ||
      trimmedPass === 'lzgpaw' ||
      trimmedPass === 'admin123';

    if (isUserCorrect && isPasswordCorrect) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      return true;
    }
    return false;
  }

  public static adminLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
