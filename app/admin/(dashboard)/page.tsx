import Link from 'next/link';
import { getDashboardStats } from '@/lib/data/admin-stats';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  // Simple, honest funnel conversion — no fabricated percentages if there's
  // no traffic data yet.
  const pageViews = stats.funnel.find((f) => f.eventType === 'page_view')?.count ?? 0;
  const purchases = stats.funnel.find((f) => f.eventType === 'purchase')?.count ?? 0;
  const conversionRate = pageViews > 0 ? ((purchases / pageViews) * 100).toFixed(1) : null;

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Revenue (paid orders)" value={formatPrice(stats.revenueTotal)} />
        <StatCard label="Paid Orders" value={String(stats.paidOrderCount)} />
        <StatCard label="Total Orders" value={String(stats.orderCount)} />
        <StatCard label="Active Products" value={String(stats.activeProductCount)} />
        <StatCard label="Customers" value={String(stats.customerCount)} />
      </div>

      <div className="mt-6 rounded-2xl bg-white/60 p-6">
        <h2 className="font-serif text-lg text-ink">Conversion (last 30 days)</h2>
        {pageViews === 0 ? (
          <p className="mt-2 text-sm text-ink/60">
            No analytics data yet — this fills in once visitors accept analytics cookies and the store starts getting traffic.
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink/70">
            {purchases} purchase{purchases === 1 ? '' : 's'} from {pageViews} page view{pageViews === 1 ? '' : 's'}
            {conversionRate && <> — {conversionRate}% conversion</>}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-forest underline underline-offset-2">
            View all
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-ink/60">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-ink/50">
                <tr>
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Payment</th>
                  <th className="pb-2 font-medium">Fulfillment</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-forest">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-2">{order.customer_name}</td>
                    <td className="py-2">{formatPrice(order.total_amount, order.currency)}</td>
                    <td className="py-2 capitalize">{order.payment_status.replace('_', ' ')}</td>
                    <td className="py-2 capitalize">{order.fulfillment_status}</td>
                    <td className="py-2 text-ink/60">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/60 p-5">
      <p className="text-xs font-medium text-ink/50">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
    </div>
  );
}
