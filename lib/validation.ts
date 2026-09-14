import { z } from 'zod';

// ----------------------------------------------------------------------------
// Checkout
// ----------------------------------------------------------------------------
export const addressSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(30).optional(),
  country: z.string().trim().min(2).max(60),
  country_code: z.string().trim().length(2).toUpperCase(),
  address_line1: z.string().trim().min(3).max(200),
  address_line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(120),
  state_region: z.string().trim().max(120).optional(),
  postal_code: z.string().trim().max(20).optional(),
});

export const checkoutLineSchema = z.object({
  kind: z.enum(['product', 'bundle']),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  bundleId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutRequestSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email(),
  customer_phone: z.string().trim().min(5).max(30),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  same_as_shipping: z.boolean().default(true),
  discount_code: z.string().trim().max(40).optional(),
  lines: z.array(checkoutLineSchema).min(1).max(50),
  customer_notes: z.string().trim().max(500).optional(),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

// ----------------------------------------------------------------------------
// Reviews (public submission — always lands as "pending", never verified)
// ----------------------------------------------------------------------------
export const reviewSubmissionSchema = z.object({
  product_id: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(80),
  customer_email: z.string().trim().email().optional(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().min(10).max(2000),
  photo_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
});

// ----------------------------------------------------------------------------
// Admin — product create/update
// ----------------------------------------------------------------------------
export const faqItemSchema = z.object({
  question: z.string().trim().min(1).max(200),
  answer: z.string().trim().min(1).max(2000),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only'),
  short_description: z.string().trim().max(300).optional(),
  description: z.string().trim().max(10000).optional(),
  how_to_use: z.string().trim().max(5000).optional(),
  benefits: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  faq: z.array(faqItemSchema).max(30).default([]),
  category_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  badge: z.string().trim().max(40).nullable().optional(),
  sku: z.string().trim().max(60).nullable().optional(),
  stock_status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'backorder']).default('in_stock'),
  stock_quantity: z.number().int().min(0).default(0),
  video_url: z.string().url().nullable().optional(),
  currency: z.string().trim().length(3).default('USD'),

  price: z.number().min(0),
  compare_at_price: z.number().min(0).nullable().optional(),
  product_cost: z.number().min(0).default(0),
  shipping_cost: z.number().min(0).default(0),
  other_cost: z.number().min(0).default(0),

  seo_title: z.string().trim().max(70).nullable().optional(),
  seo_description: z.string().trim().max(160).nullable().optional(),

  supplier_name: z.string().trim().max(150).nullable().optional(),
  supplier_notes: z.string().trim().max(2000).nullable().optional(),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const productImageInputSchema = z.object({
  url: z.string().url(),
  alt_text: z.string().trim().max(200).default(''),
  type: z.enum(['main', 'detail', 'lifestyle', 'before', 'after', 'usage']).default('detail'),
  position: z.number().int().min(0).default(0),
});

export const productVariantInputSchema = z.object({
  option_name: z.string().trim().min(1).max(60),
  option_value: z.string().trim().min(1).max(60),
  sku: z.string().trim().max(60).nullable().optional(),
  price_override: z.number().min(0).nullable().optional(),
  stock_quantity: z.number().int().min(0).default(0),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

/** Full admin product save payload — core fields plus the media/variant
 * rows that get synced alongside it (see app/api/admin/products/[id]/route.ts). */
export const productSavePayloadSchema = z.object({
  product: productInputSchema,
  images: z.array(productImageInputSchema).max(20).default([]),
  variants: z.array(productVariantInputSchema).max(30).default([]),
});

export const bundleInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional(),
  badge: z.string().trim().max(40).nullable().optional(),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).nullable().optional(),
  active: z.boolean().default(true),
  position: z.number().int().default(0),
  items: z
    .array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1),
});

// ----------------------------------------------------------------------------
// Admin — review moderation
// ----------------------------------------------------------------------------
export const reviewModerationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'hidden']),
});

// ----------------------------------------------------------------------------
// Admin — order updates (fulfillment only — payment_status is server-derived)
// ----------------------------------------------------------------------------
export const orderFulfillmentUpdateSchema = z.object({
  fulfillment_status: z.enum(['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled']),
  tracking_number: z.string().trim().max(100).nullable().optional(),
  tracking_carrier: z.string().trim().max(60).nullable().optional(),
});

// ----------------------------------------------------------------------------
// Admin — site settings (announcement bar, trust strip, shipping defaults)
// ----------------------------------------------------------------------------
export const siteSettingsInputSchema = z.object({
  announcement_bar_text: z.string().trim().max(200).default(''),
  trust_items: z
    .array(z.object({ icon: z.string().trim().max(30), label: z.string().trim().max(60) }))
    .max(6)
    .default([]),
  free_shipping_threshold: z.number().min(0).nullable().default(null),
  shipping_flat_rate: z.number().min(0).default(0),
  return_window_days: z.number().int().min(0).nullable().default(null),
  support_email: z.string().trim().email().or(z.literal('')).default(''),
  social_links: z
    .array(z.object({ platform: z.string().trim().max(30), url: z.string().url() }))
    .max(10)
    .default([]),
});

// ----------------------------------------------------------------------------
// Admin — discount codes
// ----------------------------------------------------------------------------
export const discountCodeInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, hyphens and underscores only'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  active: z.boolean().default(true),
  usage_limit: z.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

// ----------------------------------------------------------------------------
// File upload validation (admin product images/video)
// ----------------------------------------------------------------------------
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60MB
