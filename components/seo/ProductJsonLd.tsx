import type { Product } from '@/types';
import { safeJsonLd } from '@/lib/json-ld';

interface ProductJsonLdProps {
  product: Product;
  url: string;
}

export function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const image = product.images?.[0]?.url;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description ?? product.description ?? undefined,
    image: image ? [image] : undefined,
    sku: product.sku ?? undefined,
    brand: { '@type': 'Brand', name: 'LzgPaw' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.stock_status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  // Only include aggregateRating when there is at least one genuine review —
  // never fabricate a rating for structured data (same rule as the UI).
  if (product.rating_count && product.rating_count > 0 && product.rating_average) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating_average,
      reviewCount: product.rating_count,
    };
  }

  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={safeJsonLd(data)} />
  );
}
