import Link from 'next/link';
import { getOrderForConfirmation } from '@/lib/data/orders';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentProvider } from '@/services/payments';
import { formatPrice, formatDate } from '@/lib/utils';
import { PurchaseTracker } from '@/components/analytics/PurchaseTracker';

interface SuccessPageProps {
  searchParams: {
    order?: string;
    TransactionToken?: string;
    transactionToken?: string;
    CompanyRef?: string;
    TransID?: string;
  };
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderId = searchParams.order;
  let order = orderId ? await getOrderForConfirmation(orderId) : null;

  // DPO redirects back with TransactionToken. We verify directly with DPO
  // on the server before showing "paid". The browser never gets to declare
  // that an order is paid.
  if (order && order.payment_status !== 'paid' && order.payment_provider === 'dpo_pay') {
    try {
      const provider = getPaymentProvider();
      const verification = await provider.confirmPayment({
        providerReference: order.payment_reference || searchParams.TransactionToken || searchParams.transactionToken || null,
        orderNumber: order.order_number,
        amount: Number(order.total_amount),
        currency: order.currency,
      });

      if (verification.status === 'paid' && verification.valid) {
        const supabase = createAdminClient();
        const { data: paidOrder } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            ...(verification.providerReference ? { payment_reference: verification.providerReference } : {}),
          })
          .eq('id', order.id)
          .neq('payment_status', 'paid')
          .select('id')
          .maybeSingle();

        // Only the request that actually transitions pending -> paid gets to
        // consume the discount. This prevents refresh/race double-counting.
        if (paidOrder && order.discount_code) {
          await supabase.rpc('increment_discount_usage', { p_code: order.discount_code });
        }

        order = await getOrderForConfirmation(order.id);
      } else if (verification.status === 'failed' || verification.status === 'cancelled') {
        const supabase = createAdminClient();
        await supabase
          .from('orders')
          .update({ payment_status: verification.status })
          .eq('id', order.id)
          .neq('payment_status', 'paid');

        order = await getOrderForConfirmation(order.id);
      }
    } catch (error) {
      console.error('[checkout/success] DPO verification failed', error);
      // Leave the order pending rather than guessing. The customer can retry
      // or support can verify it from the DPO Merchant Portal.
    }
  }

  if (!order) {
    return (
      <div className="container-content max-w-xl py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest">?</div>
        <h1 className="mt-5 font-serif text-3xl text-ink">We couldn't find that order</h1>
        <p className="mt-2 text-ink/60">If you just completed checkout, check your email or contact support.</p>
        <Link href="/shop" className="mt-7 inline-block rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isPending = order.payment_status === 'pending_payment';

  return (
    <div className="container-content max-w-2xl py-12 sm:py-16">
      {isPaid && <PurchaseTracker orderId={order.id} total={order.total_amount} currency={order.currency} />}
      <div className="rounded-3xl border border-forest/10 bg-white p-7 text-center shadow-card sm:p-10">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isPaid ? 'bg-sage text-forest' : 'bg-cream text-forest'}`}>
          {isPaid ? '✓' : '•'}
        </div>
        <h1 className="mt-5 font-serif text-3xl text-ink">
          {isPaid ? 'Thank you for your order!' : isPending ? 'We are confirming your payment' : 'Payment not completed'}
        </h1>
        <p className="mt-2 text-ink/70">
          Order <span className="font-semibold text-ink">{order.order_number}</span> · {formatDate(order.created_at)}
        </p>
        {isPending && (
          <p className="mx-auto mt-5 max-w-lg rounded-xl bg-sage/40 px-4 py-3 text-sm text-ink/80">
            Your payment has not been confirmed yet. Please don't pay again until the status is confirmed.
          </p>
        )}
        {order.payment_status === 'failed' && (
          <p className="mx-auto mt-5 max-w-lg rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Your payment was not completed. No order fulfillment will begin until DPO confirms payment.
          </p>
        )}
      </div>

      <div className="mt-7 rounded-3xl border border-forest/10 bg-white p-6 shadow-card sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl text-ink">Order summary</h2>
          <span className="rounded-full bg-sage/60 px-3 py-1 text-xs font-semibold text-forest">Secure checkout</span>
        </div>
        <ul className="mt-5 flex flex-col gap-3">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-ink/80">{item.name_snapshot} × {item.quantity}</span>
              <span className="font-medium text-ink">{formatPrice(item.line_total, order.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-1 border-t border-forest/10 pt-5 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
          {order.discount_amount > 0 && (
            <Row label={`Discount${order.discount_code ? ` (${order.discount_code})` : ''}`} value={`−${formatPrice(order.discount_amount, order.currency)}`} />
          )}
          <Row label="Shipping" value={order.shipping_amount === 0 ? 'Free' : formatPrice(order.shipping_amount, order.currency)} />
          <Row label="Total" value={formatPrice(order.total_amount, order.currency)} emphasis />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-ink/55">
        <p>Payment details are handled by DPO Pay's secure hosted checkout. Card details are never stored on LzgPaw.</p>
        <Link href="/shop" className="font-semibold text-forest underline underline-offset-2">Continue shopping</Link>
      </div>
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`flex justify-between ${emphasis ? 'font-semibold text-ink' : 'text-ink/70'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
