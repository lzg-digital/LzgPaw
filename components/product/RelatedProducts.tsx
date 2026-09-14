import type { Product } from '@/types';
import { ProductCard } from '@/components/shop/ProductCard';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="container-content py-16">
      <h2 className="mb-8 font-serif text-2xl text-ink sm:text-3xl">You might also like</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
