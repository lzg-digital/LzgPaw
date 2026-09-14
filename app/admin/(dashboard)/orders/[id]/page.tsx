import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderFulfillmentForm } from '@/components/admin/OrderFulfillmentForm';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select(
      `id, order_number, customer_name, customer_email, customer_phone, shipping_address, billing_address,
       currency, subtotal, shipping_amount, discount_amount, discount_code, tax_amount, total_amount,
       payment_status, fulfillment_status, payment_provider, payment_reference, tracking_number, tracking_carrier,
       internal_notes, created_at,
       items:order_items(id, name_snapshot, sku_snapshot, unit_price, quantity, line_total)`
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!order) notFound();

  const address = order.shipping_address as any;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-serif text-3xl text-ink">{order.order_number}</h1>
        <p className="mt-1 text-sm text-ink/60">{formatDate(order.created_at)}</p>

        <div className="mt-6 rounded-2xl bg-white/60 p-5">
          <h2 className="font-serif text-lg text-ink">Items</h2>
          <table className="mt-3 w-full text-left text-sm">
            <tbody className="divide-y divide-forest-100">
              {(order.items ?? []).map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2">{item.name_snapshot}</td>
                  <td className="py-2 text-ink/60">× {item.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(item.line_total, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col gap-1 border-t border-forest/15 pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
            {order.discount_amount > 0 && <Row label={`Discount (${order.discount_code ?? ''})`} value={`−${formatPrice(order.discount_amount, order.currency)}`} />}
            <Row label="Shipping" value={formatPrice(order.shipping_amount, order.currency)} />
            <Row label="Tax" value={formatPrice(order.tax_amount, order.currency)} />
            <Row label="Total" value={formatPrice(order.total_amount, order.currency)} emphasis />
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/60 p-5">
          <h2 className="font-serif text-lg text-ink">Customer</h2>
          <p className="mt-2 text-sm text-ink/80">{order.customer_name}</p>
          <p className="text-sm text-ink/60">{order.customer_email}</p>
          <p className="text-sm text-ink/60">{order.customer_phone}</p>
          <div className="mt-3 text-sm text-ink/70">
            <p>{address?.address_line1}</p>
            {address?.address_line2 && <p>{address.address_line2}</p>}
            <p>
              {address?.city}
              {address?.state_region ? `, ${address.state_region}` : ''} {address?.postal_code}
            </p>
            <p>{address?.country}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl bg-white/60 p-5">
          <h2 className="font-serif text-lg text-ink">Payment</h2>
          <p className="mt-2 text-sm capitalize text-ink/80">{order.payment_status.replace('_', ' ')}</p>
          <p className="mt-1 text-xs text-ink/50">
            Provider: {order.payment_provider} {order.payment_reference && `· ${order.payment_reference}`}
          </p>
          <p className="mt-2 text-xs text-ink/40">
            Payment status is confirmed only by the payment webhook — it cannot be edited manually here.
          </p>
        </div>

        <OrderFulfillmentForm
          orderId={order.id}
          fulfillmentStatus={order.fulfillment_status}
          trackingNumber={order.tracking_number}
          trackingCarrier={order.tracking_carrier}
        />
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
