import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils';

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, status, price, stock_status, stock_quantity, profit_margin_pct, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white">
          Add Product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="text-ink/60">No products yet — add your first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/60">
          <table className="w-full text-left text-sm">
            <thead className="text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Margin</th>
                <th className="px-4 py-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-forest">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.profit_margin_pct != null ? `${p.profit_margin_pct}%` : '—'}</td>
                  <td className="px-4 py-3 capitalize">
                    {p.stock_status.replace('_', ' ')} ({p.stock_quantity})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
