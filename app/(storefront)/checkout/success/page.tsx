import Link from 'next/link';
import { getOrderForConfirmation } from '@/lib/data/orders';
import { formatPrice, formatDate } from '@/lib/utils';
import { PurchaseTracker } from '@/components/analytics/PurchaseTracker';

interface SuccessPageProps {
  searchParams: { order?: string };
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const order = searchParams.order ? await getOrderForConfirmation(searchParams.order) : null;

  if (!order) {
    return (
      <div className="container-content py-20 text-center">
        <h1 className="font-serif text-2xl text-ink">We couldn't find that order</h1>
        <p className="mt-2 text-ink/60">If you just completed checkout, this can take a moment — check your email for confirmation.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isPending = order.payment_status === 'pending_payment';

  return (
    <div className="container-content max-w-2xl py-16">
      {isPaid && <PurchaseTracker orderId={order.id} total={order.total_amount} currency={order.currency} />}
      <div className="text-center">
        <h1 className="font-serif text-3xl text-ink">
          {isPaid ? 'Thank you for your order!' : isPending ? 'Order received' : 'Payment not completed'}
        </h1>
        <p className="mt-2 text-ink/70">
          Order <span className="font-medium text-ink">{order.order_number}</span> · {formatDate(order.created_at)}
        </p>
        {isPending && (
          <p className="mt-4 rounded-lg bg-sage/50 px-4 py-3 text-sm text-ink/80">
            We're confirming your payment now — this page will update once it's verified. You'll also receive an email confirmation.
          </p>
        )}
        {order.payment_status === 'failed' && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Your payment didn't go through. No charge was made — you can try again from your cart.
          </p>
        )}
      </div>

      <div className="mt-10 rounded-2xl bg-sage/30 p-6">
        <h2 className="font-serif text-lg text-ink">Order summary</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-ink/80">
                {item.name_snapshot} × {item.quantity}
              </span>
              <span className="font-medium text-ink">{formatPrice(item.line_total, order.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-forest/15 pt-4 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
          {order.discount_amount > 0 && (
            <Row label={`Discount${order.discount_code ? ` (${order.discount_code})` : ''}`} value={`−${formatPrice(order.discount_amount, order.currency)}`} />
          )}
          <Row label="Shipping" value={order.shipping_amount === 0 ? 'Free' : formatPrice(order.shipping_amount, order.currency)} />
          <Row label="Total" value={formatPrice(order.total_amount, order.currency)} emphasis />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="text-sm font-medium text-forest underline underline-offset-2">
          Continue shopping
        </Link>
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
