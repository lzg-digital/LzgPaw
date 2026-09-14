import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export interface DashboardStats {
  revenueTotal: number;
  paidOrderCount: number;
  orderCount: number;
  activeProductCount: number;
  customerCount: number;
  funnel: { eventType: string; count: number }[];
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    currency: string;
    payment_status: string;
    fulfillment_status: string;
    created_at: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [paidOrders, allOrders, products, customers, funnelEvents, recentOrders] = await Promise.all([
    supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('analytics_events').select('event_type').gte('created_at', thirtyDaysAgo),
    supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, currency, payment_status, fulfillment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const revenueTotal = (paidOrders.data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const funnelCounts = new Map<string, number>();
  for (const e of funnelEvents.data ?? []) {
    funnelCounts.set(e.event_type, (funnelCounts.get(e.event_type) ?? 0) + 1);
  }

  return {
    revenueTotal,
    paidOrderCount: (paidOrders.data ?? []).length,
    orderCount: allOrders.count ?? 0,
    activeProductCount: products.count ?? 0,
    customerCount: customers.count ?? 0,
    funnel: Array.from(funnelCounts.entries()).map(([eventType, count]) => ({ eventType, count })),
    recentOrders: recentOrders.data ?? [],
  };
}
