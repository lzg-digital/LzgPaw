import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentProvider } from '@/services/payments';

async function processCallback(request: NextRequest) {
  const params = request.method === 'GET'
    ? request.nextUrl.searchParams
    : new URLSearchParams(await request.text());

  const raw = params.toString();
  if (!raw || (!params.get('TransactionToken') && !params.get('TransToken') && !params.get('CompanyRef'))) {
    return NextResponse.json({ error: 'Missing payment callback data' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const verification = await getPaymentProvider().verifyWebhook(raw, request.headers);

  if (!verification.valid || !verification.orderReference || !verification.providerEventId) {
    return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
  }

  const reference = verification.orderReference;
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  let order = (await supabase.from('orders').select('id, order_number, total_amount, currency, payment_status, discount_code').eq('order_number', reference).maybeSingle()).data;
  if (!order && UUID_PATTERN.test(reference)) {
    order = (await supabase.from('orders').select('id, order_number, total_amount, currency, payment_status, discount_code').eq('id', reference).maybeSingle()).data;
  }
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const amountMatches = verification.amount != null && Math.abs(verification.amount - Number(order.total_amount)) < 0.01;
  const currencyMatches = verification.currency != null && verification.currency.toUpperCase() === order.currency.toUpperCase();

  const { error: eventError } = await supabase.from('payment_events').insert({
    order_id: order.id,
    provider: 'dpo',
    provider_event_id: verification.providerEventId,
    event_type: verification.eventType,
    amount: verification.amount,
    currency: verification.currency,
    signature_valid: verification.valid,
    raw_payload: Object.fromEntries(params.entries()),
    processed_at: amountMatches && currencyMatches ? new Date().toISOString() : null,
  });

  if (eventError) {
    if (eventError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[webhook:dpo] event insert failed', eventError.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  if (!amountMatches || !currencyMatches) {
    console.error('[webhook:dpo] payment mismatch', { order: order.order_number, amount: verification.amount, currency: verification.currency });
    return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
  }

  if (order.payment_status === 'paid') return NextResponse.json({ received: true });

  const nextStatus = verification.status === 'paid' ? 'paid' : verification.status === 'failed' ? 'failed' : verification.status === 'cancelled' ? 'cancelled' : null;
  if (nextStatus) {
    await supabase.from('orders').update({ payment_status: nextStatus, payment_reference: verification.providerEventId }).eq('id', order.id);
    if (nextStatus === 'paid' && order.discount_code) {
      const { error } = await supabase.rpc('increment_discount_usage', { p_code: order.discount_code });
      if (error) console.error('[webhook:dpo] discount usage failed', error.message);
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET(request: NextRequest) {
  return processCallback(request);
}

export async function POST(request: NextRequest) {
  return processCallback(request);
}
