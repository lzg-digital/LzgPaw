import { safeJsonLd } from '@/lib/json-ld';

interface Crumb {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={safeJsonLd(data)} />
  );
}
