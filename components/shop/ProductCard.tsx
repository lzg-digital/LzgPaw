'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/lib/cart-context';
import { trackEvent } from '@/lib/analytics';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { ProductBadge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { PriceTag } from '@/components/ui/PriceTag';
import { Modal } from '@/components/ui/Modal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addLine, openCart } = useCart();
  const mainImage = product.images?.find((i) => i.type === 'main') ?? product.images?.[0];
  const outOfStock = product.stock_status === 'out_of_stock';

  function handleAddToCart() {
    addLine(
      {
        key: product.id,
        kind: 'product',
        productId: product.id,
        name: product.name,
        image: mainImage?.url,
        unitPrice: product.price,
        slug: product.slug,
      },
      1
    );
    trackEvent('add_to_cart', { productId: product.id, metadata: { source: 'product_card' } });
    openCart();
  }

  return (
    <>
      <div className="group flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage">
          <Link href={`/product/${product.slug}`} aria-label={product.name}>
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt_text || product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <MediaPlaceholder label="Product photo coming soon" />
            )}
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            <ProductBadge label={product.badge} />
            {outOfStock && <ProductBadge label="OUT OF STOCK" />}
          </div>

          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink opacity-0 shadow-sm transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Eye size={14} aria-hidden="true" /> Quick View
          </button>
        </div>

        <div className="mt-3 flex flex-1 flex-col gap-1.5">
          <Link href={`/product/${product.slug}`} className="font-medium text-ink hover:text-forest">
            {product.name}
          </Link>
          <StarRating average={product.rating_average} count={product.rating_count} />
          <PriceTag price={product.price} compareAtPrice={product.compare_at_price} currency={product.currency} />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="mt-2 w-full rounded-full bg-clay py-2.5 text-sm font-semibold text-white transition hover:bg-clay-600 disabled:cursor-not-allowed disabled:bg-forest/20 disabled:text-ink/40"
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <Modal open={quickViewOpen} onClose={() => setQuickViewOpen(false)} title={product.name}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-sage">
            {mainImage ? (
              <Image src={mainImage.url} alt={mainImage.alt_text || product.name} fill className="object-cover" />
            ) : (
              <MediaPlaceholder />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-2xl text-ink">{product.name}</h3>
            <StarRating average={product.rating_average} count={product.rating_count} />
            <PriceTag price={product.price} compareAtPrice={product.compare_at_price} currency={product.currency} size="lg" />
            {product.short_description && <p className="text-sm text-ink/70">{product.short_description}</p>}
            <button
              type="button"
              onClick={() => {
                handleAddToCart();
                setQuickViewOpen(false);
              }}
              disabled={outOfStock}
              className="mt-2 w-full rounded-full bg-clay py-3 text-sm font-semibold text-white transition hover:bg-clay-600 disabled:cursor-not-allowed disabled:bg-forest/20 disabled:text-ink/40"
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <Link href={`/product/${product.slug}`} className="text-center text-sm font-medium text-forest underline underline-offset-2">
              View full details
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
