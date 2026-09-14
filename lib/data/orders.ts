import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Order } from '@/types';

/**
 * Orders have no anon-readable RLS policy at all (see database/schema.sql),
 * so this — a narrow, single-purpose lookup by the order's unguessable
 * UUID, used only to render the "thank you" confirmation page — is one of
 * the few storefront-facing places the service-role client is used
 * directly. It never accepts the human-readable, sequential order_number
 * as a lookup key for exactly that reason (see app/api/checkout/route.ts).
 */
export async function getOrderForConfirmation(id: string): Promise<Order | null> {
  // Reject anything that isn't a UUID before it ever reaches the database.
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, order_number, customer_name, customer_email, customer_phone, shipping_address, billing_address,
       currency, subtotal, shipping_amount, discount_amount, discount_code, tax_amount, total_amount,
       payment_status, fulfillment_status, payment_provider, payment_reference, tracking_number, tracking_carrier,
       created_at, items:order_items(id, product_id, variant_id, bundle_id, name_snapshot, sku_snapshot, unit_price, quantity, line_total)`
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as Order;
}
