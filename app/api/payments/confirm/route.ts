import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentProvider } from '@/services/payments';
import { isRateLimited, recordHit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT_BUCKET = 'payment-confirm';
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MINUTES = 10;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (await isRateLimited(RATE_LIMIT_BUCKET, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES)) {
    return NextResponse.json({ error: 'Too many verification attempts.' }, { status: 429 });
  }
  await recordHit(RATE_LIMIT_BUCKET, ip);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const orderId = typeof (body as any)?.orderId === 'string' ? (body as any).orderId : '';
  const transactionToken = typeof (body as any)?.transactionToken === 'string' ? (body as any).transactionToken : '';

  if (!UUID_PATTERN.test(orderId)) {
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, currency, payment_status, payment_provider, payment_reference, discount_code')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.payment_provider !== 'dpo_pay') return NextResponse.json({ error: 'Unsupported payment provider.' }, { status: 400 });

  if (order.payment_status === 'paid') {
    return NextResponse.json({ status: 'paid' });
  }

  // Prefer the reference saved by our server at createToken time. The token
  // from the browser is only used if DPO gave us one on the return URL.
  const providerReference = order.payment_reference || transactionToken || null;
  const provider = getPaymentProvider();
  const result = await provider.confirmPayment({
    providerReference,
    orderNumber: order.order_number,
    amount: Number(order.total_amount),
    currency: order.currency,
  });

  if (!result.valid) {
    return NextResponse.json({ status: result.status, message: result.message }, { status: 200 });
  }

  const nextStatus =
    result.status === 'paid' ? 'paid' :
    result.status === 'failed' ? 'failed' :
    result.status === 'cancelled' ? 'cancelled' :
    null;

  if (nextStatus) {
    const { data: transitioned } = await supabase
      .from('orders')
      .update({
        payment_status: nextStatus,
        ...(result.providerReference ? { payment_reference: result.providerReference } : {}),
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
      .select('id')
      .maybeSingle();

    if (transitioned && nextStatus === 'paid' && order.discount_code) {
      const { error } = await supabase.rpc('increment_discount_usage', {
        p_code: order.discount_code,
      });
      if (error) console.error('[payment-confirm] discount usage update failed', error.message);
    }
  }

  return NextResponse.json({ status: nextStatus ?? result.status });
}
