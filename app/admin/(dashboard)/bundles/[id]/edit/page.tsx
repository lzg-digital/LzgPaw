import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { BundleForm } from '@/components/admin/BundleForm';

export default async function EditBundlePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: bundle } = await supabase
    .from('bundles')
    .select('id, name, slug, description, badge, price, compare_at_price, active, position, items:bundle_items(product_id, quantity)')
    .eq('id', params.id)
    .maybeSingle();

  if (!bundle) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Edit Bundle</h1>
      <BundleForm initialBundle={bundle as any} />
    </div>
  );
}
