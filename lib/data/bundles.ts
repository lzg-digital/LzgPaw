import { createClient } from '@/lib/supabase/server';
import type { Bundle } from '@/types';

const BUNDLE_SELECT = `
  id, name, slug, description, badge, price, compare_at_price, active, position,
  items:bundle_items(
    id, bundle_id, product_id, quantity,
    product:products(id, name, slug, price, images:product_images(url, alt_text, position, type))
  )
`;

export async function getActiveBundles(): Promise<Bundle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bundles')
    .select(BUNDLE_SELECT)
    .eq('active', true)
    .order('position', { ascending: true });

  if (error || !data) {
    if (error) console.error('[getActiveBundles]', error.message);
    return [];
  }
  return data as unknown as Bundle[];
}

/** Bundles that include a given product — used on the product page's
 * "Bundle & Save" prompt. */
export async function getBundlesForProduct(productId: string): Promise<Bundle[]> {
  const bundles = await getActiveBundles();
  return bundles.filter((b) => b.items?.some((item) => item.product_id === productId));
}
