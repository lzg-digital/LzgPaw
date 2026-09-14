import { ShieldCheck, Truck, RotateCcw, Headphones, Leaf, Package, type LucideIcon } from 'lucide-react';
import type { SiteSettings } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  truck: Truck,
  returns: RotateCcw,
  support: Headphones,
  leaf: Leaf,
  package: Package,
};

interface TrustStripProps {
  items: SiteSettings['trust_items'];
}

export function TrustStrip({ items }: TrustStripProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="border-y border-forest-100 bg-sage/40">
      <div className="container-content flex flex-wrap justify-center gap-x-10 gap-y-4 divide-x divide-forest/15 py-6">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? ShieldCheck;
          return (
            <div key={item.label} className={`flex items-center gap-2.5 ${i > 0 ? 'pl-10' : ''}`}>
              <Icon size={18} strokeWidth={1.75} />
              <span className="text-sm font-medium text-ink">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
