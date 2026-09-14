import type { Bundle } from '@/types';

/** Falls back to summing item (price × quantity) when the admin hasn't set
 * an explicit compare_at_price on the bundle — never invents a number. */
export function bundleComparePrice(bundle: Bundle): number | null {
  if (bundle.compare_at_price != null) return bundle.compare_at_price;
  if (!bundle.items || bundle.items.length === 0) return null;
  return bundle.items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
}
