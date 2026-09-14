import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils';

export default async function AdminBundlesPage() {
  const supabase = createAdminClient();
  const { data: bundles } = await supabase
    .from('bundles')
    .select('id, name, badge, price, active, position')
    .order('position');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Bundles</h1>
        <Link href="/admin/bundles/new" className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white">
          Add Bundle
        </Link>
      </div>

      {!bundles || bundles.length === 0 ? (
        <p className="text-ink/60">No bundles yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bundles.map((b) => (
            <Link key={b.id} href={`/admin/bundles/${b.id}/edit`} className="flex items-center justify-between rounded-2xl bg-white/60 p-4 hover:bg-white">
              <div>
                <p className="font-medium text-ink">{b.name}</p>
                {b.badge && <p className="text-xs text-clay-700">{b.badge}</p>}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-ink">{formatPrice(b.price)}</span>
                <span className={b.active ? 'text-forest' : 'text-ink/40'}>{b.active ? 'Active' : 'Inactive'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
