import { NextRequest, NextResponse } from 'next/server';
import { checkoutRequestSchema } from '@/lib/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteSettings } from '@/lib/data/settings';
import { getPaymentProvider, PaymentConfigurationError } from '@/services/payments';
import { isRateLimited, recordHit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT_BUCKET = 'checkout';
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MINUTES = 10;

interface ResolvedLine {
  product_id: string | null;
  variant_id: string | null;
  bundle_id: string | null;
  name_snapshot: string;
  sku_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export async function POST(request: NextRequest) {
  // Generous on purpose — real customers legitimately retry a failed
  // checkout a few times. This is here to blunt automated order-flooding
  // (each attempt writes an order + order_items row), not to police normal
  // shopping behavior.
  const ip = getClientIp(request);
  if (await isRateLimited(RATE_LIMIT_BUCKET, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES)) {
    return NextResponse.json({ error: 'Too many checkout attempts. Please wait a few minutes and try again.' }, { status: 429 });
  }
  await recordHit(RATE_LIMIT_BUCKET, ip);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 });
  }
  const input = parsed.data;
  const supabase = createAdminClient();

  // ---------------------------------------------------------------------
  // 1. Resolve every line against the DATABASE. The client's cart only ever
  //    supplies product/variant/bundle ids and quantities — never a price.
  //    This is the single most important security property of checkout:
  //    nothing the browser says about cost is trusted.
  // ---------------------------------------------------------------------
  const resolvedLines: ResolvedLine[] = [];

  for (const line of input.lines) {
    if (line.kind === 'product') {
      if (!line.productId) {
        return NextResponse.json({ error: 'Invalid cart line.' }, { status: 400 });
      }
      const { data: product } = await supabase
        .from('products')
        .select('id, name, sku, price, status, stock_status, stock_quantity')
        .eq('id', line.productId)
        .maybeSingle();

      if (!product || product.status !== 'active') {
        return NextResponse.json({ error: 'One of the items in your cart is no longer available.' }, { status: 409 });
      }
      if (product.stock_status === 'out_of_stock') {
        return NextResponse.json({ error: `${product.name} is out of stock.` }, { status: 409 });
      }

      let unitPrice = product.price;
      let skuSnapshot: string | null = product.sku;

      if (line.variantId) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, sku, price_override, stock_quantity, active, option_name, option_value')
          .eq('id', line.variantId)
          .eq('product_id', line.productId)
          .maybeSingle();

        if (!variant || !variant.active || variant.stock_quantity < line.quantity) {
          return NextResponse.json({ error: `The selected option for ${product.name} is unavailable.` }, { status: 409 });
        }
        unitPrice = variant.price_override ?? product.price;
        skuSnapshot = variant.sku ?? skuSnapshot;
      }

      resolvedLines.push({
        product_id: product.id,
        variant_id: line.variantId ?? null,
        bundle_id: null,
        name_snapshot: product.name,
        sku_snapshot: skuSnapshot,
        unit_price: unitPrice,
        quantity: line.quantity,
        line_total: Number((unitPrice * line.quantity).toFixed(2)),
      });
    } else {
      if (!line.bundleId) {
        return NextResponse.json({ error: 'Invalid cart line.' }, { status: 400 });
      }
      const { data: bundle } = await supabase
        .from('bundles')
        .select('id, name, price, active')
        .eq('id', line.bundleId)
        .maybeSingle();

      if (!bundle || !bundle.active) {
        return NextResponse.json({ error: 'One of the bundles in your cart is no longer available.' }, { status: 409 });
      }

      resolvedLines.push({
        product_id: null,
        variant_id: null,
        bundle_id: bundle.id,
        name_snapshot: bundle.name,
        sku_snapshot: null,
        unit_price: bundle.price,
        quantity: line.quantity,
        line_total: Number((bundle.price * line.quantity).toFixed(2)),
      });
    }
  }

  const subtotal = Number(resolvedLines.reduce((sum, l) => sum + l.line_total, 0).toFixed(2));

  // ---------------------------------------------------------------------
  // 2. Discount code (optional) — validated server-side, never trust a
  //    discount amount from the client.
  // ---------------------------------------------------------------------
  let discountAmount = 0;
  if (input.discount_code) {
    const { data: code } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', input.discount_code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    const now = new Date();
    const isExpired = code?.expires_at ? new Date(code.expires_at) < now : false;
    const isExhausted = code?.usage_limit ? code.usage_count >= code.usage_limit : false;

    if (code && !isExpired && !isExhausted) {
      discountAmount =
        code.type === 'percentage' ? Number(((subtotal * code.value) / 100).toFixed(2)) : Number(code.value.toFixed(2));
      discountAmount = Math.min(discountAmount, subtotal);
    }
  }

  // ---------------------------------------------------------------------
  // 3. Shipping + tax. Tax is intentionally 0 — see docs/COMPLIANCE.md
  //    §4, wiring a real tax calculation needs a business/legal decision
  //    first, not a guess baked into checkout code.
  // ---------------------------------------------------------------------
  const settings = await getSiteSettings();
  const shippingAmount =
    settings.free_shipping_threshold != null && subtotal - discountAmount >= settings.free_shipping_threshold
      ? 0
      : settings.shipping_flat_rate;
  const taxAmount = 0;

  const totalAmount = Number(Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount).toFixed(2));
  const currency = 'USD';

  // ---------------------------------------------------------------------
  // 4. Find-or-create the customer, then create the order + order_items in
  //    `pending_payment`. Nothing is marked paid here — see
  //    app/api/webhooks/dpo/route.ts for the only code path allowed to
  //    do that.
  // ---------------------------------------------------------------------
  const normalizedEmail = input.customer_email.toLowerCase();
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  let customerId: string | null = existingCustomer?.id ?? null;

  if (!customerId) {
    const { data: insertedCustomer, error: customerInsertError } = await supabase
      .from('customers')
      .insert({
        email: normalizedEmail,
        first_name: input.customer_name.split(' ')[0],
        last_name: input.customer_name.split(' ').slice(1).join(' ') || null,
        phone: input.customer_phone,
      })
      .select('id')
      .single();

    if (customerInsertError) {
      // Unique-violation on `customers.email` means a concurrent checkout
      // for the same address just created it a moment ago — re-fetch rather
      // than leave this order unlinked to any customer record.
      if (customerInsertError.code === '23505') {
        const { data: raceWinner } = await supabase
          .from('customers')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();
        customerId = raceWinner?.id ?? null;
      } else {
        console.error('[checkout] customer insert failed', customerInsertError.message);
      }
    } else {
      customerId = insertedCustomer?.id ?? null;
    }
  }

  const shippingAddress = input.shipping_address;
  const billingAddress = input.same_as_shipping ? input.shipping_address : input.billing_address ?? input.shipping_address;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      customer_name: input.customer_name,
      customer_email: normalizedEmail,
      customer_phone: input.customer_phone,
      customer_country_code: shippingAddress.country_code,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      currency,
      subtotal,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      discount_code: discountAmount > 0 ? input.discount_code?.toUpperCase() : null,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_status: 'pending_payment',
      fulfillment_status: 'unfulfilled',
      payment_provider: 'dpo',
      customer_notes: input.customer_notes,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    console.error('[checkout] order insert failed', orderError?.message);
    return NextResponse.json({ error: 'Could not create your order. Please try again.' }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    resolvedLines.map((line) => ({ ...line, order_id: order.id }))
  );

  if (itemsError) {
    console.error('[checkout] order_items insert failed', itemsError.message);
    return NextResponse.json({ error: 'Could not create your order. Please try again.' }, { status: 500 });
  }

  // ---------------------------------------------------------------------
  // 5. Hand off to the payment provider. See services/payments/DPOProvider.ts
  //    for exactly what is and isn't confirmed against DPO Pay's real API yet.
  //
  //    SECURITY: this must be a fixed, server-configured origin — never
  //    derived from the incoming request (e.g. `request.nextUrl.origin` /
  //    the Host header), which a client can set to an arbitrary value.
  //    Trusting it here would let someone inject an attacker-controlled
  //    domain into both the customer's post-payment redirect and the
  //    webhook callback URL sent to DPO Pay.
  // ---------------------------------------------------------------------
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error('[checkout] NEXT_PUBLIC_SITE_URL is not configured');
    return NextResponse.json({ error: 'This store is not fully configured yet. Please contact support.' }, { status: 503 });
  }

  try {
    const provider = getPaymentProvider();
    const payment = await provider.createPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: totalAmount,
      currency,
      customerName: input.customer_name,
      customerEmail: input.customer_email,
      customerPhone: input.customer_phone,
      // Uses the (unguessable) UUID, not the human-readable order_number,
      // since this becomes a bearer link to view the confirmation page —
      // see app/(storefront)/checkout/success/page.tsx.
      returnUrl: `${siteUrl}/checkout/success?order=${order.id}`,
    });

    await supabase.from('orders').update({ payment_reference: payment.providerReference }).eq('id', order.id);

    return NextResponse.json({ redirectUrl: payment.redirectUrl, orderNumber: order.order_number });
  } catch (err) {
    if (err instanceof PaymentConfigurationError) {
      console.error('[checkout] payment provider not configured:', err.message);
      return NextResponse.json(
        { error: 'Online payment is not yet configured for this store. Please contact support to complete your order.' },
        { status: 503 }
      );
    }
    console.error('[checkout] payment creation failed', err);
    return NextResponse.json(
      { error: 'We could not start payment for your order. It has been saved — please contact support.', orderNumber: order.order_number },
      { status: 502 }
    );
  }
}
