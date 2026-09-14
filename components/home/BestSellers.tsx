import Link from 'next/link';
import type { Product } from '@/types';
import { ProductCard } from '@/components/shop/ProductCard';

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  return (
    <section className="container-content py-16 sm:py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl text-ink sm:text-4xl">Best Sellers</h2>
        <Link href="/shop" className="whitespace-nowrap text-sm font-medium text-forest underline underline-offset-4">
          View all products
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest/25 px-6 py-16 text-center">
          <p className="text-ink/60">
            Products will appear here as soon as they're published from the admin dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
