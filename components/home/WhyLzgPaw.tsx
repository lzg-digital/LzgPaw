import { Check } from 'lucide-react';

interface WhyLzgPawProps {
  benefits: string[];
}

export function WhyLzgPaw({ benefits }: WhyLzgPawProps) {
  if (!benefits || benefits.length === 0) return null;

  return (
    <section className="container-content py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <h2 className="font-serif text-3xl text-ink sm:text-4xl">Why LzgPaw</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 rounded-xl bg-sage/50 p-4">
              <Check size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
              <span className="text-sm font-medium text-ink">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
