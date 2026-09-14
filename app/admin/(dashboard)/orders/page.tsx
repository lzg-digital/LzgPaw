import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total_amount, currency, payment_status, fulfillment_status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-ink/60">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/60">
          <table className="w-full text-left text-sm">
            <thead className="text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-forest">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-ink/50">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.total_amount, o.currency)}</td>
                  <td className="px-4 py-3 capitalize">{o.payment_status.replace('_', ' ')}</td>
                  <td className="px-4 py-3 capitalize">{o.fulfillment_status}</td>
                  <td className="px-4 py-3 text-ink/60">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
