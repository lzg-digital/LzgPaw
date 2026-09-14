import type { Product } from '@/types';
import { ProductCard } from '@/components/shop/ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-forest/25 px-6 py-16 text-center">
        <p className="text-ink/60">No products match these filters yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
