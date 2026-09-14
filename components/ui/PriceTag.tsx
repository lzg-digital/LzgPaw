import { formatPrice, savingsAmount, savingsPercent } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  size?: 'sm' | 'lg';
}

export function PriceTag({ price, compareAtPrice, currency = 'USD', size = 'sm' }: PriceTagProps) {
  const hasDiscount = !!compareAtPrice && compareAtPrice > price;
  const priceClass = size === 'lg' ? 'text-2xl font-semibold' : 'text-base font-semibold';

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`${priceClass} text-ink`}>{formatPrice(price, currency)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-ink/40 line-through">{formatPrice(compareAtPrice!, currency)}</span>
          <span className="rounded-full bg-clay/10 px-2 py-0.5 text-xs font-medium text-clay-700">
            Save {formatPrice(savingsAmount(compareAtPrice!, price), currency)} ({savingsPercent(compareAtPrice!, price)}%)
          </span>
        </>
      )}
    </div>
  );
}
