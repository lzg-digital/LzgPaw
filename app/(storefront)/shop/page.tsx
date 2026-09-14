import type { Metadata } from 'next';
import { getActiveProducts, getCategories } from '@/lib/data/products';
import { Filters } from '@/components/shop/Filters';
import { SortDropdown } from '@/components/shop/SortDropdown';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Pagination } from '@/components/shop/Pagination';

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse the full LzgPaw pet-care lineup.',
  alternates: { canonical: '/shop' },
};

const PAGE_SIZE = 12;

interface ShopPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    page?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ products, total }, categories] = await Promise.all([
    getActiveProducts({
      categorySlug: searchParams.category,
      search: searchParams.search,
      sort: searchParams.sort,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      inStockOnly: searchParams.inStock === '1',
      page,
      pageSize: PAGE_SIZE,
    }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams.inStock) params.set('inStock', searchParams.inStock);
    params.set('page', String(targetPage));
    return `/shop?${params.toString()}`;
  }

  return (
    <div className="container-content py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">
            {searchParams.search ? `Results for “${searchParams.search}”` : 'Shop All'}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {total} product{total === 1 ? '' : 's'}
          </p>
        </div>
        <SortDropdown />
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <Filters categories={categories} />
        <div>
          <ProductGrid products={products} />
          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
