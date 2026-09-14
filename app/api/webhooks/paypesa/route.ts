import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentProvider } from '@/services/payments';

/**
 * Security properties this route guarantees (see also section 20 of the
 * build brief):
 *   - The request must carry a valid signature (checked against the RAW
 *     body — see services/payments/PayPesaProvider.ts) or it's rejected
 *     before anything else happens.
 *   - The event id is unique-constrained in `payment_events`
 *     (provider, provider_event_id) — a retried/duplicate webhook delivery
 *     can never apply twice.
 *   - The amount and currency in the webhook are cross-checked against
 *     what WE recorded on the order at checkout time. A webhook claiming a
 *     different amount than the order's total is rejected, not "corrected".
 *   - The browser is never involved in any of this — nothing the frontend
 *     says about payment status is trusted anywhere in this codebase.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const provider = getPaymentProvider();
  const supabase = createAdminClient();

  const verification = await provider.verifyWebhook(rawBody, request.headers);

  if (!verification.valid) {
    console.warn('[webhook:paypesa] rejected — invalid or unverifiable signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!verification.orderReference) {
    return NextResponse.json({ error: 'Missing order reference' }, { status: 400 });
  }

  // SECURITY: look this up with parameterized .eq() calls, never by
  // interpolating the webhook-supplied reference into a raw filter string
  // (e.g. via .or(`order_number.eq.${ref},id.eq.${ref}`)) — PostgREST's
  // filter grammar treats characters like `,`, `.`, and `()` as syntax, so
  // an unescaped value can alter which rows the filter actually matches.
  // `verification.orderReference` is signature-verified as coming from
  // PayPesa, but there's no reason to rely on that alone here.
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const reference = verification.orderReference;

  let order: { id: string; order_number: string; total_amount: number; currency: string; payment_status: string; discount_code: string | null } | null = null;

  const byOrderNumber = await supabase
    .from('orders')
    .select('id, order_number, total_amount, currency, payment_status, discount_code')
    .eq('order_number', reference)
    .maybeSingle();
  order = byOrderNumber.data ?? null;

  if (!order && UUID_PATTERN.test(reference)) {
    const byId = await supabase
      .from('orders')
      .select('id, order_number, total_amount, currency, payment_status, discount_code')
      .eq('id', reference)
      .maybeSingle();
    order = byId.data ?? null;
  }

  if (!order) {
    console.warn('[webhook:paypesa] order not found for reference', reference);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Amount/currency cross-check — a mismatch is treated as suspicious, not
  // as "trust the webhook over our own records".
  const amountMatches =
    verification.amount == null || Math.abs(verification.amount - Number(order.total_amount)) < 0.01;
  const currencyMatches = verification.currency == null || verification.currency === order.currency;

  // Idempotency: this insert is the only thing standing between "processed
  // once" and "processed every time PayPesa retries the webhook". The
  // unique constraint on (provider, provider_event_id) does the real work;
  // a unique-violation here means we've already handled this exact event.
  const { error: insertError } = await supabase.from('payment_events').insert({
    order_id: order.id,
    provider: 'paypesa',
    provider_event_id: verification.providerEventId,
    event_type: verification.eventType,
    amount: verification.amount,
    currency: verification.currency,
    signature_valid: verification.valid,
    raw_payload: safeParse(rawBody),
    processed_at: amountMatches && currencyMatches ? new Date().toISOString() : null,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      // Unique violation on (provider, provider_event_id) — duplicate
      // delivery. Acknowledge with 200 so the provider stops retrying;
      // do NOT reprocess the order update.
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[webhook:paypesa] failed to record payment event', insertError.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  if (!amountMatches || !currencyMatches) {
    console.error('[webhook:paypesa] amount/currency mismatch for order', order.order_number, verification);
    return NextResponse.json({ error: 'Amount/currency mismatch' }, { status: 400 });
  }

  // Never downgrade a terminal state (paid) based on a later/out-of-order
  // webhook delivery.
  if (order.payment_status === 'paid') {
    return NextResponse.json({ received: true });
  }

  const nextStatus =
    verification.status === 'paid'
      ? 'paid'
      : verification.status === 'failed'
        ? 'failed'
        : verification.status === 'cancelled'
          ? 'cancelled'
          : null;

  if (nextStatus) {
    await supabase.from('orders').update({ payment_status: nextStatus }).eq('id', order.id);

    // Redemption is counted on confirmed payment, not at checkout time —
    // otherwise someone could exhaust a limited code just by starting (and
    // abandoning) many unpaid checkouts. The increment happens in a single
    // atomic UPDATE (see database/schema.sql `increment_discount_usage`)
    // rather than a read-then-write from here, so concurrent redemptions of
    // the same code can't undercount each other.
    if (nextStatus === 'paid' && order.discount_code) {
      const { error: usageError } = await supabase.rpc('increment_discount_usage', {
        p_code: order.discount_code,
      });
      if (usageError) {
        console.error('[webhook:paypesa] failed to record discount usage', usageError.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}
