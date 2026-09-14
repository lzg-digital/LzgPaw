'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/lib/cart-context';
import { trackEvent } from '@/lib/analytics';
import { clamp } from '@/lib/utils';
import { PriceTag } from '@/components/ui/PriceTag';

interface ProductPurchasePanelProps {
  product: Product;
}

/**
 * Variant model note: `product_variants` is a flat list grouped by
 * `option_name` (e.g. "Color"). This cleanly supports the common
 * single-attribute case (one option name, several values). A product with
 * two independent option dimensions (e.g. Color × Size as a true
 * combination matrix) would need a small schema addition — a
 * `variant_combinations` table, or storing each SKU's full attribute set as
 * JSON — rather than being inferred from this flat shape. Out of scope for
 * the initial single-product catalog this store launches with.
 */
export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const variants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const { addLine, openCart } = useCart();
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const unitPrice = selectedVariant?.price_override ?? product.price;
  const outOfStock =
    product.stock_status === 'out_of_stock' || (selectedVariant ? selectedVariant.stock_quantity <= 0 : false);

  const optionGroups = useMemo(() => {
    const groups = new Map<string, typeof variants>();
    for (const v of variants) {
      const list = groups.get(v.option_name) ?? [];
      list.push(v);
      groups.set(v.option_name, list);
    }
    return Array.from(groups.entries());
  }, [variants]);

  function buildCartLine() {
    const image = product.images?.[0]?.url;
    return {
      key: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      kind: 'product' as const,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantLabel: selectedVariant ? `${selectedVariant.option_name}: ${selectedVariant.option_value}` : undefined,
      image,
      unitPrice,
      slug: product.slug,
    };
  }

  function handleAddToCart() {
    addLine(buildCartLine(), quantity);
    trackEvent('add_to_cart', { productId: product.id, metadata: { quantity, source: 'product_page' } });
    openCart();
  }

  function handleBuyNow() {
    addLine(buildCartLine(), quantity);
    trackEvent('begin_checkout', { productId: product.id, metadata: { source: 'buy_now' } });
    router.push('/checkout');
  }

  return (
    <div className="flex flex-col gap-5">
      <PriceTag price={unitPrice} compareAtPrice={product.compare_at_price} currency={product.currency} size="lg" />

      {optionGroups.map(([optionName, options]) => (
        <div key={optionName}>
          <span className="text-sm font-medium text-ink">{optionName}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedVariantId(option.id)}
                disabled={option.stock_quantity <= 0}
                aria-pressed={selectedVariantId === option.id}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  selectedVariantId === option.id
                    ? 'border-forest bg-forest text-cream'
                    : 'border-forest/25 text-ink hover:border-forest'
                }`}
              >
                {option.option_value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <span className="text-sm font-medium text-ink">Quantity</span>
        <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-forest/25 px-2 py-1.5">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => clamp(q - 1, 1, 20))}
            className="p-1 text-forest"
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="min-w-[2ch] text-center" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => clamp(q + 1, 1, 20))}
            className="p-1 text-forest"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hidden flex-col gap-3 sm:flex">
        <PurchaseButtons outOfStock={outOfStock} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
      </div>

      {/* Sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-forest-100 bg-cream px-4 py-3 shadow-[0_-4px_16px_rgba(23,33,30,0.08)] sm:hidden">
        <div className="flex-1">
          <PriceTag price={unitPrice} compareAtPrice={product.compare_at_price} currency={product.currency} />
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white disabled:bg-forest/20 disabled:text-ink/40"
        >
          {outOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

function PurchaseButtons({
  outOfStock,
  onAddToCart,
  onBuyNow,
}: {
  outOfStock: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onAddToCart}
        disabled={outOfStock}
        className="w-full rounded-full bg-clay py-3.5 text-sm font-semibold text-white transition hover:bg-clay-600 disabled:cursor-not-allowed disabled:bg-forest/20 disabled:text-ink/40"
      >
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
      <button
        type="button"
        onClick={onBuyNow}
        disabled={outOfStock}
        className="w-full rounded-full border border-forest px-6 py-3.5 text-sm font-semibold text-forest transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-40"
      >
        Buy Now
      </button>
    </>
  );
}
