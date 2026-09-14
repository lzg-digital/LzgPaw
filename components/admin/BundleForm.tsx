'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

interface BundleItemRow {
  product_id: string;
  quantity: number;
}

interface BundleFormProps {
  initialBundle?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    badge?: string | null;
    price: number;
    compare_at_price?: number | null;
    active: boolean;
    position: number;
    items: BundleItemRow[];
  };
}

export function BundleForm({ initialBundle }: BundleFormProps) {
  const router = useRouter();
  const isEdit = !!initialBundle;

  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
  const [name, setName] = useState(initialBundle?.name ?? '');
  const [slug, setSlug] = useState(initialBundle?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initialBundle?.description ?? '');
  const [badge, setBadge] = useState(initialBundle?.badge ?? '');
  const [price, setPrice] = useState(initialBundle?.price ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState(initialBundle?.compare_at_price ?? undefined);
  const [active, setActive] = useState(initialBundle?.active ?? true);
  const [position, setPosition] = useState(initialBundle?.position ?? 0);
  const [items, setItems] = useState<BundleItemRow[]>(initialBundle?.items ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from('products')
      .select('id, name, price')
      .eq('status', 'active')
      .then(({ data }) => setProducts(data ?? []));
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug,
      description: description || undefined,
      badge: badge || null,
      price,
      compare_at_price: compareAtPrice || null,
      active,
      position,
      items,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/bundles/${initialBundle!.id}` : '/api/admin/bundles', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save bundle');
      router.push('/admin/bundles');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save bundle');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-6">
      <label className="flex flex-col gap-1 text-sm text-ink">
        Name
        <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-forest/20 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Slug
        <input required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className="rounded-lg border border-forest/20 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Description
        <textarea value={description ?? ''} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-lg border border-forest/20 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Badge (e.g. MOST POPULAR)
        <input value={badge ?? ''} onChange={(e) => setBadge(e.target.value)} className="rounded-lg border border-forest/20 px-3 py-2" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Bundle price
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-lg border border-forest/20 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Compare-at price (optional — defaults to sum of item prices)
          <input type="number" step="0.01" value={compareAtPrice ?? ''} onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)} className="rounded-lg border border-forest/20 px-3 py-2" />
        </label>
      </div>

      <div>
        <span className="text-sm font-medium text-ink">Items</span>
        <div className="mt-2 flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={item.product_id}
                onChange={(e) => setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, product_id: e.target.value } : row)))}
                className="flex-1 rounded-lg border border-forest/20 px-3 py-2 text-sm"
              >
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, quantity: Number(e.target.value) } : row)))}
                className="w-20 rounded-lg border border-forest/20 px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="p-2 text-ink/40 hover:text-clay">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { product_id: '', quantity: 1 }])}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-forest"
          >
            <Plus size={16} /> Add item
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (visible on storefront)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          Sort position
          <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="w-20 rounded-lg border border-forest/20 px-2 py-1" />
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={saving} className="w-fit rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-60">
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Bundle'}
      </button>
    </form>
  );
}
