import Link from 'next/link';
import type { Bundle } from '@/types';
import { bundleComparePrice } from '@/lib/data/bundle-utils';
import { formatPrice, savingsPercent } from '@/lib/utils';

export function BundleOffer({ bundles }: { bundles: Bundle[] }) {
  if (bundles.length === 0) return null;

  return (
    <div className="rounded-2xl bg-sage/50 p-5">
      <p className="text-sm font-semibold text-ink">Bundle & Save</p>
      <ul className="mt-3 flex flex-col gap-2">
        {bundles.map((bundle) => {
          const comparePrice = bundleComparePrice(bundle);
          const pct = comparePrice ? savingsPercent(comparePrice, bundle.price) : 0;
          return (
            <li key={bundle.id} className="flex items-center justify-between text-sm">
              <span className="text-ink/80">{bundle.name}</span>
              <span className="font-medium text-ink">
                {formatPrice(bundle.price)} {pct > 0 && <span className="text-clay-700">· Save {pct}%</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <Link href="/#bundles" className="mt-3 inline-block text-sm font-medium text-forest underline underline-offset-2">
        View bundle details
      </Link>
    </div>
  );
}
