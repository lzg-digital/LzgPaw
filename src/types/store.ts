export type ProductCategory = 'All' | 'Dogs' | 'Cats' | 'Care & Grooming' | 'Toys & Accessories';

export interface Product {
  id: string;
  name: string;
  category: 'Dogs' | 'Cats' | 'Care & Grooming' | 'Toys & Accessories';
  price: number;
  compareAtPrice: number;
  description: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  features: string[];
  tags: string[];
  isBundleEligible: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface FreeGift {
  id: string;
  name: string;
  description: string;
  value: number;
  image: string;
}

export interface BundleOffer {
  id: string;
  title: string;
  subtitle: string;
  requiredQuantity: number;
  freeGift: FreeGift;
  active: boolean;
}

export type PaymentMethod = 'DPO_CARD' | 'DPO_MOBILE_MONEY' | 'DPO_BANK_TRANSFER';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
  location?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  freeGifts: FreeGift[];
  subtotal: number;
  compareAtSubtotal: number;
  discount: number;
  shipping: number; // 0 for free delivery
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  dpoReference: string;
  dpoTransactionId: string;
  orderStatus: OrderStatus;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  statusHistory: OrderStatusHistory[];
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  type: 'order' | 'promo' | 'system';
}
