import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { productSavePayloadSchema } from '@/lib/validation';

const ADMIN_PRODUCT_SELECT = `
  id, name, slug, short_description, description, how_to_use, benefits, faq,
  category_id, tags, status, badge, position, sku, stock_status, stock_quantity,
  video_url, currency, price, compare_at_price, product_cost, shipping_cost,
  other_cost, total_cost, estimated_profit, profit_margin_pct,
  seo_title, seo_description, supplier_name, supplier_notes,
  created_at, updated_at,
  images:product_images(id, url, alt_text, type, position),
  variants:product_variants(id, option_name, option_value, sku, price_override, stock_quantity, position, active)
`;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = productSavePayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid product data' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { product, images, variants } = parsed.data;

  const { data: created, error } = await supabase.from('products').insert(product).select('id').single();
  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? 'Could not create product' }, { status: 500 });
  }

  if (images.length > 0) {
    await supabase.from('product_images').insert(images.map((img) => ({ ...img, product_id: created.id })));
  }
  if (variants.length > 0) {
    await supabase.from('product_variants').insert(variants.map((v) => ({ ...v, product_id: created.id })));
  }

  return NextResponse.json({ id: created.id }, { status: 201 });
}
