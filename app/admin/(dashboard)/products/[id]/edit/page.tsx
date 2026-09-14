import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/admin/ProductForm';
import type { AdminProduct } from '@/types';

const ADMIN_PRODUCT_SELECT = `
  id, name, slug, short_description, description, how_to_use, benefits, faq,
  category_id, tags, status, badge, sku, stock_status, stock_quantity,
  video_url, currency, price, compare_at_price, product_cost, shipping_cost,
  other_cost, total_cost, estimated_profit, profit_margin_pct,
  seo_title, seo_description, supplier_name, supplier_notes,
  created_at, updated_at,
  images:product_images(id, url, alt_text, type, position),
  variants:product_variants(id, option_name, option_value, sku, price_override, stock_quantity, position, active)
`;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: product } = await supabase.from('products').select(ADMIN_PRODUCT_SELECT).eq('id', params.id).maybeSingle();

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Edit Product</h1>
      <ProductForm initialProduct={product as unknown as AdminProduct} />
    </div>
  );
}
