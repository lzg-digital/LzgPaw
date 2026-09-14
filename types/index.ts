// ============================================================================
// Core domain types — kept in sync with database/schema.sql by hand.
// If you introduce a typed Supabase client (`supabase gen types typescript`),
// these can be derived automatically; until then this is the single source
// of truth for shapes used across the app.
// ============================================================================

export type ProductStatus = 'draft' | 'active' | 'archived';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type PaymentStatus = 'pending_payment' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type MediaType = 'main' | 'detail' | 'lifestyle' | 'before' | 'after' | 'usage';
export type DiscountType = 'percentage' | 'fixed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  type: MediaType;
  position: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  option_name: string;
  option_value: string;
  sku: string | null;
  price_override: number | null;
  stock_quantity: number;
  position: number;
  active: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Product row as read on the storefront (public-safe fields only). */
export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  how_to_use: string | null;
  benefits: string[];
  faq: FaqItem[];
  category_id: string | null;
  tags: string[];
  status: ProductStatus;
  badge: string | null;
  sku: string | null;
  stock_status: StockStatus;
  stock_quantity: number;
  video_url: string | null;
  currency: string;
  price: number;
  compare_at_price: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;

  // Joined / derived at read time — never hand-entered
  images?: ProductImage[];
  variants?: ProductVariant[];
  rating_average?: number | null;
  rating_count?: number;
  category?: Category | null;
}

/** Admin-only view of a product — includes cost/profit fields. Never sent
 * to unauthenticated storefront requests. `seo_title`/`seo_description`
 * live on the base `Product` type, not here — they're public-facing
 * (they drive the storefront <title>/meta description), unlike everything
 * else in this interface. */
export interface AdminProduct extends Product {
  product_cost: number;
  shipping_cost: number;
  other_cost: number;
  total_cost: number;
  estimated_profit: number;
  profit_margin_pct: number | null;
  supplier_name: string | null;
  supplier_notes: string | null;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  badge: string | null;
  price: number;
  compare_at_price: number | null;
  active: boolean;
  position: number;
  items?: BundleItem[];
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  photo_url: string | null;
  video_url: string | null;
  verified_purchase: boolean;
  status: ReviewStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface Address {
  full_name: string;
  phone?: string;
  country: string;
  country_code: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_region?: string;
  postal_code?: string;
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  bundle_id: string | null;
  name_snapshot: string;
  sku_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Address;
  billing_address: Address | null;
  currency: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  discount_code: string | null;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  payment_provider: string;
  payment_reference: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  created_at: string;
  items?: OrderItem[];
}

/** A line the customer put in their cart, before checkout. Cart state lives
 * client-side only (see lib/cart-context.tsx) — nothing is persisted server
 * side until an order is actually created. */
export interface CartLine {
  key: string; // productId + variantId (or bundleId), used for de-duplication
  kind: 'product' | 'bundle';
  productId?: string;
  variantId?: string;
  bundleId?: string;
  name: string;
  variantLabel?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  slug?: string;
}

export interface SiteSettings {
  announcement_bar_text: string;
  trust_items: { icon: string; label: string }[];
  free_shipping_threshold: number | null;
  shipping_flat_rate: number;
  return_window_days: number | null;
  support_email: string;
  social_links: { platform: string; url: string }[];
}
