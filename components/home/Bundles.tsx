'use client';

import type { Bundle } from '@/types';
import { useCart } from '@/lib/cart-context';
import { trackEvent } from '@/lib/analytics';
import { bundleComparePrice } from '@/lib/data/bundle-utils';
import { formatPrice, savingsAmount, savingsPercent, cn } from '@/lib/utils';
import { ProductBadge } from '@/components/ui/Badge';

interface BundlesProps {
  bundles: Bundle[];
}

export function Bundles({ bundles }: BundlesProps) {
  const { addLine, openCart } = useCart();

  if (bundles.length === 0) return null;

  function handleAdd(bundle: Bundle) {
    const image = bundle.items?.[0]?.product?.images?.sort((a, b) => a.position - b.position)?.[0]?.url;
    addLine(
      {
        key: `bundle-${bundle.id}`,
        kind: 'bundle',
        bundleId: bundle.id,
        name: bundle.name,
        image,
        unitPrice: bundle.price,
        slug: bundle.slug,
      },
      1
    );
    trackEvent('bundle_select', { metadata: { bundleId: bundle.id, bundleName: bundle.name } });
    openCart();
  }

  return (
    <section id="bundles" className="bg-forest py-16 text-cream sm:py-20">
      <div className="container-content">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">Bundle & Save</h2>
          <p className="mt-3 text-cream/70">Stock up once — the more you take home, the more you save per roller.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {bundles.map((bundle) => {
            const comparePrice = bundleComparePrice(bundle);
            const hasSavings = !!comparePrice && comparePrice > bundle.price;
            const highlighted = !!bundle.badge;

            return (
              <div
                key={bundle.id}
                className={cn(
                  'flex flex-col rounded-2xl bg-cream p-6 text-ink shadow-card',
                  highlighted && 'ring-2 ring-clay'
                )}
              >
                {bundle.badge && (
                  <div className="mb-3">
                    <ProductBadge label={bundle.badge} />
                  </div>
                )}
                <h3 className="font-serif text-xl">{bundle.name}</h3>
                {bundle.description && <p className="mt-1 text-sm text-ink/60">{bundle.description}</p>}

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">{formatPrice(bundle.price)}</span>
                  {hasSavings && (
                    <span className="text-sm text-ink/40 line-through">{formatPrice(comparePrice!)}</span>
                  )}
                </div>
                {hasSavings && (
                  <p className="mt-1 text-sm font-medium text-clay-700">
                    Save {formatPrice(savingsAmount(comparePrice!, bundle.price))} (
                    {savingsPercent(comparePrice!, bundle.price)}%)
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleAdd(bundle)}
                  className="mt-6 w-full rounded-full bg-clay py-3 text-sm font-semibold text-white transition hover:bg-clay-600"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
