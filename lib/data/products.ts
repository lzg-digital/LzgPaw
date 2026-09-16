import { createClient } from '@/lib/supabase/server';
import { escapePostgrestValue } from '@/lib/utils';
import type { Product } from '@/types';

const PRODUCT_SELECT = `
  id, name, slug, short_description, description, how_to_use, benefits, faq,
  category_id, tags, status, badge, sku, stock_status, stock_quantity,
  video_url, currency, price, compare_at_price, seo_title, seo_description,
  created_at, updated_at,
  images:product_images(id, product_id, url, alt_text, type, position),
  variants:product_variants(id, product_id, option_name, option_value, sku, price_override, stock_quantity, position, active),
  category:categories(id, name, slug)
`;

/** Shape of a row from the `product_ratings` view — explicit here so the
 * lookup map below has a concrete value type rather than depending on
 * whatever Supabase's client infers `.select()` to return. */
interface RatingRow {
  product_id: string;
  rating_average: number | null;
  rating_count: number;
}

/** Attaches the genuine, review-derived rating to each product — never a
 * hand-entered number. Products with no approved reviews simply get
 * rating_count: 0 (see database/schema.sql `product_ratings` view). */
async function attachRatings(
  supabase: ReturnType<typeof createClient>,
  products: any[]
): Promise<Product[]> {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const { data: ratings } = await supabase
    .from('product_ratings')
    .select('product_id, rating_average, rating_count')
    .in('product_id', ids);

  const ratingMap = new Map<string, RatingRow>(
    ((ratings ?? []) as RatingRow[]).map((r) => [r.product_id, r])
  );

  return products.map((p) => ({
    ...p,
    images: (p.images ?? []).sort((a: any, b: any) => a.position - b.position),
    variants: (p.variants ?? []).filter((v: any) => v.active).sort((a: any, b: any) => a.position - b.position),
    rating_average: ratingMap.get(p.id)?.rating_average ?? null,
    rating_count: ratingMap.get(p.id)?.rating_count ?? 0,
  }));
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getActiveProducts(
  filters: ProductFilters = {}
): Promise<{ products: Product[]; total: number }> {
  const supabase = createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active');

  if (filters.categorySlug) {
    // Filtering on a joined table's column requires the category id; look
    // it up first rather than trying to filter through the embedded resource.
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .maybeSingle();
    query = query.eq('category_id', category?.id ?? '00000000-0000-0000-0000-000000000000');
  }

  if (filters.search) {
    // SECURITY: `filters.search` is fully attacker-controlled — it comes
    // straight from the public /shop?search= query param, no auth
    // required. It must never be interpolated into this filter string raw;
    // escapePostgrestValue() neutralizes PostgREST's own filter syntax
    // characters (`,`, `.`, `(`, `)`) so a crafted search term can't alter
    // which condition this `.or()` actually expresses.
    const term = filters.search.slice(0, 200);
    const pattern = escapePostgrestValue(`%${term}%`);
    query = query.or(`name.ilike.${pattern},short_description.ilike.${pattern}`);
  }

  if (typeof filters.minPrice === 'number') query = query.gte('price', filters.minPrice);
  if (typeof filters.maxPrice === 'number') query = query.lte('price', filters.maxPrice);
  if (filters.inStockOnly) query = query.in('stock_status', ['in_stock', 'low_stock']);

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('position', { ascending: true }).order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error('[getActiveProducts]', error.message);
    return { products: [], total: 0 };
  }

  const products = await attachRatings(supabase, data ?? []);
  return { products, total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return null;
  const [product] = await attachRatings(supabase, [data]);
  return product ?? null;
}

/** Best Sellers shelf — admin-controlled via `position` and `badge`, never
 * derived from invented sales numbers (section 6 of the build spec). */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return attachRatings(supabase, data);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .neq('id', product.id)
    .limit(limit);

  if (product.category_id) query = query.eq('category_id', product.category_id);

  const { data, error } = await query;
  if (error || !data) return [];
  return attachRatings(supabase, data);
}

export async function getCategories() {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('id, name, slug, description, position').order('position');
  return data ?? [];
}
