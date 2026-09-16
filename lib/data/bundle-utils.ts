import type { Bundle } from '@/types';

/**
 * Calculates the bundle's comparison price when the admin has not set one.
 * This module is safe to import from Client Components because it has no
 * server-only dependencies.
 */
export function bundleComparePrice(bundle: Bundle): number | null {
  if (bundle.compare_at_price != null) return bundle.compare_at_price;
  if (!bundle.items || bundle.items.length === 0) return null;
  return bundle.items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
}
