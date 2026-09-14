'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { PricingIntelligence } from '@/components/admin/PricingIntelligence';
import { ListEditor } from '@/components/admin/ListEditor';
import type { AdminProduct } from '@/types';
import type { Category } from '@/types';

interface ImageRow {
  url: string;
  alt_text: string;
  type: 'main' | 'detail' | 'lifestyle' | 'before' | 'after' | 'usage';
  position: number;
}

interface VariantRow {
  option_name: string;
  option_value: string;
  sku: string;
  price_override: string; // kept as string in form state, parsed on submit
  stock_quantity: number;
  position: number;
  active: boolean;
}

interface ProductFormProps {
  initialProduct?: AdminProduct;
}

const IMAGE_TYPES: ImageRow['type'][] = ['main', 'detail', 'lifestyle', 'before', 'after', 'usage'];

export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [categories, setCategories] = useState<Category[]>([]);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [slug, setSlug] = useState(initialProduct?.slug ?? '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [howToUse, setHowToUse] = useState(initialProduct?.how_to_use ?? '');
  const [benefits, setBenefits] = useState<string[]>(initialProduct?.benefits ?? []);
  const [faq, setFaq] = useState(initialProduct?.faq ?? []);
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id ?? '');
  const [tags, setTags] = useState((initialProduct?.tags ?? []).join(', '));
  const [status, setStatus] = useState(initialProduct?.status ?? 'draft');
  const [badge, setBadge] = useState(initialProduct?.badge ?? '');
  const [position, setPosition] = useState(0);
  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [stockStatus, setStockStatus] = useState(initialProduct?.stock_status ?? 'in_stock');
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stock_quantity ?? 0);
  const [videoUrl, setVideoUrl] = useState(initialProduct?.video_url ?? '');
  const [currency, setCurrency] = useState(initialProduct?.currency ?? 'USD');

  const [price, setPrice] = useState(initialProduct?.price ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState(initialProduct?.compare_at_price ?? undefined);
  const [productCost, setProductCost] = useState(initialProduct?.product_cost ?? 0);
  const [shippingCost, setShippingCost] = useState(initialProduct?.shipping_cost ?? 0);
  const [otherCost, setOtherCost] = useState(initialProduct?.other_cost ?? 0);

  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seo_description ?? '');
  const [supplierName, setSupplierName] = useState(initialProduct?.supplier_name ?? '');
  const [supplierNotes, setSupplierNotes] = useState(initialProduct?.supplier_notes ?? '');

  const [images, setImages] = useState<ImageRow[]>(
    (initialProduct?.images ?? []).map((i) => ({ url: i.url, alt_text: i.alt_text, type: i.type, position: i.position }))
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    (initialProduct?.variants ?? []).map((v) => ({
      option_name: v.option_name,
      option_value: v.option_value,
      sku: v.sku ?? '',
      price_override: v.price_override != null ? String(v.price_override) : '',
      stock_quantity: v.stock_quantity,
      position: v.position,
      active: v.active,
    }))
  );

  useEffect(() => {
    createClient()
      .from('categories')
      .select('id, name, slug, description, position')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setImages((prev) => [...prev, { url: data.url, alt_text: '', type: 'detail', position: prev.length }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      product: {
        name,
        slug,
        short_description: shortDescription || undefined,
        description: description || undefined,
        how_to_use: howToUse || undefined,
        benefits: benefits.filter(Boolean),
        faq: faq.filter((f) => f.question && f.answer),
        category_id: categoryId || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        badge: badge || null,
        position,
        sku: sku || null,
        stock_status: stockStatus,
        stock_quantity: stockQuantity,
        video_url: videoUrl || null,
        currency,
        price,
        compare_at_price: compareAtPrice || null,
        product_cost: productCost,
        shipping_cost: shippingCost,
        other_cost: otherCost,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        supplier_name: supplierName || null,
        supplier_notes: supplierNotes || null,
      },
      images,
      variants: variants.map((v) => ({
        ...v,
        sku: v.sku || null,
        price_override: v.price_override ? Number(v.price_override) : null,
      })),
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/products/${(initialProduct as AdminProduct).id}` : '/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save product');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-8">
        <Section title="Basics">
          <TextField label="Name" required value={name} onChange={setName} />
          <TextField label="Slug" required value={slug} onChange={(v) => { setSlug(v); setSlugTouched(true); }} hint="Used in the product URL" />
          <TextField label="Short description" value={shortDescription} onChange={setShortDescription} />
          <TextArea label="Description" value={description} onChange={setDescription} rows={5} />
          <TextArea label="How to use" value={howToUse} onChange={setHowToUse} rows={3} />
        </Section>

        <Section title="Benefits">
          <ListEditor
            items={benefits}
            onChange={setBenefits}
            renderItem={(value, onChange) => (
              <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field flex-1" placeholder="e.g. No batteries" />
            )}
            newItem={() => ''}
          />
        </Section>

        <Section title="FAQ">
          <ListEditor
            items={faq}
            onChange={setFaq}
            newItem={() => ({ question: '', answer: '' })}
            renderItem={(item, onChange) => (
              <div className="flex flex-1 flex-col gap-2">
                <input value={item.question} onChange={(e) => onChange({ ...item, question: e.target.value })} className="input-field" placeholder="Question" />
                <input value={item.answer} onChange={(e) => onChange({ ...item, answer: e.target.value })} className="input-field" placeholder="Answer" />
              </div>
            )}
          />
        </Section>

        <Section title="Organization">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Category
            <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <TextField label="Tags (comma separated)" value={tags} onChange={setTags} />
        </Section>

        <Section title="Media">
          <div className="flex flex-col gap-3">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={img.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <input
                  value={img.alt_text}
                  onChange={(e) => setImages((prev) => prev.map((row, idx) => (idx === i ? { ...row, alt_text: e.target.value } : row)))}
                  placeholder="Alt text"
                  className="input-field flex-1"
                />
                <select
                  value={img.type}
                  onChange={(e) => setImages((prev) => prev.map((row, idx) => (idx === i ? { ...row, type: e.target.value as ImageRow['type'] } : row)))}
                  className="input-field w-32"
                >
                  {IMAGE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="p-2 text-ink/40 hover:text-clay">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-forest/25 px-4 py-2 text-sm text-forest hover:bg-sage">
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Upload image or video'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
            </label>
          </div>
          <TextField label="Product video URL (optional)" value={videoUrl ?? ''} onChange={setVideoUrl} />
        </Section>

        <Section title="Variants">
          <ListEditor
            items={variants}
            onChange={setVariants}
            newItem={() => ({ option_name: 'Color', option_value: '', sku: '', price_override: '', stock_quantity: 0, position: variants.length, active: true })}
            renderItem={(v, onChange) => (
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
                <input value={v.option_name} onChange={(e) => onChange({ ...v, option_name: e.target.value })} placeholder="Option (Color)" className="input-field" />
                <input value={v.option_value} onChange={(e) => onChange({ ...v, option_value: e.target.value })} placeholder="Value (Sage)" className="input-field" />
                <input value={v.sku} onChange={(e) => onChange({ ...v, sku: e.target.value })} placeholder="SKU" className="input-field" />
                <input value={v.price_override} onChange={(e) => onChange({ ...v, price_override: e.target.value })} placeholder="Price override" className="input-field" />
                <input type="number" value={v.stock_quantity} onChange={(e) => onChange({ ...v, stock_quantity: Number(e.target.value) })} placeholder="Stock" className="input-field" />
              </div>
            )}
          />
        </Section>

        <Section title="SEO">
          <TextField label="SEO title" value={seoTitle ?? ''} onChange={setSeoTitle} />
          <TextArea label="SEO description" value={seoDescription ?? ''} onChange={setSeoDescription} rows={2} />
        </Section>

        <Section title="Supplier (internal only — never shown on the storefront)">
          <TextField label="Supplier name" value={supplierName ?? ''} onChange={setSupplierName} />
          <TextArea label="Supplier notes" value={supplierNotes ?? ''} onChange={setSupplierNotes} rows={3} />
        </Section>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="Status">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input-field">
              <option value="draft">Draft</option>
              <option value="active">Active (visible on storefront)</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <TextField label="Badge (e.g. BEST SELLER)" value={badge ?? ''} onChange={setBadge} />
          <NumberField label="Sort position" value={position} onChange={setPosition} />
        </Section>

        <Section title="Inventory">
          <TextField label="SKU" value={sku ?? ''} onChange={setSku} />
          <label className="flex flex-col gap-1 text-sm text-ink">
            Stock status
            <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as typeof stockStatus)} className="input-field">
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="backorder">Backorder</option>
            </select>
          </label>
          <NumberField label="Stock quantity" value={stockQuantity} onChange={setStockQuantity} />
        </Section>

        <Section title="Pricing">
          <TextField label="Currency" value={currency} onChange={setCurrency} />
          <NumberField label="Selling price" value={price} onChange={setPrice} step="0.01" />
          <NumberField label="Compare-at price" value={compareAtPrice ?? 0} onChange={setCompareAtPrice} step="0.01" />
          <NumberField label="Product cost" value={productCost} onChange={setProductCost} step="0.01" />
          <NumberField label="Shipping cost" value={shippingCost} onChange={setShippingCost} step="0.01" />
          <NumberField label="Other cost" value={otherCost} onChange={setOtherCost} step="0.01" />
        </Section>

        <PricingIntelligence productCost={productCost} shippingCost={shippingCost} otherCost={otherCost} sellingPrice={price} />

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={saving} className="rounded-full bg-forest py-3 text-sm font-semibold text-cream disabled:opacity-60">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>

      <style jsx global>{`
        .input-field {
          border: 1px solid rgba(23, 63, 53, 0.2);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input-field:focus {
          border-color: #173f35;
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl bg-white/60 p-5">
      <legend className="px-1 font-serif text-lg text-ink">{title}</legend>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

function TextField({ label, value, onChange, required, hint }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {label}
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {label}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows ?? 4} className="input-field" />
    </label>
  );
}

function NumberField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {label}
      <input type="number" step={step ?? '1'} value={value} onChange={(e) => onChange(Number(e.target.value))} className="input-field" />
    </label>
  );
}
