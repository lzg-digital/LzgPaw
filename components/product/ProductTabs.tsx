import type { Product, FaqItem } from '@/types';

interface ProductTabsProps {
  product: Product;
  shippingSummary?: string;
  returnsSummary?: string;
}

export function ProductTabs({ product, shippingSummary, returnsSummary }: ProductTabsProps) {
  const sections: { title: string; content: React.ReactNode }[] = [];

  if (product.description) {
    sections.push({ title: 'Description', content: <p className="whitespace-pre-line">{product.description}</p> });
  }
  if (product.how_to_use) {
    sections.push({ title: 'How to Use', content: <p className="whitespace-pre-line">{product.how_to_use}</p> });
  }
  sections.push({
    title: 'Shipping',
    content: (
      <p>
        {shippingSummary ??
          'Shipping times and rates are calculated at checkout based on your delivery address.'}{' '}
        See our <a href="/legal/shipping-policy" className="underline">Shipping Policy</a> for full details.
      </p>
    ),
  });
  sections.push({
    title: 'Returns',
    content: (
      <p>
        {returnsSummary ?? 'See our '}
        <a href="/legal/returns-policy" className="underline">
          Returns Policy
        </a>{' '}
        for eligibility and how to start a return.
      </p>
    ),
  });
  if (product.faq && product.faq.length > 0) {
    sections.push({
      title: 'FAQ',
      content: (
        <dl className="flex flex-col gap-4">
          {product.faq.map((item: FaqItem) => (
            <div key={item.question}>
              <dt className="font-medium text-ink">{item.question}</dt>
              <dd className="mt-1 text-ink/70">{item.answer}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }

  return (
    <div className="divide-y divide-forest-100 border-y border-forest-100">
      {sections.map((section) => (
        <details key={section.title} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-lg text-ink">
            {section.title}
            <span className="text-forest transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-3 text-sm leading-relaxed text-ink/75">{section.content}</div>
        </details>
      ))}
    </div>
  );
}
