import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition',
            page === currentPage ? 'bg-forest text-cream' : 'text-ink/70 hover:bg-sage'
          )}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
