'use client';

import { useState } from 'react';
import type { Category } from '@/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
type FilterCategory = Pick<Category, 'id' | 'name' | 'slug'>;

interface FiltersProps {
  categories: FilterCategory[];
}

export function Filters({ categories }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') ?? '';
  const inStockOnly = searchParams.get('inStock') === '1';
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleCategory(slug: string) {
    pushParams((params) => {
      if (activeCategory === slug) params.delete('category');
      else params.set('category', slug);
    });
  }

  function toggleInStock() {
    pushParams((params) => {
      if (inStockOnly) params.delete('inStock');
      else params.set('inStock', '1');
    });
  }

  function applyPriceRange(e: React.FormEvent) {
    e.preventDefault();
    pushParams((params) => {
      if (minPrice) params.set('minPrice', minPrice);
      else params.delete('minPrice');
      if (maxPrice) params.set('maxPrice', maxPrice);
      else params.delete('maxPrice');
    });
  }

  return (
    <aside className="flex flex-col gap-8">
      {categories.length > 0 && (
        <div>
          <h3 className="font-serif text-lg text-ink">Category</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  aria-pressed={activeCategory === cat.slug}
                  className={`text-sm transition ${
                    activeCategory === cat.slug ? 'font-semibold text-forest' : 'text-ink/70 hover:text-forest'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-serif text-lg text-ink">Price</h3>
        <form onSubmit={applyPriceRange} className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
            className="w-20 rounded-lg border border-forest/20 px-2 py-1.5 text-sm outline-none focus:border-forest"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
            className="w-20 rounded-lg border border-forest/20 px-2 py-1.5 text-sm outline-none focus:border-forest"
          />
          <button type="submit" className="rounded-lg bg-forest px-3 py-1.5 text-xs font-medium text-cream">
            Go
          </button>
        </form>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={toggleInStock}
            className="h-4 w-4 rounded border-forest/30 text-forest focus:ring-forest"
          />
          In stock only
        </label>
      </div>
    </aside>
  );
}
